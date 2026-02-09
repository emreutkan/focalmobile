import { z } from 'zod';

export const AiImageAnalysisResponseSchme = z.object({
  isFood: z.boolean(),
  mealName: z.string().optional(),
  items: z.array(
    z.object({
      name: z.string(),
      estimatedGrams: z.number(),
    }),
  ),
  message: z.string().optional(),
});
export const AiImageAnalysisFoodItemSchme = z.object({
  name: z.string(),
  estimatedGrams: z.number(),
});
export type AI_IMAGE_ANALYSIS_RESPONSE = z.infer<
  typeof AiImageAnalysisResponseSchme
>;
export type AI_IMAGE_ANALYSIS_FOOD_ITEM = z.infer<
  typeof AiImageAnalysisFoodItemSchme
>;

export const NutritionCalculationResponseSchme = z.object({
  healthScore: z.number(),
  reasoning: z.string(),
  badIngredients: z.array(z.string()),
  goodIngredients: z.array(z.string()),
  foodItems: z.array(
    z.object({
      itemName: z.string(),
      amountGrams: z.number(),
      macros: z.object({
        protein: z.number(),
        carbs: z.number(),
        fat: z.number(),
        calories: z.number(),
        fiber: z.number(),
        sugar: z.number(),
        saturatedFat: z.number(),
        monounsaturatedFat: z.number(),
        transFat: z.number(),
        sodium: z.number(),
        cholesterol: z.number(),
      }),
      micros: z.array(
        z.object({
          name: z.string(),
          amount: z.number(),
          unit: z.string(),
        }),
      ),
    }),
  ),
});
export type NUTRITION_CALCULATION_RESPONSE = z.infer<
  typeof NutritionCalculationResponseSchme
>;
