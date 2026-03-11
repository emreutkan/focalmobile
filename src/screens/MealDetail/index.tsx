import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Theme } from '@/src/theme';
import { useMealById } from '@/src/hooks/useMealQueries';
import { type MealDetailFoodItem } from '@/src/services/mealService';
import { MealDetailSkeleton } from '@/src/components/Skeletons';

const toDisplayName = (s: string) =>
  s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const { data: meal, isLoading, isError } = useMealById(id ?? '');

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <MealDetailSkeleton />
      </View>
    );
  }

  if (isError || !meal) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.errorEmoji}>😵</Text>
        <Text style={styles.errorText}>Couldn't load this meal.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnSmall}>
          <Text style={styles.backBtnSmallText}>GO BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const score = meal.healthScore;
  const scoreColor =
    score >= 70 ? theme.card.dailySummary : score >= 40 ? theme.card.yellowAccent : theme.card.fatCard;
  const scoreEmoji = score >= 80 ? '🌟' : score >= 60 ? '👍' : score >= 40 ? '😐' : '😬';

  const totalMacros = meal.foodItems.reduce(
    (acc, item) => ({
      calories: acc.calories + (item.macros?.calories ?? 0),
      protein: acc.protein + (item.macros?.protein ?? 0),
      carbs: acc.carbs + (item.macros?.carbs ?? 0),
      fat: acc.fat + (item.macros?.fat ?? 0),
      fiber: acc.fiber + (item.macros?.fiber ?? 0),
      sugar: acc.sugar + (item.macros?.sugar ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 },
  );

  const allMicros = Array.from(
    new Set(meal.foodItems.flatMap((item) => item.micros.map((m) => m.name))),
  );

  const MACROS = [
    { label: 'CALORIES', value: Math.round(totalMacros.calories), unit: 'kcal', color: theme.card.fatCard, icon: 'flame' as const },
    { label: 'PROTEIN', value: Math.round(totalMacros.protein), unit: 'g', color: theme.card.proteinCard, icon: 'barbell' as const },
    { label: 'CARBS', value: Math.round(totalMacros.carbs), unit: 'g', color: theme.card.carbCard, icon: 'leaf' as const },
    { label: 'FAT', value: Math.round(totalMacros.fat), unit: 'g', color: '#E8D5FF', icon: 'water' as const },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerEyebrow}>MEAL DETAILS</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {meal.mealName.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Date / time chip */}
        <View style={styles.dateRow}>
          <View style={styles.dateChip}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.dateText}>{formatDate(meal.createdAt)}</Text>
          </View>
          <View style={styles.dateChip}>
            <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.dateText}>{formatTime(meal.createdAt)}</Text>
          </View>
        </View>

        {/* Health Score */}
        <View style={[styles.scoreCard, { backgroundColor: scoreColor }]}>
          <View style={styles.scoreLeft}>
            <Text style={styles.scoreEmoji}>{scoreEmoji}</Text>
            <View>
              <Text style={styles.scoreNumber}>{score}</Text>
              <Text style={styles.scoreOutOf}>/ 100</Text>
            </View>
          </View>
          <View style={styles.scoreDivider} />
          <View style={styles.scoreRight}>
            <Text style={styles.scoreRightLabel}>HEALTH SCORE</Text>
            <Text style={styles.scoreReasoning} numberOfLines={5}>
              {meal.healthScoreReasoning}
            </Text>
          </View>
        </View>

        {/* Macro Grid */}
        <Text style={styles.sectionLabel}>NUTRITION FACTS</Text>
        <View style={styles.macroGrid}>
          {MACROS.map((m) => (
            <View key={m.label} style={[styles.macroCard, { backgroundColor: m.color }]}>
              <Ionicons name={m.icon} size={22} color={theme.colors.text} />
              <Text style={styles.macroValue}>{m.value}</Text>
              <Text style={styles.macroUnit}>{m.unit}</Text>
              <Text style={styles.macroLabel}>{m.label}</Text>
            </View>
          ))}
        </View>

        {/* Fiber / Sugar chips */}
        {(totalMacros.fiber > 0 || totalMacros.sugar > 0) && (
          <View style={styles.chipRow}>
            {totalMacros.fiber > 0 && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>🌾  FIBER  {Math.round(totalMacros.fiber)}g</Text>
              </View>
            )}
            {totalMacros.sugar > 0 && (
              <View style={[styles.chip, { backgroundColor: isDark ? theme.colors.errorActive : '#FFE5E5' }]}>
                <Text style={styles.chipText}>🍬  SUGAR  {Math.round(totalMacros.sugar)}g</Text>
              </View>
            )}
          </View>
        )}

        {/* Good Ingredients */}
        {meal.goodIngredients.length > 0 && (
          <View style={styles.section}>
            <View style={[styles.sectionBadge, { backgroundColor: isDark ? '#064e3b' : '#D1FAE5', borderColor: '#059669' }]}>
              <Ionicons name="checkmark" size={14} color="#059669" />
              <Text style={[styles.sectionBadgeText, { color: '#059669' }]}>GOOD STUFF</Text>
            </View>
            <View style={styles.tagRow}>
              {meal.goodIngredients.map((g, i) => (
                <View key={i} style={styles.goodTag}>
                  <Text style={styles.goodTagText}>{toDisplayName(g)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bad Ingredients */}
        {meal.badIngredients.length > 0 && (
          <View style={styles.section}>
            <View style={[styles.sectionBadge, { backgroundColor: isDark ? '#7f1d1d' : '#FEE2E2', borderColor: '#DC2626' }]}>
              <Ionicons name="warning" size={14} color="#DC2626" />
              <Text style={[styles.sectionBadgeText, { color: '#DC2626' }]}>WATCH OUT</Text>
            </View>
            <View style={styles.tagRow}>
              {meal.badIngredients.map((b, i) => (
                <View key={i} style={styles.badTag}>
                  <Text style={styles.badTagText}>{toDisplayName(b)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Vitamins & Minerals */}
        {allMicros.length > 0 && (
          <View style={styles.section}>
            <View style={[styles.sectionBadge, { backgroundColor: isDark ? '#4c1d95' : '#EDE9FE', borderColor: '#7C3AED' }]}>
              <Ionicons name="sparkles" size={14} color="#7C3AED" />
              <Text style={[styles.sectionBadgeText, { color: '#7C3AED' }]}>VITAMINS & MINERALS</Text>
            </View>
            <View style={styles.tagRow}>
              {allMicros.map((m, i) => (
                <View key={i} style={styles.microTag}>
                  <Text style={styles.microTagText}>{toDisplayName(m)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Food Items Breakdown */}
        <Text style={styles.sectionLabel}>WHAT YOU ATE</Text>
        {meal.foodItems.map((item, idx) => (
          <FoodItemCard key={item.id ?? idx} item={item} theme={theme} isDark={isDark} styles={styles} />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function FoodItemCard({
  item,
  theme,
  isDark,
  styles,
}: {
  item: MealDetailFoodItem;
  theme: Theme;
  isDark: boolean;
  styles: ReturnType<typeof getStyles>;
}) {
  const hasBad = item.badIngredients.length > 0;
  const hasGood = item.goodIngredients.length > 0;

  return (
    <View style={styles.foodCard}>
      {/* Item header */}
      <View style={styles.foodCardHeader}>
        <View style={styles.foodCardLeft}>
          <Text style={styles.foodCardName}>{item.itemName}</Text>
          <Text style={styles.foodCardGrams}>{item.amountGrams}g</Text>
        </View>
        <View style={styles.foodCardCals}>
          <Text style={styles.foodCardCalsValue}>{Math.round(item.macros?.calories ?? 0)}</Text>
          <Text style={styles.foodCardCalsUnit}>kcal</Text>
        </View>
      </View>

      {/* Mini macro row */}
      <View style={styles.miniMacroRow}>
        <View style={[styles.miniMacro, { backgroundColor: theme.card.proteinCard }]}>
          <Text style={styles.miniMacroValue}>{Math.round(item.macros?.protein ?? 0)}g</Text>
          <Text style={styles.miniMacroLabel}>PRO</Text>
        </View>
        <View style={[styles.miniMacro, { backgroundColor: theme.card.carbCard }]}>
          <Text style={styles.miniMacroValue}>{Math.round(item.macros?.carbs ?? 0)}g</Text>
          <Text style={styles.miniMacroLabel}>CARB</Text>
        </View>
        <View style={[styles.miniMacro, { backgroundColor: '#E8D5FF' }]}>
          <Text style={styles.miniMacroValue}>{Math.round(item.macros?.fat ?? 0)}g</Text>
          <Text style={styles.miniMacroLabel}>FAT</Text>
        </View>
        {(item.macros?.fiber ?? 0) > 0 && (
          <View style={[styles.miniMacro, { backgroundColor: '#E5FFE5' }]}>
            <Text style={styles.miniMacroValue}>{Math.round(item.macros.fiber!)}g</Text>
            <Text style={styles.miniMacroLabel}>FIBER</Text>
          </View>
        )}
      </View>

      {/* Per-item ingredients */}
      {(hasGood || hasBad) && (
        <View style={styles.foodCardIngredients}>
          {item.goodIngredients.map((g, i) => (
            <View key={`g${i}`} style={styles.miniGoodTag}>
              <Text style={styles.miniGoodTagText}>✓ {g.replace(/_/g, ' ')}</Text>
            </View>
          ))}
          {item.badIngredients.map((b, i) => (
            <View key={`b${i}`} style={styles.miniBadTag}>
              <Text style={styles.miniBadTagText}>✗ {b.replace(/_/g, ' ')}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scroll: { flex: 1 },
    scrollContent: { padding: theme.spacing.lg },

    // Loading / error
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.md,
      padding: theme.spacing.xl,
    },
    loadingText: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.textSecondary,
    },
    errorEmoji: { fontSize: 64 },
    errorText: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    backBtnSmall: {
      marginTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderWidth: 2,
      borderColor: theme.colors.text,
      borderRadius: theme.borderRadius.lg,
    },
    backBtnSmallText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      letterSpacing: 1,
    },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.text,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerText: { flex: 1 },
    headerEyebrow: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.textTertiary,
      letterSpacing: 3,
    },
    headerTitle: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      letterSpacing: 1,
    },

    // Date chips
    dateRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.xl,
    },
    dateChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: 'rgba(0,0,0,0.1)',
      borderRadius: theme.borderRadius.full,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    dateText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.textSecondary,
    },

    // Score card
    scoreCard: {
      flexDirection: 'row',
      borderWidth: 2,
      borderColor: 'rgba(0,0,0,0.12)',
      borderRadius: theme.borderRadius['2xl'],
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      gap: theme.spacing.lg,
      alignItems: 'center',
    },
    scoreLeft: { alignItems: 'center', gap: theme.spacing.xs },
    scoreEmoji: { fontSize: 32 },
    scoreNumber: {
      fontSize: theme.typography.fontSize['4xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      lineHeight: 56,
    },
    scoreOutOf: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      color: 'rgba(0,0,0,0.4)',
      letterSpacing: 1,
      textAlign: 'center',
    },
    scoreDivider: {
      width: 2,
      alignSelf: 'stretch',
      backgroundColor: 'rgba(0,0,0,0.15)',
      borderRadius: 2,
    },
    scoreRight: { flex: 1, gap: theme.spacing.xs },
    scoreRightLabel: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      color: 'rgba(0,0,0,0.4)',
      letterSpacing: 2,
    },
    scoreReasoning: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text,
      lineHeight: 20,
    },

    // Section label
    sectionLabel: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.textTertiary,
      letterSpacing: 3,
      marginBottom: theme.spacing.md,
    },

    // Macro grid
    macroGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    macroCard: {
      flex: 1,
      minWidth: '47%',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.xl,
      borderWidth: 2,
      borderColor: 'rgba(0,0,0,0.1)',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    macroValue: {
      fontSize: theme.typography.fontSize['3xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    macroUnit: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      color: 'rgba(0,0,0,0.4)',
      marginTop: -theme.spacing.xs,
    },
    macroLabel: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      letterSpacing: 2,
    },

    // Chips
    chipRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.xl,
      flexWrap: 'wrap',
    },
    chip: {
      backgroundColor: '#E5FFE5',
      borderWidth: 2,
      borderColor: theme.colors.text,
      borderRadius: theme.borderRadius.full,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    chipText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      letterSpacing: 1,
    },

    // Section + tags
    section: { marginBottom: theme.spacing.xl },
    sectionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      alignSelf: 'flex-start',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
      borderWidth: 2,
      marginBottom: theme.spacing.md,
    },
    sectionBadgeText: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      letterSpacing: 1,
    },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
    goodTag: {
      backgroundColor: '#D1FAE5',
      borderWidth: 2,
      borderColor: '#059669',
      borderRadius: theme.borderRadius.full,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    goodTagText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      color: '#059669',
      textTransform: 'capitalize',
    },
    badTag: {
      backgroundColor: '#FEE2E2',
      borderWidth: 2,
      borderColor: '#DC2626',
      borderRadius: theme.borderRadius.full,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    badTagText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      color: '#DC2626',
      textTransform: 'capitalize',
    },
    microTag: {
      backgroundColor: '#EDE9FE',
      borderWidth: 2,
      borderColor: '#7C3AED',
      borderRadius: theme.borderRadius.full,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    microTagText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      color: '#7C3AED',
      textTransform: 'capitalize',
    },

    // Food item card
    foodCard: {
      backgroundColor: theme.colors.card,
      borderWidth: 2,
      borderColor: 'rgba(0,0,0,0.1)',
      borderRadius: theme.borderRadius['2xl'],
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      gap: theme.spacing.md,
    },
    foodCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    foodCardLeft: { flex: 1, gap: 2 },
    foodCardName: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    foodCardGrams: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.textSecondary,
    },
    foodCardCals: {
      alignItems: 'flex-end',
      backgroundColor: theme.card.fatCard,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 2,
      borderColor: 'rgba(0,0,0,0.08)',
    },
    foodCardCalsValue: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    foodCardCalsUnit: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      color: 'rgba(0,0,0,0.4)',
      letterSpacing: 1,
    },
    miniMacroRow: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    miniMacro: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 2,
      borderColor: 'rgba(0,0,0,0.08)',
      gap: 2,
    },
    miniMacroValue: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    miniMacroLabel: {
      fontSize: 9,
      fontWeight: theme.typography.fontWeight.bold,
      color: 'rgba(0,0,0,0.45)',
      letterSpacing: 1,
    },
    foodCardIngredients: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    miniGoodTag: {
      backgroundColor: '#D1FAE5',
      borderWidth: 1,
      borderColor: '#059669',
      borderRadius: theme.borderRadius.full,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 3,
    },
    miniGoodTagText: {
      fontSize: 11,
      fontWeight: theme.typography.fontWeight.bold,
      color: '#059669',
      textTransform: 'capitalize',
    },
    miniBadTag: {
      backgroundColor: '#FEE2E2',
      borderWidth: 1,
      borderColor: '#DC2626',
      borderRadius: theme.borderRadius.full,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 3,
    },
    miniBadTagText: {
      fontSize: 11,
      fontWeight: theme.typography.fontWeight.bold,
      color: '#DC2626',
      textTransform: 'capitalize',
    },
  });
