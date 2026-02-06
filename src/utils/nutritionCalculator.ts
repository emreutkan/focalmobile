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

JSON only. No markdown, no code fences, no extra text:`;

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

    // Try to extract JSON from the response (use the last valid object)
    const parsed = parseLastValidJson(text);
    if (parsed) {
      console.log('Parsed JSON:', JSON.stringify(parsed, null, 2));

      return {
        macros: {
          calories: parsed.macros?.calories || 0,
          protein: parsed.macros?.protein || 0,
          carbs: parsed.macros?.carbs || 0,
          fat: parsed.macros?.fat || 0,
          fiber: parsed.macros?.fiber || 0,
          sugar: parsed.macros?.sugar || 0,
          saturatedFat: parsed.macros?.saturatedFat || 0,
          sodium: parsed.macros?.sodium || 0,
          cholesterol: parsed.macros?.cholesterol || 0,
        },
        micros: normalizeMicros(parsed.micros),
        healthScore: parsed.healthScore || 0,
        reasoning: parsed.reasoning || "No reasoning provided.",
        badIngredients: Array.isArray(parsed.badIngredients) ? parsed.badIngredients : [],
        goodIngredients: Array.isArray(parsed.goodIngredients) ? parsed.goodIngredients : [],
      };
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

function parseLastValidJson(text: string): any | null {
  const objects = extractJsonObjects(text);
  if (objects.length === 0) return null;

  for (let i = objects.length - 1; i >= 0; i--) {
    try {
      return JSON.parse(objects[i]);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
    }
  }

  return null;
}

function extractJsonObjects(text: string): string[] {
  const results: string[] = [];
  let start = -1;
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escape) {
        escape = false;
      } else if (ch === '\\') {
        escape = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === '{') {
      if (depth === 0) start = i;
      depth += 1;
      continue;
    }

    if (ch === '}') {
      depth -= 1;
      if (depth === 0 && start !== -1) {
        results.push(text.slice(start, i + 1));
        start = -1;
      }
    }
  }

  return results;
}

function normalizeMicros(micros: unknown): string[] {
  if (Array.isArray(micros)) {
    return micros
      .map((m) => (typeof m === 'string' ? m : typeof m === 'object' && m ? Object.keys(m)[0] : ''))
      .filter((m) => m);
  }
  if (micros && typeof micros === 'object') {
    return Object.keys(micros);
  }
  return [];
}

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
