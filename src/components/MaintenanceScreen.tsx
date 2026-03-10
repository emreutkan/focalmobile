import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../theme';

const STATUSES = [
  { emoji: '🍕', text: 'Reheating the servers...' },
  { emoji: '🧑‍🍳', text: 'Chef is debugging the kitchen...' },
  { emoji: '🔧', text: 'Tightening the calorie bolts...' },
  { emoji: '😴', text: 'Server is taking a nap...' },
  { emoji: '🐛', text: 'Hunting rogue carbs in the code...' },
  { emoji: '☕', text: 'Someone spilled coffee on the API...' },
  { emoji: '🏋️', text: 'Servers doing maintenance reps...' },
  { emoji: '🤌', text: 'Italian chef-kissing the bugs away...' },
];

export default function MaintenanceScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const wiggleAnim = useRef(new Animated.Value(0)).current;
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -12, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(wiggleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(wiggleAnim, { toValue: -1, duration: 200, useNativeDriver: true }),
        Animated.timing(wiggleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(wiggleAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.delay(2000),
      ])
    ).start();

    const interval = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % STATUSES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const rotate = wiggleAnim.interpolate({ inputRange: [-1, 1], outputRange: ['-8deg', '8deg'] });

  const current = STATUSES[statusIndex];

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.mainEmoji, { transform: [{ translateY: bounceAnim }, { rotate }] }]}>
        🚧
      </Animated.Text>

      <View style={styles.titleBox}>
        <Text style={styles.title}>WE'RE DOWN</Text>
        <Text style={styles.subtitle}>for maintenance</Text>
      </View>

      <View style={styles.messageCard}>
        <Text style={styles.messageEmoji}>{current.emoji}</Text>
        <Text style={styles.messageText}>{current.text}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>CHECK BACK IN A FEW HOURS</Text>
        <Text style={styles.infoBody}>
          We're cooking up something good.{'\n'}Your macros aren't going anywhere.
        </Text>
      </View>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>🥗  FOCAL  •  BACK SOON  🥗</Text>
      </View>
    </View>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  mainEmoji: {
    fontSize: 80,
  },
  titleBox: {
    alignItems: 'center',
    backgroundColor: theme.card.yellowAccent,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.12)',
    borderRadius: theme.borderRadius['2xl'],
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
    letterSpacing: theme.typography.letterSpacing.normal,
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.card.dailySummary,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.12)',
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    width: '100%',
    minHeight: 68,
  },
  messageEmoji: {
    fontSize: 32,
  },
  messageText: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  infoCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    width: '100%',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: theme.typography.letterSpacing.normal,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  infoBody: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  badge: {
    backgroundColor: theme.card.fatCard,
    borderWidth: 3,
    borderColor: theme.colors.text,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  badgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: theme.typography.letterSpacing.normal,
  },
});
