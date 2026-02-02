import React from "react";
import { Text, Dimensions } from "react-native";
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
}

export default function DailySummaryCard({ scrollY, sectionY }: Props) {
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
    >
      <Text>Daily Summary Card</Text>
    </CardComponent>
  );
}