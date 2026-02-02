import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import { theme } from "../../theme";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const OFFSET = 4;
const CARD_WIDTH = width - theme.spacing.md * 2;
const BORDER_WIDTH = 4;

interface Props {
  scrollY: SharedValue<number>;
  sectionY: SharedValue<number>;
}

export default function DailySummaryCard({ scrollY, sectionY }: Props) {
  // Local interaction values (for press animation)
  const translate = useSharedValue(0);
  const borderOpacity = useSharedValue(1);

  // 1. Main Animation: Shrink Height & Margin based on scroll
  const containerAnimatedStyle = useAnimatedStyle(() => {
    // Calculate "Relative Scroll": How far past the sticky point are we?
    // If < 0 (card is still scrolling up), value is 0.
    const relativeScroll = Math.max(0, scrollY.value - sectionY.value);

    // Interpolate using relativeScroll (0 to 50px)
    const margin = interpolate(relativeScroll, [0, 50], [theme.spacing.md, 0], "clamp");
    const height = interpolate(relativeScroll, [0, 50], [200, 100], "clamp");

    return {
      margin: margin,
      height: height,
      transform: [
        { translateX: translate.value },
        { translateY: translate.value },
      ],
    };
  });

  // 2. Border Animation: Disappears as we scroll
  const borderAnimatedStyle = useAnimatedStyle(() => {
    const relativeScroll = Math.max(0, scrollY.value - sectionY.value);
    const borderWidth = interpolate(relativeScroll, [0, 50], [BORDER_WIDTH, 1], "clamp");

    return {
      opacity: borderOpacity.value,
      borderWidth: borderWidth,
    };
  });

  const shadowAnimatedStyle = useAnimatedStyle(() => {
    const relativeScroll = Math.max(0, scrollY.value - sectionY.value);
    const opacity = interpolate(relativeScroll, [0, 50], [1, 0], "clamp");
    const width = interpolate(relativeScroll, [0, 50], [CARD_WIDTH, 0], "clamp");
    const height = interpolate(relativeScroll, [0, 50], [200, 0], "clamp");
    return {
      opacity: opacity,
      width: width,
      height: height,
    };
  });
  // 3. Interactions
  const pressIn = () => {
    translate.value = withTiming(OFFSET, { duration: 90 });
    borderOpacity.value = withTiming(0, { duration: 60 });
  };

  const pressOut = () => {
    translate.value = withTiming(0, { duration: 140 });
    borderOpacity.value = withTiming(1, { duration: 100 });
  };

  return (
    <View style={styles.outerContainer}>
      <Animated.View style={[styles.shadow, shadowAnimatedStyle]} />

      <Pressable onPressIn={pressIn} onPressOut={pressOut}>
        <Animated.View style={[styles.card, containerAnimatedStyle]}>
          
          <Animated.View style={[styles.border, borderAnimatedStyle]} />
          
          <Text>Daily Summary Card</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: "relative",
  },
  card: {
    backgroundColor: theme.card.dailySummary,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden", // Necessary for height animation to clip content
    justifyContent: "center",
    padding: theme.spacing.sm,
  },
  border: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: theme.borderRadius.lg,
    borderColor: "black",
  },
  shadow: {
    position: "absolute",
    left: theme.spacing.md + OFFSET,
    top: theme.spacing.md + OFFSET,
    backgroundColor: "black",
    borderRadius: theme.borderRadius.lg,
  },
});