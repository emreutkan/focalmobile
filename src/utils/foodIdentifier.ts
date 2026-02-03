import { initializeModel } from "./ModelManagement/modelInitializer";
import { Models } from "../constants";
import { FoodItem } from "../components/ReviewItems";

export interface FoodIdentificationResult {
  isFood: boolean;
  mealName?: string;
  items: FoodItem[];
  message?: string;
}

export const identifyFoodFromImage = async (imageFilePath: string): Promise<FoodIdentificationResult> => {
  const prompt = `Look at this food image. Identify the dish and break down EVERY component.

RULES:
1. Name the dish specifically (Turkish, Indian, Italian, etc.) - e.g. "Adana Kebab", "Chicken Tikka", "Margherita Pizza"
2. List EACH visible component separately with weight in grams:
   - Main protein/meat: what type, how many grams
   - Bread/rice/carbs: what type, how many grams
   - Vegetables: list EACH vegetable separately (not "mixed vegetables")
   - Sauces/sides: list each one
3. Estimate realistic portions based on plate size

JSON format:
{"isFood":true,"mealName":"Adana Kebab Plate","items":[{"name":"Adana Kebab (spiced minced lamb)","quantity":"2 skewers","estimatedGrams":200},{"name":"Lavash Bread","quantity":"2 pieces","estimatedGrams":60},{"name":"Grilled Tomato","quantity":"1 whole","estimatedGrams":80},{"name":"Grilled Pepper","quantity":"2 pieces","estimatedGrams":40},{"name":"Raw Onion","quantity":"sliced","estimatedGrams":30},{"name":"Sumac","quantity":"sprinkled","estimatedGrams":5}]}

If no food: {"isFood":false,"items":[],"message":"No food"}

Analyze the image and respond with JSON only:`;

  try {
    console.log('=== FOOD IDENTIFICATION START ===');
    console.log('Image file path:', imageFilePath);

    const llamaContext = await initializeModel(Models.main);

    const imageUri = imageFilePath.startsWith('file://')
      ? imageFilePath
      : `file://${imageFilePath}`;

    console.log('Image URI for AI:', imageUri);
    console.log('Calling AI completion...');

    const completion = await llamaContext.completion({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: imageUri },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
      temperature: 0.2,
      top_p: 0.9,
      n_predict: 1024,
    });

    const text = completion.text || '';
    console.log('=== AI RESPONSE (FOOD IDENTIFICATION) ===');
    console.log('Full AI response:', text);

    // Check for "no food" indicators in response
    const noFoodIndicators = [
      'no food',
      'not food',
      'no items',
      'cannot identify',
      'not a food',
      'no edible',
      'advertisement',
      'not present',
      'no food items',
    ];

    const lowerText = text.toLowerCase();
    const hasNoFoodIndicator = noFoodIndicators.some(indicator => lowerText.includes(indicator));

    // Try to parse JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('Parsed JSON:', JSON.stringify(parsed, null, 2));

        // Check if explicitly marked as not food
        if (parsed.isFood === false) {
          console.log('AI says no food in image');
          return {
            isFood: false,
            items: [],
            message: parsed.message || "No food detected in this image",
          };
        }

        // Check items array
        if (parsed.items && Array.isArray(parsed.items)) {
          const items: FoodItem[] = parsed.items
            .map((item: any) => ({
              name: item.name || "",
              quantity: item.quantity || "1 serving",
              estimatedGrams: item.estimatedGrams || 0,
            }))
            .filter((item: FoodItem) => {
              // Filter out non-food items
              const invalidNames = ['welcome', 'message', 'text', 'app', 'button', 'image', 'photo', 'advertisement'];
              const isInvalid = invalidNames.some(inv => item.name.toLowerCase().includes(inv));
              return item.name.trim().length > 0 && !isInvalid && item.estimatedGrams > 0;
            });

          if (items.length > 0) {
            console.log('Valid food items:', items.length);
            console.log('Meal name:', parsed.mealName);

            // Generate meal name if not provided
            const mealName = parsed.mealName || generateMealName(items);

            return {
              isFood: true,
              mealName,
              items,
            };
          }
        }
      } catch (parseError) {
        console.warn('Failed to parse JSON:', parseError);
      }
    }

    // If we detected no-food indicators, return no food
    if (hasNoFoodIndicator) {
      return {
        isFood: false,
        items: [],
        message: "No food detected in this image",
      };
    }

    // Fallback: try text extraction
    const extractedItems = extractFoodItemsFromText(text);
    if (extractedItems.length > 0 && extractedItems[0].name !== "Food Item") {
      return {
        isFood: true,
        mealName: generateMealName(extractedItems),
        items: extractedItems,
      };
    }

    // Default: no food detected
    return {
      isFood: false,
      items: [],
      message: "Could not identify any food in this image",
    };

  } catch (error: any) {
    console.error("Error identifying food:", error);
    return {
      isFood: false,
      items: [],
      message: "Error analyzing image",
    };
  }
};

function extractFoodItemsFromText(text: string): FoodItem[] {
  const items: FoodItem[] = [];
  const lowerText = text.toLowerCase();

  // Common food words to look for
  const foodKeywords = [
    'burger', 'pizza', 'salad', 'sandwich', 'chicken', 'beef', 'pork', 'fish',
    'rice', 'pasta', 'bread', 'soup', 'steak', 'fries', 'chips', 'egg',
    'vegetable', 'fruit', 'apple', 'banana', 'orange', 'coffee', 'tea', 'juice',
    'milk', 'cheese', 'yogurt', 'cake', 'cookie', 'ice cream', 'chocolate',
  ];

  for (const keyword of foodKeywords) {
    if (lowerText.includes(keyword)) {
      items.push({
        name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
        quantity: "1 serving",
        estimatedGrams: 100,
      });
    }
  }

  return items;
}

// Generate a meal name from food items if AI didn't provide one
function generateMealName(items: FoodItem[]): string {
  if (items.length === 0) return "Meal";
  if (items.length === 1) return items[0].name;

  // Use first item as main, mention count of others
  const mainItem = items[0].name;
  const otherCount = items.length - 1;

  if (otherCount === 1) {
    return `${mainItem} & ${items[1].name}`;
  }

  return `${mainItem} + ${otherCount} more`;
}
