import React, { useMemo } from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { useTheme } from "@/src/contexts/ThemeContext";
import { Theme } from "@/src/theme";
import CardComponent from "@/src/components/Cards/cardComponent";

const { width } = Dimensions.get("window");

interface ProteinCardProps {
  value?: number;
  target?: number;
  pct?: number;
  plantProtein?: number;
  animalProtein?: number;
  onPress?: () => void;
}

export default function ProteinCard({ value = 0, target, pct = 0, plantProtein = 0, animalProtein = 0, onPress }: ProteinCardProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const CARD_WIDTH = width - theme.spacing.md * 2;
  const SMALL_CARD_HEIGHT = 150; // Increased height to accommodate target
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
        <View style={styles.proteinSplit}>
          <Text style={styles.splitText}>P {Math.round(plantProtein)}</Text>
          <Text style={styles.splitText}>M {Math.round(animalProtein)}</Text>
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
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginVertical: 2,
  },
  value: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  unit: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#FFFFFF',
    marginLeft: 2,
  },
  proteinSplit: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  splitText: {
    fontSize: 8,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  footer: {
    gap: 4,
  },
  targetText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    opacity: 0.6,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
});
