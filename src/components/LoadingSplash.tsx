import { useEffect } from "react";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from "react-native-reanimated";
import { View, Text } from "react-native";
import { theme } from "../theme";
import { StyleSheet } from "react-native";

export default function LoadingSplash() {
  const bounceValue = useSharedValue(0);

  useEffect(() => {
    bounceValue.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounceValue.value }],
  }));

  return (
    <View style={styles.loadingContainer}>
      <Animated.View style={[styles.loadingEmoji, animatedStyle]}>
        <Text style={styles.emoji}>🍕</Text>
      </Animated.View>
      <Text style={styles.loadingText}>LOADING...</Text>
    </View>
  );
}


const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    gap: theme.spacing.lg,
  },
  loadingEmoji: {
    width: 100,
    height: 100,
    backgroundColor: "#FFE66D",
    borderRadius: theme.borderRadius["3xl"],
    borderWidth: theme.borderWidth.thick,
    borderColor: theme.colors.text,
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadows.md,
  },
  emoji: {
    fontSize: 48,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: theme.typography.letterSpacing.normal,
  },
});
