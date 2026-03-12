import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Theme } from '@/src/theme';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface PremiumCelebrationProps {
  onComplete: () => void;
}

export default function PremiumCelebration({ onComplete }: PremiumCelebrationProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [currentPhase, setCurrentPhase] = useState(0);

  // Animation values - smooth and intentional
  const containerOpacity = useSharedValue(0);
  const badgeScale = useSharedValue(0.8);
  const badgeOpacity = useSharedValue(0);
  const checkmarkProgress = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const featuresOpacity = useSharedValue(0);
  const progressWidth = useSharedValue(0);
  const exitOpacity = useSharedValue(1);

  // Refined haptic feedback
  const hapticTap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
  }, []);

  const hapticSuccess = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const hapticSoft = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  }, []);

  useEffect(() => {
    // Phase 0: Fade in (0-400ms)
    containerOpacity.value = withTiming(1, { duration: 400 });

    // Phase 1: Badge appears (400-800ms)
    const t1 = setTimeout(() => {
      hapticTap();
      setCurrentPhase(1);
      badgeOpacity.value = withTiming(1, { duration: 300 });
      badgeScale.value = withSpring(1, { damping: 20, stiffness: 300 });
    }, 400);

    // Phase 2: Checkmark draws (800-1200ms)
    const t2 = setTimeout(() => {
      hapticSuccess();
      setCurrentPhase(2);
      checkmarkProgress.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic)
      });
    }, 800);

    // Phase 3: Text appears (1200-1600ms)
    const t3 = setTimeout(() => {
      hapticSoft();
      setCurrentPhase(3);
      textOpacity.value = withTiming(1, { duration: 400 });
    }, 1200);

    // Phase 4: Features list (1600-2400ms)
    const t4 = setTimeout(() => {
      setCurrentPhase(4);
      featuresOpacity.value = withTiming(1, { duration: 400 });
    }, 1600);

    // Phase 5: Progress bar fills (2400-3200ms)
    const t5 = setTimeout(() => {
      hapticSoft();
      progressWidth.value = withTiming(1, {
        duration: 800,
        easing: Easing.inOut(Easing.cubic)
      });
    }, 2400);

    // Haptic rhythm during progress
    const t6 = setTimeout(() => hapticTap(), 2600);
    const t7 = setTimeout(() => hapticTap(), 2800);
    const t8 = setTimeout(() => hapticTap(), 3000);
    const t9 = setTimeout(() => hapticSuccess(), 3200);

    // Phase 6: Exit (4000-4500ms)
    const t10 = setTimeout(() => {
      exitOpacity.value = withTiming(0, { duration: 500 }, (finished) => {
        if (finished) {
          runOnJS(onComplete)();
        }
      });
    }, 4000);

    return () => {
      [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10].forEach(clearTimeout);
    };
  }, []);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value * exitOpacity.value,
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [{ scale: badgeScale.value }],
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    opacity: checkmarkProgress.value,
    transform: [{ scale: interpolate(checkmarkProgress.value, [0, 0.5, 1], [0.5, 1.1, 1]) }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: interpolate(textOpacity.value, [0, 1], [10, 0]) }],
  }));

  const featuresStyle = useAnimatedStyle(() => ({
    opacity: featuresOpacity.value,
    transform: [{ translateY: interpolate(featuresOpacity.value, [0, 1], [20, 0]) }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  const features = [
    { icon: 'infinite', text: 'Unlimited scans', subtext: 'Go wild' },
    { icon: 'flash', text: 'Cloud AI', subtext: 'The fast one' },
    { icon: 'sync', text: 'Sync everywhere', subtext: 'Finally' },
  ];

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.content}>
        {/* Badge */}
        <Animated.View style={[styles.badgeContainer, badgeStyle]}>
          <View style={styles.badgeShadow} />
          <View style={styles.badge}>
            <Ionicons name="diamond" size={32} color={theme.colors.text} />

            {/* Checkmark overlay */}
            <Animated.View style={[styles.checkmarkOverlay, checkmarkStyle]}>
              <View style={styles.checkmarkCircle}>
                <Ionicons name="checkmark" size={18} color={theme.colors.text} />
              </View>
            </Animated.View>
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View style={[styles.textContainer, textStyle]}>
          <Text style={styles.title}>You're Pro now</Text>
          <Text style={styles.subtitle}>Your wallet felt that one</Text>
        </Animated.View>

        {/* Features */}
        <Animated.View style={[styles.featuresContainer, featuresStyle]}>
          {features.map((feature, index) => (
            <View key={feature.text} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons
                  name={feature.icon as any}
                  size={20}
                  color={theme.colors.text}
                />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{feature.text}</Text>
                <Text style={styles.featureSubtext}>{feature.subtext}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressStyle]} />
          </View>
          <Text style={styles.progressText}>Activating premium...</Text>
        </View>

        {/* Bottom text */}
        <Animated.View style={featuresStyle}>
          <Text style={styles.bottomText}>
            Time to scan that midnight snack guilt-free
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    width: '100%',
    maxWidth: 360,
  },
  badgeContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  badgeShadow: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: theme.colors.text,
  },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#FFD700',
    borderWidth: 4,
    borderColor: theme.colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkOverlay: {
    position: 'absolute',
    bottom: -8,
    right: -8,
  },
  checkmarkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4ECDC4',
    borderWidth: 3,
    borderColor: theme.colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  featuresContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.text,
    gap: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.text,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  featureSubtext: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 24,
  },
  progressTrack: {
    height: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.text,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  bottomText: {
    fontSize: 14,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});