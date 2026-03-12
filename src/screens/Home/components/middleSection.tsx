import React, { useMemo } from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import DailySummaryCard from "./dailySummaryCard";
import ProteinCard from "./proteinCard";
import CarbCard from "./carbCard";
import FatCard from "./fatCard";
import { useTheme } from "@/src/contexts/ThemeContext";
import { Theme } from "@/src/theme";
import type { DailyTotals } from "@/src/services/mealService";
import type { NutritionGap } from "@/src/services/userService";
import CardComponent from "@/src/components/Cards/cardComponent";

interface MiddleSectionProps {
  dailyTotals: DailyTotals;
  gaps: NutritionGap[];
  onCaloriesPress?: () => void;
  onProteinPress?: () => void;
  onCarbsPress?: () => void;
  onFatPress?: () => void;
  onNutrientPress?: (nutrient: string) => void;
}

export default function MiddleSection({ 
  dailyTotals,
  gaps,
  onCaloriesPress,
  onProteinPress,
  onCarbsPress,
  onFatPress,
  onNutrientPress,
}: MiddleSectionProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const getGap = (id: string) => gaps.find(g => g.nutrient_id.toLowerCase().replace(/_/g, '') === id.toLowerCase().replace(/_/g, ''));

  const calorieGap = getGap('calories');
  const proteinGap = getGap('protein');
  const carbGap = getGap('carbs');
  const fatGap = getGap('fat');

  return (
    <View style={styles.container}>
      <View style={styles.dailySummaryContainer}>
        <DailySummaryCard
          calories={dailyTotals.calories}
          target={calorieGap?.target}
          pct={calorieGap?.pct}
          onPress={onCaloriesPress}
        />
      </View>

      <View style={styles.smallCardsContainer}>
        <ProteinCard 
          value={dailyTotals.protein} 
          target={proteinGap?.target}
          pct={proteinGap?.pct}
          plantProtein={dailyTotals.plantProtein} 
          animalProtein={dailyTotals.animalProtein} 
          onPress={onProteinPress} 
        />
        <CarbCard 
          value={dailyTotals.carbs} 
          target={carbGap?.target}
          pct={carbGap?.pct}
          onPress={onCarbsPress} 
        />
        <FatCard 
          value={dailyTotals.fat} 
          target={fatGap?.target}
          pct={fatGap?.pct}
          onPress={onFatPress} 
        />
      </View>

      {/* Other Macros Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>OTHER MACROS</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.horizontalScroll}
        >
          {['fiber', 'sugar', 'saturatedFat', 'cholesterol', 'sodium'].map((id) => {
            const gap = getGap(id);
            const value = id === 'fiber' ? dailyTotals.fiber : 
                          id === 'sugar' ? dailyTotals.sugar :
                          id === 'saturatedFat' ? dailyTotals.saturatedFat :
                          id === 'cholesterol' ? dailyTotals.cholesterol :
                          id === 'sodium' ? dailyTotals.sodium : 0;
            const unit = (id === 'cholesterol' || id === 'sodium') ? 'mg' : 'g';
            const label = id === 'saturatedFat' ? 'SAT FAT' : 
                          id === 'cholesterol' ? 'CHOL' : id.toUpperCase();
            
            return (
              <CardComponent
                key={id}
                backgroundColor={theme.colors.card}
                padding={theme.spacing.sm}
                showPressAnimation={true}
                onPress={() => onNutrientPress?.(id)}
              >
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>{label}</Text>
                  <Text style={styles.nutritionValue}>{Math.round(value)}{unit}</Text>
                  {gap && (
                    <View style={styles.miniProgressBar}>
                      <View style={[styles.miniProgressFill, { width: `${Math.min(gap.pct, 100)}%`, backgroundColor: getStatusColor(gap.status, theme) }]} />
                    </View>
                  )}
                </View>
              </CardComponent>
            );
          })}
        </ScrollView>
      </View>

      {/* Micros Section */}
      {gaps.filter(g => !['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'saturatedfat', 'cholesterol', 'sodium'].includes(g.nutrient_id.toLowerCase().replace(/_/g, ''))).length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>MICRONUTRIENTS</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.horizontalScroll}
          >
            {gaps.filter(g => !['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'saturatedfat', 'cholesterol', 'sodium'].includes(g.nutrient_id.toLowerCase().replace(/_/g, ''))).map((gap, i) => (
              <CardComponent
                key={i}
                backgroundColor={theme.colors.card}
                padding={theme.spacing.sm}
                showPressAnimation={true}
                onPress={() => onNutrientPress?.(gap.nutrient_id)}
              >
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>{gap.nutrient_id.replace(/_/g, ' ')}</Text>
                  <Text style={styles.nutritionValue}>
                    {Number.isInteger(gap.intake) ? gap.intake : gap.intake.toFixed(1)}{gap.unit}
                  </Text>
                  <View style={styles.miniProgressBar}>
                    <View style={[styles.miniProgressFill, { width: `${Math.min(gap.pct, 100)}%`, backgroundColor: getStatusColor(gap.status, theme) }]} />
                  </View>
                </View>
              </CardComponent>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function getStatusColor(status: string, theme: Theme) {
  switch (status) {
    case 'deficient': return theme.colors.error;
    case 'approaching': return theme.colors.warning;
    case 'met': return theme.colors.success;
    case 'exceeded': return '#FF9500'; // Orange
    default: return theme.colors.primary;
  }
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    paddingTop: theme.spacing.md,
  },
  dailySummaryContainer: {
    paddingHorizontal: theme.spacing.md,
  },
  smallCardsContainer: {
    marginTop: theme.spacing.md,
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  sectionContainer: {
    marginTop: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  horizontalScroll: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  nutritionItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
    paddingHorizontal: theme.spacing.xs,
  },
  nutritionLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  nutritionValue: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  miniProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  });