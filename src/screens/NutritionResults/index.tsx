import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { theme } from "@/src/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FoodItem } from "@/src/components/ReviewItems";
import { Ionicons } from "@expo/vector-icons";
import { NutritionResult, saveMeal } from "@/src/services/databaseService";

export default function NutritionResultsScreen() {
  const { nutritionData, foodItems: foodItemsParam, mealName: mealNameParam } = useLocalSearchParams<{
    nutritionData: string;
    foodItems: string;
    mealName: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  let nutrition: NutritionResult | null = null;
  let foodItems: FoodItem[] = [];
  let mealName = '';

  try {
    nutrition = nutritionData ? JSON.parse(decodeURIComponent(nutritionData)) : null;
    foodItems = foodItemsParam ? JSON.parse(decodeURIComponent(foodItemsParam)) : [];
    mealName = mealNameParam ? decodeURIComponent(mealNameParam) : '';
  } catch (e) {
    console.error('Failed to parse data:', e);
  }

  const handleSave = async () => {
    if (!nutrition || saved) return;

    try {
      setSaving(true);
      
      const mealId = await saveMeal(
        mealName || 'Untitled Meal',
        nutrition.healthScore,
        nutrition.reasoning,
        nutrition.foodItems,
        undefined // Add imagePath if you have it
      );
      
      console.log('Meal saved with ID:', mealId);
      
      setSaved(true);
      Alert.alert("Saved", "Meal logged successfully!", [
        { text: "OK", onPress: () => router.replace("/") }
      ]);
    } catch (error) {
      console.error("Error saving meal:", error);
      Alert.alert("Error", "Failed to save meal. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    router.replace("/");
  };

  if (!nutrition) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>No nutrition data available</Text>
      </View>
    );
  }

  // Calculate total macros from all food items
  const totalMacros = nutrition.foodItems.reduce((acc, item) => ({
    protein: acc.protein + item.macros.protein,
    carbs: acc.carbs + item.macros.carbs,
    fat: acc.fat + item.macros.fat,
    calories: acc.calories + item.macros.calories,
    fiber: acc.fiber + item.macros.fiber,
    sugar: acc.sugar + item.macros.sugar,
    saturatedFat: acc.saturatedFat + item.macros.saturatedFat,
  }), {
    protein: 0,
    carbs: 0,
    fat: 0,
    calories: 0,
    fiber: 0,
    sugar: 0,
    saturatedFat: 0,
  });

  // Collect all unique micros from all food items
  const allMicros = Array.from(
    new Set(
      nutrition.foodItems.flatMap(item => 
        item.micros.map(m => m.name)
      )
    )
  );

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return "🌟";
    if (score >= 60) return "👍";
    if (score >= 40) return "😐";
    return "😬";
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "#4ECDC4";
    if (score >= 40) return "#FFE66D";
    return "#FF6B6B";
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Meal Analysis</Text>
          {mealName ? <Text style={styles.mealName}>{mealName}</Text> : null}
        </View>

        <View style={[styles.scoreCard, { backgroundColor: getScoreColor(nutrition.healthScore) }]}>
          <View style={styles.scoreCardInner}>
            <Text style={styles.scoreEmoji}>{getScoreEmoji(nutrition.healthScore)}</Text>
            <View style={styles.scoreNumbers}>
              <Text style={styles.scoreBig}>{nutrition.healthScore}</Text>
              <Text style={styles.scoreMax}>/100</Text>
            </View>
            <Text style={styles.scoreLabel}>Health Score</Text>
          </View>
          <Text style={styles.reasoning}>{nutrition.reasoning}</Text>
        </View>

        <Text style={styles.sectionTitle}>Nutrition Facts</Text>
        <View style={styles.macrosGrid}>
          <View style={[styles.macroCard, styles.calorieCard]}>
            <Ionicons name="flame" size={24} color="#FF6B6B" />
            <Text style={styles.macroValue}>{Math.round(totalMacros.calories)}</Text>
            <Text style={styles.macroLabel}>Calories</Text>
          </View>
          <View style={[styles.macroCard, styles.proteinCard]}>
            <Ionicons name="fish" size={24} color="#4ECDC4" />
            <Text style={styles.macroValue}>{Math.round(totalMacros.protein)}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={[styles.macroCard, styles.carbCard]}>
            <Ionicons name="leaf" size={24} color="#FFE66D" />
            <Text style={styles.macroValue}>{Math.round(totalMacros.carbs)}g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          <View style={[styles.macroCard, styles.fatCard]}>
            <Ionicons name="water" size={24} color="#A78BFA" />
            <Text style={styles.macroValue}>{Math.round(totalMacros.fat)}g</Text>
            <Text style={styles.macroLabel}>Fat</Text>
          </View>
        </View>

        {/* Extended Macros */}
        {(totalMacros.fiber || totalMacros.sugar) && (
          <View style={styles.extendedMacros}>
            {totalMacros.fiber ? (
              <View style={styles.extendedMacroChip}>
                <Text style={styles.extendedMacroText}>Fiber {Math.round(totalMacros.fiber)}g</Text>
              </View>
            ) : null}
            {totalMacros.sugar ? (
              <View style={styles.extendedMacroChip}>
                <Text style={styles.extendedMacroText}>Sugar {Math.round(totalMacros.sugar)}g</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Good Ingredients */}
        {nutrition.goodIngredients.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
              <Text style={[styles.sectionTitle, styles.goodTitle]}>Good Stuff</Text>
            </View>
            <View style={styles.tagContainer}>
              {nutrition.goodIngredients.map((ingredient, idx) => (
                <View key={idx} style={styles.goodTag}>
                  <Text style={styles.goodTagText}>{ingredient.replace(/_/g, ' ')}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bad Ingredients */}
        {nutrition.badIngredients.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="warning" size={24} color="#FF6B6B" />
              <Text style={[styles.sectionTitle, styles.badTitle]}>Watch Out</Text>
            </View>
            <View style={styles.tagContainer}>
              {nutrition.badIngredients.map((ingredient, idx) => (
                <View key={idx} style={styles.badTag}>
                  <Text style={styles.badTagText}>{ingredient.replace(/_/g, ' ')}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Micronutrients */}
        {allMicros.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="sparkles" size={24} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Vitamins & Minerals</Text>
            </View>
            <View style={styles.tagContainer}>
              {allMicros.map((micro, idx) => (
                <View key={idx} style={styles.microTag}>
                  <Text style={styles.microTagText}>{micro.replace(/_/g, ' ')}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Food Items Summary */}
        {nutrition.foodItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="restaurant" size={24} color={theme.colors.text} />
              <Text style={styles.sectionTitle}>What We Found</Text>
            </View>
            <View style={styles.foodItemsCard}>
              {nutrition.foodItems.map((item, idx) => (
                <View key={idx} style={styles.foodItemRow}>
                  <Text style={styles.foodItemName}>{item.itemName}</Text>
                  <Text style={styles.foodItemQty}>{item.amountGrams}g</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + theme.spacing.md }]}>
        <TouchableOpacity
          style={styles.discardButton}
          onPress={handleDiscard}
        >
          <Text style={styles.discardButtonText}>Discard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, saved && styles.savedButton]}
          onPress={handleSave}
          disabled={saving || saved}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Saving..." : saved ? "Saved" : "Save Meal"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  mealName: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  // Health Score Card
  scoreCard: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: 4,
    borderColor: theme.colors.text,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  scoreCardInner: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  scoreEmoji: {
    fontSize: 40,
    marginRight: theme.spacing.md,
  },
  scoreNumbers: {
    flexDirection: "row",
    alignItems: "baseline",
    flex: 1,
  },
  scoreBig: {
    fontSize: 48,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  scoreMax: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: "rgba(0,0,0,0.3)",
    marginLeft: 4,
  },
  scoreLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    backgroundColor: "rgba(255,255,255,0.5)",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    overflow: "hidden",
  },
  reasoning: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    lineHeight: 22,
    opacity: 0.8,
  },
  // Section
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  // Macros Grid
  macrosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  macroCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 3,
    borderColor: theme.colors.text,
    alignItems: "center",
    shadowColor: theme.colors.text,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  calorieCard: {
    backgroundColor: "#FFE5E5",
  },
  proteinCard: {
    backgroundColor: "#E5FFF9",
  },
  carbCard: {
    backgroundColor: "#FFFDE5",
  },
  fatCard: {
    backgroundColor: "#F3E8FF",
  },
  macroValue: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  macroLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  extendedMacros: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  extendedMacroChip: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    borderColor: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  extendedMacroText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  // Tags
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  goodTag: {
    backgroundColor: "#D1FAE5",
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    borderColor: "#059669",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  goodTagText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: "#059669",
    textTransform: "capitalize",
  },
  badTag: {
    backgroundColor: "#FEE2E2",
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    borderColor: "#DC2626",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  badTagText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: "#DC2626",
    textTransform: "capitalize",
  },
  microTag: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  microTagText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
    textTransform: "capitalize",
  },
  badTitle: {
    color: "#DC2626",
    marginBottom: 0,
  },
  goodTitle: {
    color: "#059669",
    marginBottom: 0,
  },
  // Food Items
  foodItemsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 3,
    borderColor: theme.colors.text,
    padding: theme.spacing.md,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  foodItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  foodItemName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    flex: 1,
  },
  foodItemQty: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  errorText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.error,
    textAlign: "center",
    marginTop: theme.spacing.xl,
  },
  // Buttons
  buttonContainer: {
    flexDirection: "row",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  discardButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 3,
    borderColor: theme.colors.text,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    shadowColor: theme.colors.text,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  discardButtonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  saveButton: {
    flex: 2,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 3,
    borderColor: theme.colors.text,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    shadowColor: theme.colors.text,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  savedButton: {
    backgroundColor: "#4ECDC4",
  },
  saveButtonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
});