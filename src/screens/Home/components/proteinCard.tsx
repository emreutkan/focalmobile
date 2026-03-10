import React, { useMemo } from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { useTheme } from "@/src/contexts/ThemeContext";
import { Theme } from "@/src/theme";
import CardComponent from "@/src/components/Cards/cardComponent";

const { width } = Dimensions.get("window");

interface ProteinCardProps {
  value?: number;
  onPress?: () => void;
}

export default function ProteinCard({ value = 0, onPress }: ProteinCardProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const CARD_WIDTH = width - theme.spacing.md * 2;
  const SMALL_CARD_HEIGHT = 120;
  const SMALL_CARD_WIDTH = (CARD_WIDTH - theme.spacing.sm * 2) / 3;

  return (
    <CardComponent
      height={SMALL_CARD_HEIGHT}
      width={SMALL_CARD_WIDTH}
      backgroundColor={theme.card.proteinCard}
      padding={theme.spacing.sm}
      onPress={onPress}
    >
      <View style={styles.container}>
        <Text style={styles.label}>PROTEIN</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{Math.round(value)}</Text>
          <Text style={styles.unit}>g</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '0%' }]} />
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
    color: '#FFFFFF',
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
    color: '#FFFFFF',
  },
  unit: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#FFFFFF',
    marginLeft: 2,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
});
