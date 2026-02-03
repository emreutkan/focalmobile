import { initializeModel } from "./ModelManagement/modelInitializer";
import { Models } from "../constants";
import { FoodItem } from "../components/ReviewItems";

export interface NutritionResult {
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    saturatedFat?: number;
    sodium?: number;
    cholesterol?: number;
  };
  micros: string[];
  healthScore: number;
  reasoning: string;
  badIngredients: string[];
  goodIngredients: string[];
}

export const calculateNutrition = async (items: FoodItem[]): Promise<NutritionResult> => {
  // Format items for the prompt with clear gram amounts
  const foodList = items.map(i => `- ${i.name}: ${i.estimatedGrams}g`).join('\n');

  const prompt = `Calculate nutrition for this meal:

${foodList}

Respond with ONLY this JSON (fill in real calculated values):
{"macros":{"calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0,"sugar":0},"micros":["vitamin_a","iron"],"healthScore":75,"reasoning":"Brief explanation","badIngredients":["if any"],"goodIngredients":["protein sources","vegetables"]}

IMPORTANT:
- Calculate realistic calories based on gram weights provided
- Protein: ~4 cal/g, Carbs: ~4 cal/g, Fat: ~9 cal/g
- healthScore: 0-100 (higher = healthier)
- List specific micronutrients present

JSON only:`;

  try {
    console.log('=== NUTRITION CALCULATION START ===');
    console.log('Food items:', JSON.stringify(items, null, 2));

    const llamaContext = await initializeModel(Models.main);

    console.log('Calling AI completion...');

    const completion = await llamaContext.completion({
      prompt: prompt,
      temperature: 0.3,
      top_p: 0.9,
      n_predict: 512,
    });

    const text = completion.text || '';
    console.log('AI response:', text);

    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const json = JSON.parse(jsonMatch[0]);
        console.log('Parsed JSON:', JSON.stringify(json, null, 2));

        return {
          macros: {
            calories: json.macros?.calories || 0,
            protein: json.macros?.protein || 0,
            carbs: json.macros?.carbs || 0,
            fat: json.macros?.fat || 0,
            fiber: json.macros?.fiber || 0,
            sugar: json.macros?.sugar || 0,
            saturatedFat: json.macros?.saturatedFat || 0,
            sodium: json.macros?.sodium || 0,
            cholesterol: json.macros?.cholesterol || 0,
          },
          micros: Array.isArray(json.micros) ? json.micros : [],
          healthScore: json.healthScore || 0,
          reasoning: json.reasoning || "No reasoning provided.",
          badIngredients: Array.isArray(json.badIngredients) ? json.badIngredients : [],
          goodIngredients: Array.isArray(json.goodIngredients) ? json.goodIngredients : [],
        };
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
      }
    }

    // Fallback
    return extractNutritionFromText(text);
  } catch (error: any) {
    console.error("Error calculating nutrition:", error);
    return {
      macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      micros: [],
      healthScore: 0,
      reasoning: "Failed to analyze nutrition.",
      badIngredients: [],
      goodIngredients: [],
    };
  }
};

function extractNutritionFromText(text: string): NutritionResult {
  const result: NutritionResult = {
    macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    micros: [],
    healthScore: 0,
    reasoning: text.substring(0, 200),
    badIngredients: [],
    goodIngredients: [],
  };

  const caloriesMatch = text.match(/calories?[:\s]+(\d+)/i);
  const proteinMatch = text.match(/protein[:\s]+(\d+)/i);
  const carbsMatch = text.match(/carbs?[:\s]+(\d+)/i);
  const fatMatch = text.match(/fat[:\s]+(\d+)/i);
  const scoreMatch = text.match(/health\s*score[:\s]+(\d+)/i);

  if (caloriesMatch) result.macros.calories = parseInt(caloriesMatch[1]);
  if (proteinMatch) result.macros.protein = parseInt(proteinMatch[1]);
  if (carbsMatch) result.macros.carbs = parseInt(carbsMatch[1]);
  if (fatMatch) result.macros.fat = parseInt(fatMatch[1]);
  if (scoreMatch) result.healthScore = parseInt(scoreMatch[1]);

  return result;
}
