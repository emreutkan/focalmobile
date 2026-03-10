import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import DailySummaryCard from "./dailySummaryCard";
import ProteinCard from "./proteinCard";
import CarbCard from "./carbCard";
import FatCard from "./fatCard";
import { useTheme } from "@/src/contexts/ThemeContext";
import { Theme } from "@/src/theme";

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
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
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

const getStyles = (theme: Theme) => StyleSheet.create({
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