// import { GROQ_API_KEY } from '@/src/config/secrets';
import { imageToBase64, getImageMimeType } from '../utils/imageUtils';
// import {
//   GROQ_MODEL,
//   GROQ_MODEL_TEMPERATURE,
//   GROQ_MODEL_TOP_P,
//   GROQ_MODEL_MAX_COMPLETION_TOKENS,
//   GROQ_FOOD_ANALYSIS_PROMPT,
//   GROQ_NUTRITION_CALCULATION_PROMPT,
// } from '../constants';
import { NutritionResult } from '../services/databaseService';

// export interface GroqFoodItem {
//   name: string;
//   quantity: string;
//   estimatedGrams: number;
// }

// export interface GroqFoodIdentificationResult {
//   isFood: boolean;
//   mealName?: string;
//   items: GroqFoodItem[];
//   message?: string;
// }

// const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Analyze food image using Groq's vision model
 * This is used for Pro users for faster, cloud-based analysis
 */
export async function analyzeImageWithGroq(
  imageFilePath: string,
): Promise<GroqFoodIdentificationResult> {
  try {
    // Convert image to base64
    const base64Image = await imageToBase64(imageFilePath);
    const mimeType = getImageMimeType(imageFilePath);
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const prompt = GROQ_FOOD_ANALYSIS_PROMPT;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
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
        temperature: GROQ_MODEL_TEMPERATURE,
        max_completion_tokens: GROQ_MODEL_MAX_COMPLETION_TOKENS,
        top_p: GROQ_MODEL_TOP_P,
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
      .filter(
        (item: GroqFoodItem) => item.name.length > 0 && item.estimatedGrams > 0,
      );

    return {
      isFood: parsed.isFood !== false,
      mealName: parsed.mealName || 'Unknown Meal',
      items,
      message: parsed.message,
    };
  } catch (error: any) {
    console.error('Groq analysis error:', error);
    throw new Error(`Failed to analyze image with Groq: ${error.message}`);
  }
}

/**
 * Calculate nutrition for food items using Groq's text model
 * This is used for Pro users for faster, cloud-based nutrition analysis
 */
export async function calculateNutritionWithGroq(
  items: { name: string; quantity: string; estimatedGrams: number }[],
): Promise<NutritionResult> {
  try {
    const foodList = items
      .map((i) => `- ${i.name}: ${i.estimatedGrams}g`)
      .join('\n');

    const prompt = `${GROQ_NUTRITION_CALCULATION_PROMPT}

Meal items:
${foodList}`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: GROQ_MODEL_TEMPERATURE,
        max_completion_tokens: GROQ_MODEL_MAX_COMPLETION_TOKENS,
        top_p: GROQ_MODEL_TOP_P,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq nutrition API error:', response.status, errorText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from Groq API');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(
        'Failed to extract JSON from Groq nutrition response:',
        content,
      );
      throw new Error('Invalid response format from Groq');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate that we have foodItems array
    if (!Array.isArray(parsed.foodItems) || parsed.foodItems.length === 0) {
      console.error('Invalid foodItems structure from Groq:', parsed);
      throw new Error('Invalid nutrition data structure from Groq');
    }

    // Transform the response to match our NutritionResult interface
    return {
      healthScore: parsed.healthScore || 0,
      reasoning: parsed.reasoning || 'No reasoning provided.',
      badIngredients: Array.isArray(parsed.badIngredients)
        ? parsed.badIngredients
        : [],
      goodIngredients: Array.isArray(parsed.goodIngredients)
        ? parsed.goodIngredients
        : [],
      foodItems: parsed.foodItems.map((item: any) => ({
        itemName: item.itemName || 'Unknown',
        amountGrams: item.amountGrams || 0,
        macros: {
          protein: item.macros?.protein || 0,
          carbs: item.macros?.carbs || 0,
          fat: item.macros?.fat || 0,
          calories: item.macros?.calories || 0,
          fiber: item.macros?.fiber || 0,
          sugar: item.macros?.sugar || 0,
          saturatedFat: item.macros?.saturatedFat || 0,
          monounsaturatedFat: item.macros?.monounsaturatedFat || 0,
          transFat: item.macros?.transFat || 0,
          sodium: item.macros?.sodium || 0,
          cholesterol: item.macros?.cholesterol || 0,
        },
        micros: Array.isArray(item.micros)
          ? item.micros.map((micro: any) => ({
              name: micro.name || '',
              amount: micro.amount || 0,
              unit: micro.unit || 'mg',
            }))
          : [],
      })),
    };
  } catch (error: any) {
    console.error('Groq nutrition calculation error:', error);
    throw new Error(
      `Failed to calculate nutrition with Groq: ${error.message}`,
    );
  }
}
