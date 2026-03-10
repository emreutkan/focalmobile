import React, { useEffect, useRef, useState, useMemo } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { Theme } from "../theme";

interface LoadingScreenProps {
  message?: string;
}

const FUNNY_MESSAGES = [
  { emoji: "🍽️", text: "Interrogating your meal..." },
  { emoji: "🧠", text: "AI chef is on the case..." },
  { emoji: "🔬", text: "Running it through the lab..." },
  { emoji: "📊", text: "Crunching the macros..." },
  { emoji: "🕵️", text: "Identifying every ingredient..." },
  { emoji: "🍎", text: "Cross-referencing 10,000 foods..." },
  { emoji: "⚡", text: "Almost there..." },
  { emoji: "🎯", text: "Calculating with precision..." },
  { emoji: "🌮", text: "No food goes unanalyzed..." },
  { emoji: "💡", text: "AI knows what you ate..." },
];

const EMOJIS_CYCLE = ["🤔", "🧐", "🔍", "👀", "🤨", "💭"];

export default function LoadingScreen({ message }: LoadingScreenProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [funnyIndex, setFunnyIndex] = useState(0);
  const [emojiIndex, setEmojiIndex] = useState(0);

  // Rotate funny messages every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFunnyIndex(prev => (prev + 1) % FUNNY_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Rotate emoji every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setEmojiIndex(prev => (prev + 1) % EMOJIS_CYCLE.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    bounce.start();
    pulse.start();

    return () => {
      bounce.stop();
      pulse.stop();
    };
  }, []);

  const currentFunny = FUNNY_MESSAGES[funnyIndex];

  return (
    <View style={styles.container}>
      <View style={styles.circleContainer}>
        <Animated.View
          style={[
            styles.outerCircle,
            { transform: [{ scale: pulseAnim }] }
          ]}
        />

        <Animated.View
          style={[
            styles.innerCircle,
            { transform: [{ translateY: bounceAnim }] }
          ]}
        >
          <Text style={styles.emoji}>{EMOJIS_CYCLE[emojiIndex]}</Text>
        </Animated.View>
      </View>

      <View style={styles.funnyBox}>
        <Text style={styles.funnyEmoji}>{currentFunny.emoji}</Text>
        <Text style={styles.funnyText}>{currentFunny.text}</Text>
      </View>

      {message && (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      )}

    </View>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
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
    marginBottom: theme.spacing.lg,
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
    opacity: 0.3,
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
  funnyBox: {
    backgroundColor: theme.colors.card,
    borderWidth: 4,
    borderColor: theme.colors.text,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    minHeight: 60,
  },
  funnyEmoji: {
    fontSize: 28,
  },
  funnyText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    flex: 1,
  },
  messageBox: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xl,
  },
  messageText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});
