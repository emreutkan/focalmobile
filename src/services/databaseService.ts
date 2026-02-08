// src/utils/nutritionCalculator.ts or wherever you define these

// src/utils/nutritionCalculator.ts

export interface MacroData {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  fiber: number;
  sugar: number;
  saturatedFat: number;
  monounsaturatedFat: number;
  transFat: number;
  sodium: number;
  cholesterol: number;
}

export interface MicroData {
  name: string;
  amount: number;
  unit: 'mg' | 'µg' | 'IU';
}

export interface FoodItemNutrition {
  itemName: string;
  amountGrams: number;
  macros: MacroData;
  micros: MicroData[];
}

export interface NutritionResult {
  healthScore: number;
  reasoning: string;
  badIngredients: string[];
  goodIngredients: string[];
  foodItems: FoodItemNutrition[];
}

// src/services/mealService.ts

import { supabase } from "../lib/supabase";

interface MicronutrientMapping {
  [key: string]: number;
}

let micronutrientCache: MicronutrientMapping | null = null;

// Fetch and cache micronutrient IDs
const getMicronutrientIdByName = async (name: string): Promise<number | null> => {
  if (!micronutrientCache) {
    const { data, error } = await supabase
      .from('micronutrients')
      .select('id, name');
    
    if (error) {
      console.error('Error fetching micronutrients:', error);
      return null;
    }
    
    micronutrientCache = {};
    data.forEach(micro => {
      micronutrientCache![micro.name] = micro.id;
    });
  }
  
  return micronutrientCache[name] || null;
};

export const saveMeal = async (
  mealName: string,
  healthScore: number,
  reasoning: string,
  foodItems: FoodItemNutrition[],
  imagePath?: string
) => {
  // Transform food items for the RPC function
  const transformedFoodItems = await Promise.all(
    foodItems.map(async (item) => {
      // Map micronutrient names to IDs
      const microsWithIds = await Promise.all(
        item.micros.map(async (micro) => {
          const microId = await getMicronutrientIdByName(micro.name);
          if (!microId) {
            console.warn(`Micronutrient ID not found for: ${micro.name}`);
            return null;
          }
          return {
            micronutrient_id: microId,
            amount: micro.amount,
            unit: micro.unit,
          };
        })
      );

      // Filter out nulls (micros that weren't found in DB)
      const validMicros = microsWithIds.filter(m => m !== null);

      return {
        item_name: item.itemName,
        amount_g: item.amountGrams,
        confidence: null, // Can add later if needed
        macros: {
          protein_g: item.macros.protein,
          carbs_g: item.macros.carbs,
          fat_g: item.macros.fat,
          calories: item.macros.calories,
          fiber_g: item.macros.fiber,
          sugar_g: item.macros.sugar,
          saturated_fat_g: item.macros.saturatedFat,
          monounsaturated_fat_g: item.macros.monounsaturatedFat,
          trans_fat_g: item.macros.transFat,
        },
        micros: validMicros,
      };
    })
  );

  const { data, error } = await supabase.rpc('insert_meal_with_items', {
    p_meal_name: mealName,
    p_health_score: healthScore,
    p_health_score_reasoning: reasoning,
    p_image_path: imagePath || null,
    p_food_items: transformedFoodItems,
  });

  if (error) {
    console.error('Error saving meal:', error);
    throw error;
  }
  
  return data; // Returns the meal_id
};