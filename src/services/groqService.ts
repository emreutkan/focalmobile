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
 */
export async function analyzeImage(
  imageFilePath: string,
): Promise<AI_IMAGE_ANALYSIS_RESPONSE> {
  try {
    const base64Image = await imageToBase64(imageFilePath);
    const mimeType = getImageMimeType(imageFilePath);
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const payloadMB = (dataUrl.length * 0.75) / (1024 * 1024);
    console.log(`[analyzeImage] payload: ${payloadMB.toFixed(2)} MB`);

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

    if (response.error) {
      throw new Error(`Edge Function error: ${response.error.message}`);
    }

    const data =
      typeof response.data === 'string'
        ? JSON.parse(response.data)
        : response.data;

    const result = AiImageAnalysisResponseSchme.safeParse(data);
    if (!result.success) {
      throw new Error(
        `Invalid response: ${JSON.stringify(result.error.issues)}`,
      );
    }
    const parsed = result.data;

    const items: AI_IMAGE_ANALYSIS_FOOD_ITEM[] = (parsed.items || [])
      .map((item: any) => ({
        name: String(item.name || '').trim(),
        estimatedGrams: Number(item.estimatedGrams) || 0,
      }))
      .filter(
        (item: AI_IMAGE_ANALYSIS_FOOD_ITEM) =>
          item.name.length > 0 && item.estimatedGrams > 0,
      );

    return {
      isFood: parsed.isFood,
      mealName: parsed.mealName,
      items,
      message: parsed.message,
    };
  } catch (error: any) {
    console.error(`[analyzeImage] FAILED: ${error.message}`);
    throw error;
  }
}
/**
 * Calculate nutrition for food items using Groq's text model via Supabase Edge Function
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

    if (response.error) {
      throw new Error(`Edge Function error: ${response.error.message}`);
    }

    const data =
      typeof response.data === 'string'
        ? JSON.parse(response.data)
        : response.data;

    const result = NutritionCalculationResponseSchme.safeParse(data);
    if (!result.success) {
      throw new Error(
        `Invalid response: ${JSON.stringify(result.error.issues)}`,
      );
    }

    return result.data;
  } catch (error: any) {
    console.error(`[calculateNutrition] FAILED: ${error.message}`);
    throw error;
  }
}
