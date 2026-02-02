import { initializeModel } from "./ModelManagement/modelInitializer";
import { Models, MICRONUTRIENTS, BAD_INGREDIENTS, GOOD_INGREDIENTS } from "../constants";
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

// Create compact lists for the AI prompt
const MICRO_LIST = MICRONUTRIENTS.slice(0, 30).join(',');
const BAD_LIST = BAD_INGREDIENTS.slice(0, 25).join(',');
const GOOD_LIST = GOOD_INGREDIENTS.slice(0, 25).join(',');

export const calculateNutrition = async (items: FoodItem[]): Promise<NutritionResult> => {
  const prompt = `Analyze nutrition for: ${JSON.stringify(items)}

RESPOND WITH ONLY VALID JSON. NO OTHER TEXT.

Use these reference lists:
MICROS: ${MICRO_LIST}
BAD: ${BAD_LIST}
GOOD: ${GOOD_LIST}

Return this exact JSON structure:
{"macros":{"calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0,"sugar":0,"saturatedFat":0,"sodium":0,"cholesterol":0},"micros":[],"healthScore":0,"reasoning":"","badIngredients":[],"goodIngredients":[]}

Rules:
- calories/protein/carbs/fat/fiber/sugar as numbers (grams, calories for calories)
- saturatedFat/sodium/cholesterol as numbers (grams, mg for sodium/cholesterol)
- micros: array of micronutrients present from the MICROS list
- healthScore: 0-100 based on nutritional quality
- reasoning: brief 1-2 sentence explanation
- badIngredients: items from BAD list if detected (especially for fast food)
- goodIngredients: items from GOOD list if detected`;

  try {
    console.log('=== NUTRITION CALCULATION START ===');
    console.log('Food items sent to AI:', JSON.stringify(items, null, 2));
    console.log('Number of items:', items.length);

    const llamaContext = await initializeModel(Models.main);

    console.log('Calling AI completion for nutrition calculation...');

    const completion = await llamaContext.completion({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2,
      top_p: 0.9,
      n_predict: 1024,
    });

    const text = completion.text || '';
    console.log('=== AI RESPONSE (NUTRITION CALCULATION) ===');
    console.log('Full AI response:', text);
    console.log('Response length:', text.length);

    // Try to extract JSON from the response
    let jsonText = text;

    // Look for JSON object in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
      console.log('Found JSON in response, extracting...');
    } else {
      console.log('No JSON found in response, will try text extraction');
    }

    try {
      const json = JSON.parse(jsonText);
      console.log('Parsed JSON result:', JSON.stringify(json, null, 2));

      // Validate and return the result
      const result: NutritionResult = {
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

      console.log('Final nutrition result:', JSON.stringify(result, null, 2));
      console.log('=== NUTRITION CALCULATION END ===');

      return result;
    } catch (parseError) {
      console.error('Failed to parse JSON from response:', parseError);
      console.log('Attempting text extraction fallback...');
      // Try to extract values from text if JSON parsing fails
      const fallbackResult = extractNutritionFromText(text);
      console.log('Fallback result:', JSON.stringify(fallbackResult, null, 2));
      console.log('=== NUTRITION CALCULATION END (FALLBACK) ===');
      return fallbackResult;
    }
  } catch (error: any) {
    console.error("Error calculating nutrition:", error);
    // Return empty fallback
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

// Fallback function to extract nutrition data from unstructured text
function extractNutritionFromText(text: string): NutritionResult {
  const result: NutritionResult = {
    macros: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      saturatedFat: 0,
      sodium: 0,
      cholesterol: 0,
    },
    micros: [],
    healthScore: 0,
    reasoning: text.substring(0, 200),
    badIngredients: [],
    goodIngredients: [],
  };

  // Try to extract numbers for macros
  const caloriesMatch = text.match(/calories?[:\s]+(\d+)/i);
  const proteinMatch = text.match(/protein[:\s]+(\d+)/i);
  const carbsMatch = text.match(/carbs?[:\s]+(\d+)/i);
  const fatMatch = text.match(/fat[:\s]+(\d+)/i);
  const fiberMatch = text.match(/fiber[:\s]+(\d+)/i);
  const sugarMatch = text.match(/sugar[:\s]+(\d+)/i);
  const scoreMatch = text.match(/health\s*score[:\s]+(\d+)/i);

  if (caloriesMatch) result.macros.calories = parseInt(caloriesMatch[1]);
  if (proteinMatch) result.macros.protein = parseInt(proteinMatch[1]);
  if (carbsMatch) result.macros.carbs = parseInt(carbsMatch[1]);
  if (fatMatch) result.macros.fat = parseInt(fatMatch[1]);
  if (fiberMatch) result.macros.fiber = parseInt(fiberMatch[1]);
  if (sugarMatch) result.macros.sugar = parseInt(sugarMatch[1]);
  if (scoreMatch) result.healthScore = parseInt(scoreMatch[1]);

  return result;
}
