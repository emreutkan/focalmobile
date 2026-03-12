import React, { useMemo } from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { useTheme } from "@/src/contexts/ThemeContext";
import { Theme } from "@/src/theme";
import CardComponent from "@/src/components/Cards/cardComponent";

const { width } = Dimensions.get("window");

interface CarbCardProps {
  value?: number;
  target?: number;
  pct?: number;
  onPress?: () => void;
}

export default function CarbCard({ value = 0, target, pct = 0, onPress }: CarbCardProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const CARD_WIDTH = width - theme.spacing.md * 2;
  const SMALL_CARD_HEIGHT = 150;
  const SMALL_CARD_WIDTH = (CARD_WIDTH - theme.spacing.sm * 2) / 3;

  return (
    <CardComponent
      height={SMALL_CARD_HEIGHT}
      width={SMALL_CARD_WIDTH}
      backgroundColor={theme.card.carbCard}
      padding={theme.spacing.sm}
      onPress={onPress}
    >
      <View style={styles.container}>
        <Text style={styles.label}>CARBS</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{Math.round(value)}</Text>
          <Text style={styles.unit}>g</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.targetText}>{target ? `${Math.round(target)}g` : ''}</Text>
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
    fontSize: 10,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginVertical: 4,
  },
  value: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  unit: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginLeft: 2,
  },
  footer: {
    gap: 4,
  },
  targetText: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.text,
    opacity: 0.6,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.text,
    borderRadius: 3,
  },
});
