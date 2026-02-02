import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { theme } from "@/src/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NutritionResult } from "@/src/utils/nutritionCalculator";

export default function NutritionResultsScreen() {
  const { nutritionData } = useLocalSearchParams<{ nutritionData: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  let nutrition: NutritionResult | null = null;
  try {
    nutrition = nutritionData ? JSON.parse(decodeURIComponent(nutritionData)) : null;
  } catch (e) {
    console.error('Failed to parse nutrition data:', e);
  }

  if (!nutrition) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>No nutrition data available</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.title}>Nutrition Results</Text>

      {/* Macros Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Macros</Text>
        <View style={styles.macrosGrid}>
          <View style={styles.macroCard}>
            <Text style={styles.macroValue}>{Math.round(nutrition.macros.calories)}</Text>
            <Text style={styles.macroLabel}>Calories</Text>
          </View>
          <View style={styles.macroCard}>
            <Text style={styles.macroValue}>{Math.round(nutrition.macros.protein)}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroCard}>
            <Text style={styles.macroValue}>{Math.round(nutrition.macros.carbs)}g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          <View style={styles.macroCard}>
            <Text style={styles.macroValue}>{Math.round(nutrition.macros.fat)}g</Text>
            <Text style={styles.macroLabel}>Fat</Text>
          </View>
        </View>
      </View>

      {/* Health Score */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Score</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreValue}>{nutrition.healthScore}</Text>
          <Text style={styles.scoreLabel}>/ 100</Text>
        </View>
        <Text style={styles.reasoning}>{nutrition.reasoning}</Text>
      </View>

      {/* Micronutrients */}
      {nutrition.micros.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Micronutrients</Text>
          <View style={styles.listContainer}>
            {nutrition.micros.map((micro, idx) => (
              <View key={idx} style={styles.listItem}>
                <Text style={styles.listText}>• {micro}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Bad Ingredients */}
      {nutrition.badIngredients.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.badTitle]}>⚠️ Bad Ingredients</Text>
          <View style={styles.listContainer}>
            {nutrition.badIngredients.map((ingredient, idx) => (
              <View key={idx} style={styles.listItem}>
                <Text style={[styles.listText, styles.badText]}>• {ingredient}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Good Ingredients */}
      {nutrition.goodIngredients.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.goodTitle]}>✅ Good Ingredients</Text>
          <View style={styles.listContainer}>
            {nutrition.goodIngredients.map((ingredient, idx) => (
              <View key={idx} style={styles.listItem}>
                <Text style={[styles.listText, styles.goodText]}>• {ingredient}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  macrosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },
  macroCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 4,
    borderColor: theme.colors.text,
    alignItems: "center",
    ...theme.shadows.md,
  },
  macroValue: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  macroLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: theme.spacing.md,
  },
  scoreValue: {
    fontSize: theme.typography.fontSize["4xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  scoreLabel: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  reasoning: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  listContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 4,
    borderColor: theme.colors.text,
    padding: theme.spacing.md,
    ...theme.shadows.md,
  },
  listItem: {
    marginBottom: theme.spacing.xs,
  },
  listText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
  },
  badTitle: {
    color: theme.colors.error,
  },
  badText: {
    color: theme.colors.error,
  },
  goodTitle: {
    color: theme.colors.success,
  },
  goodText: {
    color: theme.colors.success,
  },
  errorText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.error,
    textAlign: "center",
    marginTop: theme.spacing.xl,
  },
});
