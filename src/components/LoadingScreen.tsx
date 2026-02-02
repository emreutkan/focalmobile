import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
} from "react-native-reanimated";
import { theme } from "../theme";

interface LoadingScreenProps {
  message: string;
}

export default function LoadingScreen({ message }: LoadingScreenProps) {
  const pingScale = useSharedValue(1);
  const bounceY = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    // Ping animation (outer circle)
    pingScale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 1000 }),
        withTiming(1, { duration: 0 })
      ),
      -1,
      false
    );

    // Bounce animation (inner circle)
    bounceY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 500 }),
        withTiming(0, { duration: 500 })
      ),
      -1,
      true
    );

    // Rotate animation (message box)
    rotate.value = withRepeat(
      withSequence(
        withTiming(-2, { duration: 2000 }),
        withTiming(2, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const pingStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pingScale.value }],
      opacity: interpolate(pingScale.value, [1, 1.5], [0.2, 0]),
    };
  });

  const bounceStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: bounceY.value }],
    };
  });

  const messageBoxStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotate.value}deg` }],
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.circleContainer}>
        {/* Outer ping circle */}
        <Animated.View style={[styles.outerCircle, pingStyle]} />
        
        {/* Inner bouncing circle */}
        <Animated.View style={[styles.innerCircle, bounceStyle]}>
          <Text style={styles.emoji}>🤔</Text>
        </Animated.View>
      </View>

      <Text style={styles.title}>Thinking...</Text>

      <Animated.View style={[styles.messageBox, messageBoxStyle]}>
        <Text style={styles.messageText}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
  circleContainer: {
    width: 128,
    height: 128,
    marginBottom: theme.spacing.xl,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  outerCircle: {
    position: "absolute",
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: theme.card.dailySummary,
    borderWidth: 4,
    borderColor: theme.colors.text,
  },
  innerCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#FFE66D",
    borderWidth: 4,
    borderColor: theme.colors.text,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    letterSpacing: -0.5,
  },
  messageBox: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
  },
  messageText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    textAlign: "center",
  },
});
