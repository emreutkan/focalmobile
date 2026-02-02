import { initializeModel } from "./ModelManagement/modelInitializer";
import { Models } from "../constants";
import { FoodItem } from "../components/ReviewItems";
import RNFS from "react-native-fs";

export const identifyFoodFromImage = async (imageFilePath: string): Promise<FoodItem[]> => {
  const prompt = `
Analyze this image and identify all food items present. 
For each item, estimate the quantity in a human-readable format (e.g., '1 cup', '150g', '1 burger') and an estimated weight in grams.
Be precise. If it looks like a commercial fast food item (e.g., McDonalds), identify it as such.

Respond in JSON format with this structure:
{
  "items": [
    {
      "name": "food item name",
      "quantity": "estimated quantity (e.g., '1 cup', '150g', '1 burger')",
      "estimatedGrams": number
    }
  ]
}
`;

  try {
    console.log('=== FOOD IDENTIFICATION START ===');
    console.log('Image file path:', imageFilePath);
    console.log('Prompt sent to AI:', prompt);
    
    const llamaContext = await initializeModel(Models.main);
    
    // Use file:// URI format for the image
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
      temperature: 0.7,
      top_p: 0.9,
      n_predict: 512,
    });

    const text = completion.text || '';
    console.log('=== AI RESPONSE (FOOD IDENTIFICATION) ===');
    console.log('Full AI response:', text);
    console.log('Response length:', text.length);

    // Try to parse food items from the response
    try {
      // Look for JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('Found JSON in response, parsing...');
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('Parsed JSON:', JSON.stringify(parsed, null, 2));
        
        if (parsed.items && Array.isArray(parsed.items)) {
          console.log('Found items array with', parsed.items.length, 'items');
          const items: FoodItem[] = parsed.items.map((item: any) => ({
            name: item.name || "",
            quantity: item.quantity || "",
            estimatedGrams: item.estimatedGrams || 0,
          }));
          
          console.log('Mapped food items:', JSON.stringify(items, null, 2));
          
          // Validate items have at least a name
          const validItems = items.filter(item => item.name.trim().length > 0);
          
          console.log('Valid items (after filtering):', validItems.length);
          console.log('=== FOOD IDENTIFICATION END ===');
          
          if (validItems.length > 0) {
            return validItems;
          }
        }
      } else {
        console.log('No JSON found in response, trying text extraction');
      }
    } catch (parseError) {
      console.warn('Failed to parse food items from JSON, trying text extraction:', parseError);
    }

    // Fallback: try to extract food items from unstructured text
    return extractFoodItemsFromText(text);
  } catch (error: any) {
    console.error("Error identifying food:", error);
    return [];
  }
};

// Fallback function to extract food items from unstructured text
function extractFoodItemsFromText(text: string): FoodItem[] {
  const items: FoodItem[] = [];
  
  // Try to find food items mentioned in the text
  // Look for patterns like "name - quantity" or "name (quantity)"
  const patterns = [
    /([A-Za-z\s]+?)\s*[-–]\s*([\d\w\s]+)/g,
    /([A-Za-z\s]+?)\s*\(([\d\w\s]+)\)/g,
    /([A-Za-z\s]+?)\s*:\s*([\d\w\s]+)/g,
  ];

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const name = match[1]?.trim();
      const quantity = match[2]?.trim();
      
      if (name && name.length > 0) {
        // Try to extract grams from quantity
        const gramsMatch = quantity.match(/(\d+)\s*g/i);
        const estimatedGrams = gramsMatch ? parseInt(gramsMatch[1]) : 0;
        
        items.push({
          name,
          quantity: quantity || "1 serving",
          estimatedGrams,
        });
      }
    }
  }

  // If no items found, create a default one
  if (items.length === 0) {
    items.push({
      name: "Food Item",
      quantity: "1 serving",
      estimatedGrams: 0,
    });
  }

  return items;
}
