import React from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { theme } from "../../theme";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";
import CardComponent from "./cardComponent";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - theme.spacing.md * 2;
const BORDER_WIDTH = 4;
const OFFSET = 4;

interface Props {
  scrollY: SharedValue<number>;
  sectionY: SharedValue<number>;
  calories?: number;
}

export default function DailySummaryCard({ scrollY, sectionY, calories = 0 }: Props) {
  // Calculate animated height value
  const animatedHeight = useDerivedValue(() => {
    const relativeScroll = Math.max(0, scrollY.value - sectionY.value);
    return interpolate(relativeScroll, [0, 50], [200, 100], "clamp");
  });

  // Calculate animated width value - expands to full width when margin shrinks
  const animatedWidth = useDerivedValue(() => {
    const relativeScroll = Math.max(0, scrollY.value - sectionY.value);
    return interpolate(relativeScroll, [0, 50], [CARD_WIDTH, width], "clamp");
  });

  // 1. Main Animation: Shrink Height & Margin based on scroll
  const containerAnimatedStyle = useAnimatedStyle(() => {
    const relativeScroll = Math.max(0, scrollY.value - sectionY.value);
    const margin = interpolate(relativeScroll, [0, 50], [theme.spacing.md, 0], "clamp");

    return {
      margin: margin,
    };
  });

  // 2. Border Animation: Disappears as we scroll
  const borderAnimatedStyle = useAnimatedStyle(() => {
    const relativeScroll = Math.max(0, scrollY.value - sectionY.value);
    const borderWidth = interpolate(relativeScroll, [0, 50], [BORDER_WIDTH, 1], "clamp");

    return {
      borderWidth: borderWidth,
    };
  });

  const shadowAnimatedStyle = useAnimatedStyle(() => {
    const relativeScroll = Math.max(0, scrollY.value - sectionY.value);
    const opacity = interpolate(relativeScroll, [0, 50], [1, 0], "clamp");
    const shadowWidth = interpolate(relativeScroll, [0, 50], [CARD_WIDTH, 0], "clamp");
    const shadowHeight = interpolate(relativeScroll, [0, 50], [200, 0], "clamp");
    const shadowLeft = interpolate(relativeScroll, [0, 50], [theme.spacing.md + OFFSET, OFFSET], "clamp");
    const shadowTop = interpolate(relativeScroll, [0, 50], [theme.spacing.md + OFFSET, OFFSET], "clamp");
    return {
      opacity: opacity,
      width: shadowWidth,
      height: shadowHeight,
      left: shadowLeft,
      top: shadowTop,
    };
  });

  return (
    <CardComponent
      height={animatedHeight}
      width={animatedWidth}
      backgroundColor={theme.card.dailySummary}
      containerAnimatedStyle={containerAnimatedStyle}
      borderAnimatedStyle={borderAnimatedStyle}
      shadowAnimatedStyle={shadowAnimatedStyle}
      padding={theme.spacing.md}
    >
      <View style={styles.container}>
        <Text style={styles.label}>CALORIES</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{Math.round(calories)}</Text>
          <Text style={styles.unit}>kcal</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '0%' }]} />
        </View>
      </View>
    </CardComponent>
  );
}

const styles = StyleSheet.create({
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
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.text,
    borderRadius: 4,
  },
});