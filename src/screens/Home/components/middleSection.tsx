import React from "react";
import { StyleSheet, View } from "react-native";
import DailySummaryCard from "@/src/components/Cards/dailySummaryCard";
import ProteinCard from "@/src/components/Cards/proteinCard";
import CarbCard from "@/src/components/Cards/carbCard";
import FatCard from "@/src/components/Cards/fatCard";
import { theme } from "@/src/theme";

interface MiddleSectionProps {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  onCaloriesPress?: () => void;
  onProteinPress?: () => void;
  onCarbsPress?: () => void;
  onFatPress?: () => void;
}

export default function MiddleSection({ 
  calories = 0, 
  protein = 0, 
  carbs = 0, 
  fat = 0,
  onCaloriesPress,
  onProteinPress,
  onCarbsPress,
  onFatPress,
}: MiddleSectionProps) {
  return (
    <View style={styles.container}>
      <DailySummaryCard 
        calories={calories}
        onPress={onCaloriesPress}
      />
      
      <View style={styles.smallCardsContainer}>
        <ProteinCard value={protein} onPress={onProteinPress} />
        <CarbCard value={carbs} onPress={onCarbsPress} />
        <FatCard value={fat} onPress={onFatPress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  smallCardsContainer: {
    marginTop: theme.spacing.md,
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
});