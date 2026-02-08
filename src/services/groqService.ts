import { imageToBase64, getImageMimeType } from '../utils/imageUtils';
import { NutritionResult } from '../services/databaseService';
import { supabase } from '../lib/supabase';

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

/**
 * Analyze food image using Groq's vision model via Supabase Edge Function
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

    const session = await supabase.auth.getSession();
    console.log(session.data.session?.access_token);
    const response = await supabase.functions.invoke(
      'groq_image_analysis_service',
      {
        body: { base64image: dataUrl },
        headers: {
          Authorization: `Bearer ${session.data.session?.access_token.replace(' ', '')}`,
        },
      },
    );

    if (response.error) {
      // context is the raw Response object for FunctionsHttpError
      const ctx = response.error.context;
      const status = ctx?.status;
      const statusText = ctx?.statusText || '';
      console.error(
        `Supabase function error [${status} ${statusText}]:`,
        response.error.message,
      );
      throw new Error(
        `API error [${status || 'unknown'} ${statusText}]: ${response.error.message}`,
      );
    }

    if (!response.data) {
      throw new Error('No data returned from Edge Function');
    }

    console.log('Edge Function response data:', response.data);

    // Check if the response indicates an error
    if (response.data.error) {
      throw new Error(`Edge Function error: ${response.data.error}`);
    }

    const data = JSON.parse(response.data);
    console.log('Response data:', data);
    console.log('Response data items:', data.items);
    console.log('Response data isFood:', data.isFood);
    console.log('Response data mealName:', data.mealName);
    console.log('Response data message:', data.message);

    // Validate and filter items
    const items: GroqFoodItem[] = (data.items || [])
      .map((item: any) => ({
        name: String(item.name || '').trim(),
        quantity: String(item.quantity || '1 serving'),
        estimatedGrams: Number(item.estimatedGrams) || 0,
      }))
      .filter(
        (item: GroqFoodItem) => item.name.length > 0 && item.estimatedGrams > 0,
      );

    return {
      isFood: data.isFood !== false,
      mealName: data.mealName || 'Unknown Meal',
      items,
      message: data.message,
    };
  } catch (error: any) {
    console.error('Error analyzing with Groq:', error);
    throw new Error(`Failed to analyze image using API: ${error}`);
  }
}
/**
 * Calculate nutrition for food items using Groq's text model via Supabase Edge Function
 * This is used for Pro users for faster, cloud-based nutrition analysis
 */
export async function calculateNutritionWithGroq(
  items: { name: string; quantity: string; estimatedGrams: number }[],
): Promise<NutritionResult> {
  try {
    const { data, error } = await supabase.functions.invoke(
      'nutrition_calculation_service',
      {
        body: { items },
      },
    );

    if (error) {
      const ctx = error.context;
      const status = ctx?.status;
      const statusText = ctx?.statusText || '';
      console.error(
        `Supabase function error [${status} ${statusText}]:`,
        error.message,
      );
      throw new Error(
        `API error [${status || 'unknown'} ${statusText}]: ${error.message}`,
      );
    }

    if (!data) {
      throw new Error('No data returned from nutrition calculation');
    }

    // Validate that we have foodItems array
    if (!Array.isArray(data.foodItems) || data.foodItems.length === 0) {
      console.error('Invalid foodItems structure from Groq:', data);
      throw new Error('Invalid nutrition data structure from Groq');
    }

    // Transform the response to match our NutritionResult interface
    return {
      healthScore: data.healthScore || 0,
      reasoning: data.reasoning || 'No reasoning provided.',
      badIngredients: Array.isArray(data.badIngredients)
        ? data.badIngredients
        : [],
      goodIngredients: Array.isArray(data.goodIngredients)
        ? data.goodIngredients
        : [],
      foodItems: data.foodItems.map((item: any) => ({
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
