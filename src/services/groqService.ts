import { imageToBase64, getImageMimeType } from '../utils/imageUtils';
import { supabase } from '../lib/supabase';
import {
  AI_IMAGE_ANALYSIS_RESPONSE,
  AI_IMAGE_ANALYSIS_FOOD_ITEM,
  AiImageAnalysisResponseSchme,
  NUTRITION_CALCULATION_RESPONSE,
  NutritionCalculationResponseSchme,
} from '../constants/apiConstants';
/**
 * Analyze food image using Groq's vision model via Supabase Edge Function
 * This is used for Pro users for faster, cloud-based analysis
 */
export async function analyzeImage(
  imageFilePath: string,
): Promise<AI_IMAGE_ANALYSIS_RESPONSE> {
  try {
    // Convert image to base64
    const base64Image = await imageToBase64(imageFilePath);
    const mimeType = getImageMimeType(imageFilePath);
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const session = await supabase.auth.getSession();
    const response = await supabase.functions.invoke(
      'groq_image_analysis_service',
      {
        body: { base64image: dataUrl },
        headers: {
          Authorization: `Bearer ${session.data.session?.access_token}`,
        },
      },
    );

    if (!AiImageAnalysisResponseSchme.safeParse(response.data).success) {
      console.error('Invalid response from Edge Function:', response.data);
      throw new Error(`API error [${response.error.message}`);
    }
    const parsed = AiImageAnalysisResponseSchme.parse(response.data);

    // Validate and filter items
    const items: AI_IMAGE_ANALYSIS_FOOD_ITEM[] = (parsed.items || [])
      .map((item: any) => ({
        name: String(item.name || '').trim(),
        estimatedGrams: Number(item.estimatedGrams) || 0,
      })) // converts item to AI_IMAGE_ANALYSIS_FOOD_ITEM
      .filter(
        (item: AI_IMAGE_ANALYSIS_FOOD_ITEM) =>
          item.name.length > 0 && item.estimatedGrams > 0,
      ); // clears out items with no name or grams lower than 1

    const returnValue: AI_IMAGE_ANALYSIS_RESPONSE = {
      isFood: parsed.isFood,
      mealName: parsed.mealName,
      items,
      message: parsed.message,
    };
    return returnValue;
  } catch (error: any) {
    console.error('Error analyzing with Groq:', error);
    throw new Error(`Failed to analyze image using API: ${error}`);
  }
}
/**
 * Calculate nutrition for food items using Groq's text model via Supabase Edge Function
 * This is used for Pro users for faster, cloud-based nutrition analysis
 */
export async function calculateNutrition(
  items: { name: string; quantity: string; estimatedGrams: number }[],
): Promise<NUTRITION_CALCULATION_RESPONSE> {
  try {
    const session = await supabase.auth.getSession();

    const response = await supabase.functions.invoke(
      'nutrition_calculation_service',
      {
        body: { items },
        headers: {
          Authorization: `Bearer ${session.data.session?.access_token}`,
        },
      },
    );
    if (!NutritionCalculationResponseSchme.safeParse(response.data).success) {
      console.error('Invalid response from Edge Function:', response.data);
      throw new Error(`API error [${response.error.message}`);
    }
    const parsed = NutritionCalculationResponseSchme.parse(response.data);

    const returnValue: NUTRITION_CALCULATION_RESPONSE = {
      healthScore: parsed.healthScore,
      reasoning: parsed.reasoning,
      badIngredients: parsed.badIngredients,
      goodIngredients: parsed.goodIngredients,
      foodItems: parsed.foodItems,
    };
    return returnValue;
  } catch (error: any) {
    console.error('Groq nutrition calculation error:', error);
    throw new Error(
      `Failed to calculate nutrition with Groq: ${error.message}`,
    );
  }
}

// export async function saveMeal();
