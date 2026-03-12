import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ViewToken,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,

  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Theme } from '@/src/theme';
import { useUserStore } from '@/src/hooks/userStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  tagline: string;
  description: string;
  backgroundColor: string;
  accentColor: string;
  brandStyle: 'boxed' | 'underline' | 'shadow';
  type?: 'intro' | 'form';
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    tagline: '🍕 EAT',
    description: "Eat whatever you want.\nSeriously, we don't judge.",
    backgroundColor: '#FFE66D',
    accentColor: '#000000',
    brandStyle: 'boxed',
    type: 'intro',
  },
  {
    id: '2',
    tagline: '📸 SNAP',
    description: "Take a quick pic.\nWe'll handle the rest.",
    backgroundColor: '#4ecdc4',
    accentColor: '#000000',
    brandStyle: 'underline',
    type: 'intro',
  },
  {
    id: '3',
    tagline: '⚡ KNOW',
    description: "Calories, macros, all of it.\nInstantly in your pocket.",
    backgroundColor: '#ff6b6b',
    accentColor: '#000000',
    brandStyle: 'shadow',
    type: 'intro',
  },
  {
    id: '4',
    tagline: '🧬 YOU',
    description: "Tell us a bit about yourself.",
    backgroundColor: '#FFE66D',
    accentColor: '#000000',
    brandStyle: 'boxed',
    type: 'form',
  },
  {
    id: '5',
    tagline: '⚖️ BODY',
    description: "Your stats to customize targets.",
    backgroundColor: '#4ecdc4',
    accentColor: '#000000',
    brandStyle: 'underline',
    type: 'form',
  },
];


