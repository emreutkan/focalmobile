import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Theme } from '@/src/theme';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '@/src/hooks/userStore';
import PremiumCelebration from './components/PremiumCelebration';

const { width, height } = Dimensions.get('window');

function FloatingOrb({ delay, startX, startY, color }: { delay: number; startX: number; startY: number; color: string }) {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-20, { duration: 300, easing: Easing.inOut(Easing.ease) }),
          withTiming(20, { duration: 300, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
    translateX.value = withDelay(
      delay + 400,
      withRepeat(
        withSequence(
          withTiming(15, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(-15, { duration: 400, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.floatingOrb,
        { left: startX, top: startY, backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
}

function FeatureCard({ feature, index }: { feature: any; index: number }) {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(200 + index * 80).springify()}
      style={animatedStyle}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.featureCard}
      >
        <View style={[styles.featureIconBox, { backgroundColor: feature.color }]}>
          <Ionicons name={feature.icon} size={32} color={theme.colors.text} />
        </View>
        <View style={styles.featureContent}>
          <Text style={styles.featureTitle}>{feature.title}</Text>
          <Text style={styles.featureDescription}>{feature.description}</Text>
        </View>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={24} color={theme.colors.text} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function PricingCard({
  isPopular,
  duration,
  price,
  period,
  savings,
  onPress,
  index,
}: {
  isPopular: boolean;
  duration: string;
  price: string;
  period: string;
  savings: string;
  onPress: () => void;
  index: number;
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const scale = useSharedValue(1);
  const shadowOffset = useSharedValue(8);

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 80 });
    shadowOffset.value = withTiming(4, { duration: 80 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
    shadowOffset.value = withTiming(8, { duration: 100 });
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: interpolate(shadowOffset.value, [4, 8], [4, 0]) },
      { translateY: interpolate(shadowOffset.value, [4, 8], [4, 0]) },
    ],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shadowOffset.value },
      { translateY: shadowOffset.value },
    ],
  }));

  return (
    <Animated.View
      entering={FadeInUp.delay(400 + index * 100).springify()}
      style={styles.pricingCardWrapper}
    >
      <Animated.View style={[styles.pricingShadow, shadowStyle]} />
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <Animated.View
          style={[
            styles.pricingCard,
            isPopular && styles.pricingCardPopular,
            cardStyle,
          ]}
        >
          {isPopular && (
            <View style={styles.popularBadge}>
              <Ionicons name="star" size={theme.typography.fontSize.xs} color={theme.colors.text} />
              <Text style={styles.popularBadgeText}>BEST VALUE</Text>
            </View>
          )}
          <Text style={styles.pricingDuration}>{duration}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceCurrency}>$</Text>
            <Text style={styles.priceAmount}>{price}</Text>
            <Text style={styles.pricePeriod}>/{period}</Text>
          </View>
          <Text style={[styles.priceSavings, isPopular && styles.priceSavingsPopular]}>
            {savings}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function ProScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const setIsPro = useUserStore((state) => state.setIsPro);
  const [showCelebration, setShowCelebration] = React.useState(false);
  const pulseAnim = useSharedValue(1);
  const glowAnim = useSharedValue(0);

  const PRO_FEATURES = useMemo(() => [
    {
      icon: 'infinite-outline' as const,
      title: 'UNLIMITED SCANS',
      description: 'No daily limits. Scan everything.',
      color: theme.card.dailySummary,
    },
    {
      icon: 'analytics-outline' as const,
      title: 'DEEP INSIGHTS',
      description: 'Trends, patterns, and smart analytics.',
      color: theme.card.proteinCard,
    },
    {
      icon: 'cloud-outline' as const,
      title: 'CLOUD SYNC',
      description: 'Your data, everywhere you go.',
      color: theme.card.carbCard,
    },
    {
      icon: 'flash-outline' as const,
      title: 'PRIORITY AI',
      description: 'Lightning-fast food analysis.',
      color: theme.card.fatCard,
    },
    {
      icon: 'restaurant-outline' as const,
      title: 'SMART RECIPES',
      description: 'Personalized meal suggestions.',
      color: theme.card.yellowAccent,
    },
    {
      icon: 'notifications-outline' as const,
      title: 'SMART REMINDERS',
      description: 'Never miss a meal again.',
      color: theme.colors.textSecondary,
    },
  ], [theme]);

  useEffect(() => {
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    glowAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ),
      -1,
      true
    );
  }, []);

  const ctaAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const handleSubscribe = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsPro(true);
    setShowCelebration(true);
  };

  const handleRestore = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPro(true);
    setShowCelebration(true);
  };

  const handleCelebrationComplete = () => {
    router.back();
  };

  if (showCelebration) {
    return <PremiumCelebration onComplete={handleCelebrationComplete} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.orbContainer}>
        <FloatingOrb delay={0} startX={-30} startY={100} color={theme.colors.overlayMedium} />
        <FloatingOrb delay={300} startX={width - 48} startY={200} color={theme.colors.overlayLight} />
        <FloatingOrb delay={500} startX={32} startY={height * 0.4} color={theme.colors.overlayLight} />
        <FloatingOrb delay={900} startX={width - 40} startY={height * 0.6} color={theme.colors.overlayLight} />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Animated.View
          entering={FadeInDown.delay(50).springify()}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={32} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>GO</Text>
            <View style={styles.proBadgeHeader}>
              <Text style={styles.proBadgeHeaderText}>PRO</Text>
            </View>
          </View>
          <View style={styles.backButton} />
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={styles.heroSection}
          >
            <View style={styles.heroIconContainer}>
              <View style={styles.heroIconInner}>
                <Ionicons name="diamond" size={48} color={theme.colors.text} />
              </View>
              <View style={styles.heroIconRing} />
              <View style={styles.heroIconRingOuter} />
            </View>

            <Text style={styles.heroTitle}>UNLOCK YOUR</Text>
            <Text style={styles.heroTitleAccent}>FULL POTENTIAL</Text>
            <Text style={styles.heroSubtitle}>
              Take your nutrition tracking to the next level with premium features designed for results.
            </Text>
          </Animated.View>

          <View style={styles.featuresSection}>
            <Animated.Text
              entering={FadeInDown.delay(150).springify()}
              style={styles.sectionTitle}
            >
              EVERYTHING YOU GET
            </Animated.Text>
            <View style={styles.featuresGrid}>
              {PRO_FEATURES.map((feature, index) => (
                <FeatureCard key={index} feature={feature} index={index} />
              ))}
            </View>
          </View>

          <View style={styles.pricingSection}>
            <Animated.Text
              entering={FadeInUp.delay(350).springify()}
              style={styles.sectionTitle}
            >
              CHOOSE YOUR PLAN
            </Animated.Text>

            <View style={styles.pricingCards}>
              <PricingCard
                isPopular={true}
                duration="YEARLY"
                price="29.99"
                period="year"
                savings="Save 50% • That's $2.50/mo"
                onPress={handleSubscribe}
                index={0}
              />
              <PricingCard
                isPopular={false}
                duration="MONTHLY"
                price="4.99"
                period="month"
                savings="Cancel anytime"
                onPress={handleSubscribe}
                index={1}
              />
            </View>
          </View>

          <Animated.View
            entering={FadeInUp.delay(600).springify()}
            style={styles.ctaSection}
          >
            <TouchableOpacity
              onPress={handleSubscribe}
              activeOpacity={0.9}
            >
              <Animated.View style={[styles.subscribeButtonWrapper, ctaAnimatedStyle]}>
                <View style={styles.subscribeButtonShadow} />
                <View style={styles.subscribeButton}>
                  <Ionicons name="diamond" size={32} color={theme.colors.text} />
                  <Text style={styles.subscribeButtonText}>START 7-DAY FREE TRIAL</Text>
                </View>
              </Animated.View>
            </TouchableOpacity>

            <Text style={styles.trialText}>
              Try everything free for 7 days, then $29.99/year
            </Text>

            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestore}
              activeOpacity={0.7}
            >
              <Text style={styles.restoreText}>Restore Purchases</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(700).springify()}
            style={styles.socialProof}
          >
            <View style={styles.socialProofStars}>
              {[...Array(5)].map((_, i) => (
                <Ionicons key={i} name="star" size={24} color={theme.card.pro} />
              ))}
            </View>
            <Text style={styles.socialProofText}>Loved by 10,000+ users</Text>
          </Animated.View>

          <Text style={styles.termsText}>
            Payment charged at confirmation. Auto-renews unless cancelled 24+ hours before period end. Manage in Account Settings.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  orbContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  floatingOrb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 4,
    borderBottomColor: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.text,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  proBadgeHeader: {
    backgroundColor: theme.card.pro,
    paddingHorizontal: theme.spacing.md - theme.spacing.xs,
    paddingVertical: theme.spacing.xs + theme.spacing.xxs,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.text,
  },
  proBadgeHeaderText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: theme.typography.letterSpacing.normal,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl + theme.spacing.lg,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl + theme.spacing.sm,
    paddingTop: theme.spacing.lg,
  },
  heroIconContainer: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  heroIconInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.card.pro,
    borderWidth: 4,
    borderColor: theme.colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  heroIconRing: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.overlayMedium,
  },
  heroIconRingOuter: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.overlayLight,
  },
  heroTitle: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textSecondary,
    letterSpacing: theme.typography.letterSpacing.wide,
    marginBottom: theme.spacing.xs,
  },
  heroTitleAccent: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: theme.typography.letterSpacing.wide,
    marginBottom: theme.spacing.md,
  },
  heroSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.snug,
    paddingHorizontal: theme.spacing.md,
  },
  featuresSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textTertiary,
    letterSpacing: theme.typography.letterSpacing.normal,
    marginBottom: theme.spacing.md,
    marginLeft: theme.spacing.xs,
  },
  featuresGrid: {
    gap: theme.spacing.sm,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.text,
  },
  featureIconBox: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.text,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: theme.typography.letterSpacing.normal,
    marginBottom: theme.spacing.xxs,
  },
  featureDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  checkCircle: {
    width: theme.typography.fontSize['3xl'],
    height: theme.typography.fontSize['3xl'],
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.card.dailySummary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.text,
  },
  pricingSection: {
    marginBottom: theme.spacing.xl,
  },
  pricingCards: {
    gap: theme.spacing.md,
  },
  pricingCardWrapper: {
    position: 'relative',
  },
  pricingShadow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: -8,
    bottom: -8,
    backgroundColor: theme.colors.text,
    borderRadius: theme.borderRadius.xl,
  },
  pricingCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 4,
    borderColor: theme.colors.text,
    alignItems: 'center',
    position: 'relative',
  },
  pricingCardPopular: {
    backgroundColor: theme.card.pro,
  },
  popularBadge: {
    position: 'absolute',
    top: -theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.text,
    paddingHorizontal: theme.borderRadius.lg,
    paddingVertical: theme.spacing.xs + theme.spacing.xxs,
    borderRadius: theme.borderRadius.full,
  },
  popularBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.card.pro,
    letterSpacing: theme.typography.letterSpacing.normal,
  },
  pricingDuration: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: theme.typography.letterSpacing.normal,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  priceCurrency: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  priceAmount: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeight.loose,
  },
  pricePeriod: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xxs,
    marginTop: theme.spacing.sm,
  },
  priceSavings: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  priceSavingsPopular: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  ctaSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  subscribeButtonWrapper: {
    position: 'relative',
    width: width - theme.spacing.lg * 2,
  },
  subscribeButtonShadow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: -8,
    bottom: -8,
    backgroundColor: theme.colors.text,
    borderRadius: theme.borderRadius.xl,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.card.pro,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 4,
    borderColor: theme.colors.text,
    gap: theme.spacing.sm,
  },
  subscribeButtonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: theme.typography.letterSpacing.normal,
  },
  trialText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  restoreButton: {
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  restoreText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  socialProof: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'center',
  },
  socialProofStars: {
    flexDirection: 'row',
    gap: theme.spacing.xxs,
  },
  socialProofText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  termsText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.tight,
    paddingHorizontal: theme.spacing.md,
  },
});
