import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../theme';
import { HealthStatus } from '../services/mealService';

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

interface Props {
  healthStatus?: HealthStatus;
}

export default function MaintenanceScreen({ healthStatus }: Props) {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [statusIndex, setStatusIndex] = useState(0);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Bounce animation for main emoji
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -14, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Pulse animation for status dots
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Spin animation for refresh icon
    Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true })
    ).start();

    // Rotate status messages
    const msgInterval = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % STATUSES.length);
    }, 3000);

    // Countdown timer (resets every 10s to match polling)
    const countdownInterval = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? 10 : prev - 1));
    }, 1000);

    return () => {
      clearInterval(msgInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const current = STATUSES[statusIndex];

  const apiUp = healthStatus?.api ?? false;
  const dbUp = healthStatus?.db ?? false;

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.Text style={[styles.mainEmoji, { transform: [{ translateY: bounceAnim }] }]}>
        🔧
      </Animated.Text>

      <View style={styles.titleBox}>
        <Text style={styles.title}>WE'RE DOWN</Text>
        <Text style={styles.subtitle}>for maintenance</Text>
      </View>

      {/* Service Status Card */}
      <View style={styles.statusCard}>
        <Text style={styles.statusCardTitle}>SERVICE STATUS</Text>

        <View style={styles.statusRow}>
          <View style={styles.statusLeft}>
            <Animated.View style={[
              styles.statusDot,
              { backgroundColor: apiUp ? '#4CAF50' : '#F44336', opacity: apiUp ? 1 : pulseAnim }
            ]} />
            <Text style={styles.statusLabel}>API Server</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: apiUp ? 'rgba(76,175,80,0.15)' : 'rgba(244,67,54,0.12)' }]}>
            <Text style={[styles.statusBadgeText, { color: apiUp ? '#4CAF50' : '#F44336' }]}>
              {apiUp ? 'ONLINE' : 'DOWN'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.statusRow}>
          <View style={styles.statusLeft}>
            <Animated.View style={[
              styles.statusDot,
              { backgroundColor: dbUp ? '#4CAF50' : '#F44336', opacity: dbUp ? 1 : pulseAnim }
            ]} />
            <Text style={styles.statusLabel}>Database</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: dbUp ? 'rgba(76,175,80,0.15)' : 'rgba(244,67,54,0.12)' }]}>
            <Text style={[styles.statusBadgeText, { color: dbUp ? '#4CAF50' : '#F44336' }]}>
              {dbUp ? 'ONLINE' : 'DOWN'}
            </Text>
          </View>
        </View>
      </View>

      {/* Rotating message */}
      <View style={styles.messageCard}>
        <Text style={styles.messageEmoji}>{current.emoji}</Text>
        <Text style={styles.messageText}>{current.text}</Text>
      </View>

      {/* Auto-retry indicator */}
      <View style={styles.retryRow}>
        <Animated.Text style={[styles.retryIcon, { transform: [{ rotate: spin }] }]}>⟳</Animated.Text>
        <Text style={styles.retryText}>
          Checking again in <Text style={styles.retryCountdown}>{countdown}s</Text>
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
    fontSize: 72,
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
  },
  // Status card
  statusCard: {
    width: '100%',
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  statusCardTitle: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textSecondary,
    letterSpacing: theme.typography.letterSpacing.wide,
    marginBottom: theme.spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
  },
  statusBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.07)',
    marginVertical: theme.spacing.xs,
  },
  // Message card
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
    minHeight: 64,
  },
  messageEmoji: {
    fontSize: 28,
  },
  messageText: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  // Retry row
  retryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  retryIcon: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  retryText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  retryCountdown: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.bold,
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