export default function OnboardingScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);
  const setHasSeenOnboarding = useUserStore((state) => state.setHasSeenOnboarding);
  const setProfileData = useUserStore((state) => state.setProfileData);

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | 'other'>('male');

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      setProfileData({
        weight_kg: parseFloat(weight) || undefined,
        height_cm: parseFloat(height) || undefined,
        age: parseInt(age) || undefined,
        biological_sex: sex,
      });
      setHasSeenOnboarding(true);
    }
  };

  const handleSkip = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHasSeenOnboarding(true);
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    if (item.type === 'form') {
      return (
        <View style={styles.slide}>
          <View style={styles.slideContent}>
            <View style={styles.brandContainer}>
              <View style={item.brandStyle === 'boxed' ? styles.brandBoxContainer : styles.brandUnderline}>
                <Text style={item.brandStyle === 'boxed' ? styles.brandTextBoxed : styles.brandTextUnderline}>
                  {item.tagline}
                </Text>
                {item.brandStyle === 'underline' && <View style={styles.underlineBar} />}
              </View>
            </View>

            <Text style={styles.description}>{item.description}</Text>

            <View style={styles.formContainer}>
              {item.id === '4' ? (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>AGE</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="25"
                      keyboardType="numeric"
                      value={age}
                      onChangeText={setAge}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>SEX</Text>
                    <View style={styles.sexToggle}>
                      {(['male', 'female', 'other'] as const).map((s) => (
                        <TouchableOpacity
                          key={s}
                          style={[styles.sexOption, sex === s && styles.sexOptionActive]}
                          onPress={() => setSex(s)}
                        >
                          <Text style={[styles.sexText, sex === s && styles.sexTextActive]}>
                            {s.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>WEIGHT (KG)</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="80"
                      keyboardType="numeric"
                      value={weight}
                      onChangeText={setWeight}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>HEIGHT (CM)</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="180"
                      keyboardType="numeric"
                      value={height}
                      onChangeText={setHeight}
                    />
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
      );
    }

    return (
      <SlideItem
        item={item}
        index={index}
        scrollX={scrollX}
      />
    );
  };

  const currentSlide = SLIDES[currentIndex];
  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={[styles.container, { backgroundColor: currentSlide.backgroundColor }]}>
        {/* Skip Button */}
        <TouchableOpacity
          style={[styles.skipButton, { top: top + theme.spacing.md }]}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScroll={(e) => {
            scrollX.value = e.nativeEvent.contentOffset.x;
          }}
          scrollEventThrottle={16}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          keyboardShouldPersistTaps="handled"
        />

        {/* Bottom Section */}
        <View style={[styles.bottomSection, { paddingBottom: bottom + theme.spacing.lg }]}>
          {/* Pagination */}
          <View style={styles.pagination}>
            {SLIDES.map((_, index) => (
              <PaginationDot
                key={index}
                index={index}
                currentIndex={currentIndex}
                styles={styles}
              />
            ))}
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleNext}
            activeOpacity={0.9}
          >
            <View style={styles.ctaButtonInner}>
              <Text style={styles.ctaText}>
                {isLastSlide ? "LET'S GO" : 'NEXT'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

// Individual Slide Component
interface SlideItemProps {
  item: OnboardingSlide;
  index: number;
  scrollX: SharedValue<number>;
}

function SlideItem({ item, index, scrollX }: SlideItemProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const inputRange = [
    (index - 1) * SCREEN_WIDTH,
    index * SCREEN_WIDTH,
    (index + 1) * SCREEN_WIDTH,
  ];

  const animatedContainerStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.85, 1, 0.85],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const animatedBrandStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [60, 0, 60],
      Extrapolation.CLAMP
    );
    const rotate = interpolate(
      scrollX.value,
      inputRange,
      [-8, 0, 8],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateY },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [40, 0, 40],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  return (
    <View style={styles.slide}>
      <Animated.View style={[styles.slideContent, animatedContainerStyle]}>
        {/* Brand Typography - The Hero */}
        <Animated.View style={[styles.brandContainer, animatedBrandStyle]}>
          {item.brandStyle === 'boxed' && (
            <View style={styles.brandBoxed}>
              <View style={styles.brandBoxContainer}>
                <Text style={styles.brandTextBoxed}>FOCAL</Text>
              </View>
            </View>
          )}

          {item.brandStyle === 'underline' && (
            <View style={styles.brandUnderline}>
              <Text style={styles.brandTextUnderline}>FOCAL</Text>
              <View style={styles.underlineBar} />
            </View>
          )}

          {item.brandStyle === 'shadow' && (
            <View style={styles.brandShadow}>
              <Text style={styles.brandTextShadowBack}>FOCAL</Text>
              <Text style={styles.brandTextShadowFront}>FOCAL</Text>
            </View>
          )}
        </Animated.View>

        {/* Tagline Badge */}
        <Animated.View style={[styles.taglineContainer, animatedTextStyle]}>
          <View style={styles.taglineBadge}>
            <Text style={styles.taglineText}>{item.tagline}</Text>
          </View>
        </Animated.View>

        {/* Description */}
        <Animated.View style={animatedTextStyle}>
          <Text style={styles.description}>{item.description}</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

// Pagination Dot
interface PaginationDotProps {
  index: number;
  currentIndex: number;
  styles: any;
}

function PaginationDot({ index, currentIndex, styles }: PaginationDotProps) {
  const isActive = index === currentIndex;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(isActive ? 28 : 10, { damping: 15, stiffness: 200 }),
      height: 10,
      backgroundColor: '#000000',
      opacity: withTiming(isActive ? 1 : 0.3, { duration: 200 }),
    };
  });

  return (
    <Animated.View style={[styles.paginationDot, animatedStyle]} />
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    right: theme.spacing.lg,
    zIndex: 10,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    opacity: 0.5,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    width: '100%',
  },
  brandContainer: {
    marginBottom: theme.spacing.xl,
  },

  // Boxed brand style (Slide 1)
  brandBoxed: {
    alignItems: 'center',
  },
  brandBoxContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  brandTextBoxed: {
    fontSize: 56,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 4,
  },

  // Underline brand style (Slide 2)
  brandUnderline: {
    alignItems: 'center',
  },
  brandTextUnderline: {
    fontSize: 56,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 4,
  },
  underlineBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#000000',
    borderRadius: 4,
    marginTop: 8,
  },

  // Shadow brand style (Slide 3)
  brandShadow: {
    position: 'relative',
    alignItems: 'center',
  },
  brandTextShadowBack: {
    fontSize: 56,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 4,
    position: 'absolute',
    top: 4,
    left: 4,
  },
  brandTextShadowFront: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
  },

  // Tagline
  taglineContainer: {
    marginBottom: theme.spacing.lg,
  },
  taglineBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
  },
  taglineText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 3,
  },

  // Description
  description: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 28,
    opacity: 0.8,
  },

  // Form
  formContainer: {
    width: '100%',
    marginTop: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 2,
  },
  formInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  sexToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  sexOption: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#000000',
    paddingVertical: 12,
    alignItems: 'center',
  },
  sexOptionActive: {
    backgroundColor: '#000000',
  },
  sexText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
  },
  sexTextActive: {
    color: '#FFFFFF',
  },

  // Bottom section
  bottomSection: {
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.xl,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  paginationDot: {
    borderRadius: 5,
  },
  ctaButton: {
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 6,
  },
  ctaButtonInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#000000',
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 2,
  },
});
