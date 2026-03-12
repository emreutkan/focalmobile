import React, { useMemo } from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { useTheme } from "@/src/contexts/ThemeContext";
import { Theme } from "@/src/theme";
import CardComponent from "@/src/components/Cards/cardComponent";

const { width } = Dimensions.get("window");

interface Props {
  calories?: number;
  target?: number;
  pct?: number;
  onPress?: () => void;
}

export default function DailySummaryCard({ calories = 0, target, pct = 0, onPress }: Props) {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const CARD_WIDTH = width - theme.spacing.md * 2;

  return (
    <CardComponent
      height={200}
      width={CARD_WIDTH}
      backgroundColor={theme.card.dailySummary}
      padding={theme.spacing.md}
      onPress={onPress}
    >
      <View style={styles.container}>
        <Text style={styles.label}>CALORIES</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{Math.round(calories)}</Text>
          <Text style={styles.unit}>kcal</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.targetText}>{target ? `Target: ${Math.round(target)}` : 'No Target'}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(pct, 100)}%` }]} />
          </View>
        </View>
      </View>
    </CardComponent>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  value: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  unit: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginLeft: 4,
  },
  footer: {
    gap: 8,
  },
  targetText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text,
    opacity: 0.6,
  },
  progressBar: {
    height: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.text,
    borderRadius: 6,
  },
});
