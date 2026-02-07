import RNFS from 'react-native-fs';
import { GROQ_API_KEY } from '../config/secrets';

export interface GroqFoodItem {
  name: string;
  quantity: string;
  estimatedGrams: number;
}

export interface GroqFoodIdentificationResult {
  isFood: boolean;
  mealName?: string;
  items: GroqFoodItem[];
  message?: string;
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Convert image file to base64
 */
async function imageToBase64(imagePath: string): Promise<string> {
  // Remove file:// prefix if present
  const cleanPath = imagePath.replace('file://', '');

  // Read file as base64
  const base64 = await RNFS.readFile(cleanPath, 'base64');
  return base64;
}

/**
 * Detect image mime type from file extension
 */
function getImageMimeType(imagePath: string): string {
  const extension = imagePath.toLowerCase().split('.').pop();
  switch (extension) {
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'jpg':
    case 'jpeg':
    default:
      return 'image/jpeg';
  }
}

/**
 * Analyze food image using Groq's vision model
 * This is used for Pro users for faster, cloud-based analysis
 */
export async function analyzeImageWithGroq(
  imageFilePath: string
): Promise<GroqFoodIdentificationResult> {
  try {
    // Convert image to base64
    const base64Image = await imageToBase64(imageFilePath);
    const mimeType = getImageMimeType(imageFilePath);
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const prompt = `Look at this food image and identify ONLY the edible food items.

    RULES:
    1. Name the dish specifically (Turkish, Indian, Italian, etc.)
    2. List ONLY edible food components - ignore plates, utensils, napkins, etc.
    3. Break down each distinct food item separately with weight in grams
    4. Estimate realistic portions based on visual context
    5. Be accurate with gram estimations
    
    JSON format:
    {
      "isFood": true,
      "mealName": "Dish Name",
      "items": [
        {
          "name": "item name",
          "quantity": "1 piece",
          "estimatedGrams": 100
        }
      ]
    }
    
    If no food visible:
    {
      "isFood": false,
      "items": [],
      "message": "No food detected in image"
    }
    
    Analyze the image and respond with ONLY valid JSON, no other text:`;
    

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: dataUrl,
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
        temperature: 0.6,
        max_completion_tokens: 4096,
        top_p: 0.95,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from Groq API');
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to extract JSON from Groq response:', content);
      throw new Error('Invalid response format from Groq');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and filter items
    const items: GroqFoodItem[] = (parsed.items || [])
      .map((item: any) => ({
        name: String(item.name || '').trim(),
        quantity: String(item.quantity || '1 serving'),
        estimatedGrams: Number(item.estimatedGrams) || 0,
      }))
      .filter((item: GroqFoodItem) =>
        item.name.length > 0 &&
        item.estimatedGrams > 0
      );

    return {
      isFood: parsed.isFood !== false,
      mealName: parsed.mealName || generateMealName(items),
      items,
      message: parsed.message,
    };
  } catch (error: any) {
    console.error('Groq analysis error:', error);
    throw new Error(`Failed to analyze image with Groq: ${error.message}`);
  }
}

/**
 * Generate a meal name from items if not provided
 */
function generateMealName(items: GroqFoodItem[]): string {
  if (items.length === 0) return 'Unknown Meal';
  if (items.length === 1) return items[0].name;

  // Use the first item and count
  const mainItem = items[0].name;
  const otherCount = items.length - 1;
  return `${mainItem} with ${otherCount} more item${otherCount > 1 ? 's' : ''}`;
}
