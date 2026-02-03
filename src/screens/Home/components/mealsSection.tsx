import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { theme } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";

interface Meal {
  id: number;
  meal_name?: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  health_score: number;
  created_at: string;
  foodItems?: Array<{ name: string }>;
}

interface MealsSectionProps {
  meals: Meal[];
  onDeleteMeal?: (mealId: number) => void;
}

export default function MealsSection({ meals, onDeleteMeal }: MealsSectionProps) {
  const getMealName = (meal: Meal) => {
    // First try meal_name from database
    if (meal.meal_name) {
      return meal.meal_name;
    }
    // Fallback to first food item name
    if (meal.foodItems && Array.isArray(meal.foodItems) && meal.foodItems.length > 0) {
      return meal.foodItems[0].name;
    }
    return "Meal";
  };

  const getHealthColor = (score: number) => {
    if (score >= 70) return theme.colors.success || "#4ECDC4";
    if (score >= 40) return theme.colors.warning || "#FFE66D";
    return theme.colors.error || "#FF6B6B";
  };

  if (meals.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Meals</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={styles.emptyTitle}>No meals yet</Text>
          <Text style={styles.emptyText}>Snap a photo of your food to start tracking!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Meals</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{meals.length}</Text>
        </View>
      </View>

      {meals.map((meal) => (
        <View key={meal.id} style={styles.mealCard}>
          <View style={[styles.healthBadge, { backgroundColor: getHealthColor(meal.health_score) }]}>
            <Text style={styles.healthBadgeText}>{Math.round(meal.health_score)}</Text>
          </View>
          <View style={styles.mealInfo}>
            <Text style={styles.mealName}>{getMealName(meal)}</Text>
            <View style={styles.mealDetails}>
              <View style={styles.kcalBadge}>
                <Text style={styles.kcalText}>{Math.round(meal.calories)} kcal</Text>
              </View>
              {meal.foodItems && meal.foodItems.length > 1 && (
                <Text style={styles.moreText}>+{meal.foodItems.length - 1} more</Text>
              )}
            </View>
          </View>
          {onDeleteMeal && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onDeleteMeal(meal.id)}
            >
              <Ionicons name="trash-outline" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.text,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.background,
  },
  mealCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.text,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.md,
  },
  healthBadge: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.text,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  healthBadgeText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: "#FFFFFF",
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  mealDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  kcalBadge: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  kcalText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  moreText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.textSecondary,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.text,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: theme.spacing.sm,
  },
  emptyContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.text,
    borderStyle: "dashed",
    padding: theme.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.md,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});
