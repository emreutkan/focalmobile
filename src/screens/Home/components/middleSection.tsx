import React, { useMemo } from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import DailySummaryCard from "./dailySummaryCard";
import ProteinCard from "./proteinCard";
import CarbCard from "./carbCard";
import FatCard from "./fatCard";
import { useTheme } from "@/src/contexts/ThemeContext";
import { Theme } from "@/src/theme";
import type { DailyTotals } from "@/src/services/mealService";
import CardComponent from "@/src/components/Cards/cardComponent";

interface MiddleSectionProps {
  dailyTotals: DailyTotals;
  onCaloriesPress?: () => void;
  onProteinPress?: () => void;
  onCarbsPress?: () => void;
  onFatPress?: () => void;
  onNutrientPress?: (nutrient: string) => void;
}

export default function MiddleSection({ 
  dailyTotals,
  onCaloriesPress,
  onProteinPress,
  onCarbsPress,
  onFatPress,
  onNutrientPress,
}: MiddleSectionProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  // Aggregate micros by name (combining amounts with the same name)
  const microsSummary = useMemo(() => {
    const map = new Map<string, { amount: number, unit: string }>();
    dailyTotals.micros.forEach(m => {
      if (map.has(m.name)) {
        map.get(m.name)!.amount += m.amount;
      } else {
        map.set(m.name, { amount: m.amount, unit: m.unit });
      }
    });
    return Array.from(map.entries()).map(([name, data]) => ({ name, ...data }));
  }, [dailyTotals.micros]);

  return (
    <View style={styles.container}>
      <View style={styles.dailySummaryContainer}>
        <DailySummaryCard
          calories={dailyTotals.calories}
          onPress={onCaloriesPress}
        />
      </View>

      <View style={styles.smallCardsContainer}>
        <ProteinCard 
          value={dailyTotals.protein} 
          plantProtein={dailyTotals.plantProtein} 
          animalProtein={dailyTotals.animalProtein} 
          onPress={onProteinPress} 
        />
        <CarbCard value={dailyTotals.carbs} onPress={onCarbsPress} />
        <FatCard value={dailyTotals.fat} onPress={onFatPress} />
      </View>

      {/* Other Macros Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>OTHER MACROS</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.horizontalScroll}
        >
          <CardComponent
            backgroundColor={theme.colors.card}
            padding={theme.spacing.sm}
            showPressAnimation={true}
            onPress={() => onNutrientPress?.('fiber')}
          >
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>FIBER</Text>
              <Text style={styles.nutritionValue}>{Math.round(dailyTotals.fiber)}g</Text>
            </View>
          </CardComponent>

          <CardComponent
            backgroundColor={theme.colors.card}
            padding={theme.spacing.sm}
            showPressAnimation={true}
            onPress={() => onNutrientPress?.('sugar')}
          >
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>SUGAR</Text>
              <Text style={styles.nutritionValue}>{Math.round(dailyTotals.sugar)}g</Text>
            </View>
          </CardComponent>

          <CardComponent
            backgroundColor={theme.colors.card}
            padding={theme.spacing.sm}
            showPressAnimation={true}
            onPress={() => onNutrientPress?.('saturatedFat')}
          >
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>SAT FAT</Text>
              <Text style={styles.nutritionValue}>{Math.round(dailyTotals.saturatedFat)}g</Text>
            </View>
          </CardComponent>

          <CardComponent
            backgroundColor={theme.colors.card}
            padding={theme.spacing.sm}
            showPressAnimation={true}
            onPress={() => onNutrientPress?.('cholesterol')}
          >
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>CHOL</Text>
              <Text style={styles.nutritionValue}>{Math.round(dailyTotals.cholesterol)}mg</Text>
            </View>
          </CardComponent>

          <CardComponent
            backgroundColor={theme.colors.card}
            padding={theme.spacing.sm}
            showPressAnimation={true}
            onPress={() => onNutrientPress?.('sodium')}
          >
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>SODIUM</Text>
              <Text style={styles.nutritionValue}>{Math.round(dailyTotals.sodium)}mg</Text>
            </View>
          </CardComponent>
        </ScrollView>
      </View>

      {/* Micros Section */}
      {microsSummary.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>MICRONUTRIENTS</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.horizontalScroll}
          >
            {microsSummary.map((micro, i) => (
              <CardComponent
                key={i}
                backgroundColor={theme.colors.card}
                padding={theme.spacing.sm}
                showPressAnimation={true}
                onPress={() => onNutrientPress?.(micro.name)}
              >
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>{micro.name.replace(/_/g, ' ')}</Text>
                  <Text style={styles.nutritionValue}>
                    {Number.isInteger(micro.amount) ? micro.amount : micro.amount.toFixed(1)}{micro.unit}
                  </Text>
                </View>
              </CardComponent>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
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
});