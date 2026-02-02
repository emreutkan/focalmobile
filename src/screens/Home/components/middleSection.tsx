import React from "react";
import { StyleSheet, LayoutChangeEvent, View, Dimensions } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
} from "react-native-reanimated";
import DailySummaryCard from "@/src/components/Cards/dailySummaryCard";
import ProteinCard from "@/src/components/Cards/proteinCard";
import CarbCard from "@/src/components/Cards/carbCard";
import FatCard from "@/src/components/Cards/fatCard";
import { theme } from "@/src/theme";

const DAILY_CARD_INITIAL_HEIGHT = 200;
const DAILY_CARD_FINAL_HEIGHT = 100;
const SCROLL_THRESHOLD = 50; // How much scroll to complete the animation

export default function MiddleSection({ scrollY }: { scrollY: SharedValue<number> }) {
  // This value will store the vertical position (Y) of this section on the screen
  const sectionY = useSharedValue(0);
  const smallCardsY = useSharedValue(0);

  const stickyStyle = useAnimatedStyle(() => {
    // Calculate how far we have scrolled past this section's top edge
    const diff = scrollY.value - sectionY.value;
    const translateY = Math.max(0, diff);

    return {
      transform: [{ translateY }],
      zIndex: 100,
    };
  });

  // Animate small cards to move up and stick to daily summary card
  const smallCardsStyle = useAnimatedStyle(() => {
    const relativeScroll = Math.max(0, scrollY.value - sectionY.value);
    
    // Calculate how much the daily card has shrunk (100px difference)
    const heightDifference = DAILY_CARD_INITIAL_HEIGHT - DAILY_CARD_FINAL_HEIGHT;
    
    // Animate marginTop from theme.spacing.md to 0 to remove gap
    const marginTop = interpolate(
      relativeScroll,
      [0, SCROLL_THRESHOLD],
      [theme.spacing.md, 0],
      "clamp"
    );
    
    // Move up by height difference to account for daily card shrinking
    const translateY = interpolate(
      relativeScroll,
      [0, SCROLL_THRESHOLD],
      [0, -heightDifference],
      "clamp"
    );

    return {
      marginTop: marginTop,
      transform: [{ translateY }],
    };
  });

  const onLayout = (e: LayoutChangeEvent) => {
    // Capture the initial Y position of the section
    sectionY.value = e.nativeEvent.layout.y;
  };

  const onSmallCardsLayout = (e: LayoutChangeEvent) => {
    // Capture the initial Y position of the small cards container
    smallCardsY.value = e.nativeEvent.layout.y;
  };

  return (
    <Animated.View 
      style={[styles.container, stickyStyle]} 
      onLayout={onLayout}
    >
      {/* Pass both scrollY and sectionY so the card knows when to shrink */}
      <DailySummaryCard scrollY={scrollY} sectionY={sectionY} />
      
      <Animated.View 
        style={[styles.smallCardsContainer, smallCardsStyle]}
        onLayout={onSmallCardsLayout}
      >
        <ProteinCard />
        <CarbCard />
        <FatCard />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 100,
  },
  smallCardsContainer: {
    marginHorizontal: theme.spacing.md,
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
});