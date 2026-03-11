import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMealsToday,
  getMealById,
  saveMeal,
  deleteMeal,
  deleteAllMeals,
  type NutritionFoodItem,
} from '../services/mealService';

export const MEALS_TODAY_KEY = ['meals', 'today'] as const;

export function useMealsToday() {
  return useQuery({
    queryKey: MEALS_TODAY_KEY,
    queryFn: getMealsToday,
  });
}

export function useMealById(id: string) {
  return useQuery({
    queryKey: ['meal', id],
    queryFn: () => getMealById(id),
    enabled: !!id,
  });
}

export function useSaveMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      mealName: string;
      healthScore: number;
      reasoning: string;
      badIngredients: string[];
      goodIngredients: string[];
      foodItems: NutritionFoodItem[];
    }) => saveMeal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEALS_TODAY_KEY });
    },
  });
}

export function useDeleteMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMeal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEALS_TODAY_KEY });
    },
  });
}

export function useDeleteAllMeals() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAllMeals,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEALS_TODAY_KEY });
    },
  });
}
