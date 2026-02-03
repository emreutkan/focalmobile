import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity } from "react-native";
import { theme } from "../theme";

interface LoadingScreenProps {
  message?: string;
  showTimer?: boolean;
  onGoPro?: () => void;
}

const FUNNY_MESSAGES = [
  { emoji: "🐌", text: "Your phone is doing its best..." },
  { emoji: "🧓", text: "AI is thinking really hard..." },
  { emoji: "🔥", text: "Phone getting toasty yet?" },
  { emoji: "😅", text: "It's not us, it's your phone!" },
  { emoji: "🐢", text: "Slow and steady wins the race..." },
  { emoji: "🧠", text: "2 billion calculations happening..." },
  { emoji: "📱", text: "Your phone: 'I'm trying!'" },
  { emoji: "💪", text: "Little phone, big dreams..." },
  { emoji: "🎢", text: "Enjoying the wait?" },
  { emoji: "☕", text: "Maybe grab a coffee?" },
  { emoji: "🦥", text: "On-device AI be like..." },
  { emoji: "🚀", text: "Pro users are done by now..." },
];

const EMOJIS_CYCLE = ["🤔", "🧐", "🔍", "👀", "🤨", "💭"];

export default function LoadingScreen({ message, showTimer = true, onGoPro }: LoadingScreenProps) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [elapsedTime, setElapsedTime] = useState(0);
  const [funnyIndex, setFunnyIndex] = useState(0);
  const [emojiIndex, setEmojiIndex] = useState(0);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

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

      {showTimer && (
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>ELAPSED TIME</Text>
          <Text style={styles.timerValue}>{formatTime(elapsedTime)}</Text>
        </View>
      )}

      <View style={styles.funnyBox}>
        <Text style={styles.funnyEmoji}>{currentFunny.emoji}</Text>
        <Text style={styles.funnyText}>{currentFunny.text}</Text>
      </View>

      {message && (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      )}

      <View style={styles.proContainer}>
        <Text style={styles.proHint}>
          Tired of waiting? {"\n"}
          <Text style={styles.proHintBold}>Pro users get instant results!</Text>
        </Text>
        <TouchableOpacity
          style={styles.proButton}
          onPress={onGoPro}
          activeOpacity={0.8}
        >
          <Text style={styles.proButtonText}>GO PRO</Text>
          <Text style={styles.proButtonSubtext}>10x faster</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>
        Running AI on your phone is like{"\n"}
        teaching a hamster quantum physics 🐹
      </Text>
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
  timerContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  timerLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textTertiary,
    letterSpacing: 2,
    marginBottom: theme.spacing.xs,
  },
  timerValue: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
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
  proContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  proHint: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textTertiary,
    textAlign: "center",
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  proHintBold: {
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textSecondary,
  },
  proButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 4,
    borderColor: theme.colors.text,
    alignItems: "center",
    ...theme.shadows.md,
  },
  proButtonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: "#fff",
    letterSpacing: 1,
  },
  proButtonSubtext: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    color: "rgba(255,255,255,0.8)",
  },
  disclaimer: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textTertiary,
    textAlign: "center",
    lineHeight: 16,
    fontStyle: "italic",
  },
});
