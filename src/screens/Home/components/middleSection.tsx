import React from "react";
import { StyleSheet, LayoutChangeEvent } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import DailySummaryCard from "@/src/components/Cards/dailySummaryCard";

export default function MiddleSection({ scrollY }: { scrollY: SharedValue<number> }) {
  // This value will store the vertical position (Y) of this section on the screen
  const sectionY = useSharedValue(0);

  const stickyStyle = useAnimatedStyle(() => {
    // 1. Calculate how far we have scrolled past this section's top edge
    //    (e.g., if section is at 200px and we scrolled 250px, diff is 50px)
    const diff = scrollY.value - sectionY.value;

    // 2. If diff > 0, it means we have scrolled past the card.
    //    We translate it DOWN by exactly that amount to counteract the scroll 
    //    and keep it fixed at the top of the viewport (y=0).
    const translateY = Math.max(0, diff);

    return {
      transform: [{ translateY }],
      zIndex: 100, // Essential so the sticky card floats above items scrolling under it
    };
  });

  const onLayout = (e: LayoutChangeEvent) => {
    // Capture the initial Y position of the section
    sectionY.value = e.nativeEvent.layout.y;
  };

  return (
    <Animated.View 
      style={[styles.container, stickyStyle]} 
      onLayout={onLayout}
    >
      {/* Pass both scrollY and sectionY so the card knows when to shrink */}
      <DailySummaryCard scrollY={scrollY} sectionY={sectionY} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Relative position allows zIndex to work correctly
    position: "relative",
    zIndex: 100, 
  },
});