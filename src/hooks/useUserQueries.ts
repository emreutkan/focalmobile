import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, UserProfile, NutritionTarget } from '../services/userService';

export function useUserProfile() {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: () => userService.getProfile(),
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profile: UserProfile) => userService.updateProfile(profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['nutritionGaps'] });
    },
  });
}

export function useNutritionTargets() {
  return useQuery({
    queryKey: ['nutritionTargets'],
    queryFn: () => userService.getTargets(),
  });
}

export function useUpdateNutritionTarget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ nutrientId, targetAmount, unit }: { nutrientId: string; targetAmount: number; unit: string }) =>
      userService.updateTarget(nutrientId, targetAmount, unit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutritionTargets'] });
      queryClient.invalidateQueries({ queryKey: ['nutritionGaps'] });
    },
  });
}

export function useResetNutritionTarget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nutrientId: string) => userService.resetTarget(nutrientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutritionTargets'] });
      queryClient.invalidateQueries({ queryKey: ['nutritionGaps'] });
    },
  });
}

export function useNutritionGaps() {
  return useQuery({
    queryKey: ['nutritionGaps'],
    queryFn: () => userService.getTodayGaps(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
