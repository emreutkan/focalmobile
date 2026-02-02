import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
} from "react-native";
import { theme } from "../../theme";
import { interpolate, SharedValue, useDerivedValue } from "react-native-reanimated";

const { width } = Dimensions.get("window");
const OFFSET = 4;
const CARD_WIDTH = width - theme.spacing.md * 2;
const BORDER_WIDTH = 4;

export default function DailySummaryCard({ scrollY }: { scrollY: SharedValue<number> }) {
  const translate = useRef(new Animated.Value(0)).current;
  const borderOpacity = useRef(new Animated.Value(1)).current;

  const CardMargin = useDerivedValue(() => {
    return interpolate(scrollY.value, [0, 50], [theme.spacing.md, 0]);
  });
  const CardHeight = useDerivedValue(() => {
    return interpolate(scrollY.value, [0, 50], [100, 0]);
  });
  const CardBorderWidth = useDerivedValue(() => {
    return interpolate(scrollY.value, [0, 50], [BORDER_WIDTH, 0]);
  });

  const pressIn = () => {
    Animated.parallel([
      Animated.timing(translate, {
        toValue: OFFSET,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(borderOpacity, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const pressOut = () => {
    Animated.parallel([
      Animated.timing(translate, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(borderOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.outerContainer}>
      {/* Static shadow */}
      <View style={styles.shadow} />

      <Pressable onPressIn={pressIn} onPressOut={pressOut}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { translateX: translate },
                { translateY: translate },
              ],
            },
          ]}
        >
          {/* Animated border overlay */}
          <Animated.View
            style={[
              styles.border,
              { opacity: borderOpacity },
            ]}
          />
          
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
    margin: theme.spacing.md,
    backgroundColor: theme.card.dailySummary,
    borderRadius: theme.borderRadius.lg,
    height: 100,
  },
  border: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: theme.borderRadius.lg,
    borderWidth: BORDER_WIDTH,
    borderColor: "black",
  },
  shadow: {
    position: "absolute",
    left: theme.spacing.md + OFFSET,
    top: theme.spacing.md + OFFSET,
    width: CARD_WIDTH,
    height: 100,
    backgroundColor: "black",
    borderRadius: theme.borderRadius.lg,
  },
});