import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '@/src/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { type AnalyzeItemsResponse } from '@/src/services/mealService';
import { useSaveMeal } from '@/src/hooks/useMealQueries';

export default function NutritionResultsScreen() {
  const { nutritionData, mealName: mealNameParam } = useLocalSearchParams<{
    nutritionData: string;
    mealName: string;
  }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const saveMealMutation = useSaveMeal();
  const saving = saveMealMutation.isPending;
  const saved = saveMealMutation.isSuccess;

  let nutrition: AnalyzeItemsResponse | null = null;
  let mealName = '';

  try {
    nutrition = nutritionData ? JSON.parse(decodeURIComponent(nutritionData)) : null;
    mealName = mealNameParam ? decodeURIComponent(mealNameParam) : '';
  } catch (e) {
    console.error('Failed to parse data:', e);
  }

  const handleSave = () => {
    if (!nutrition || saved) return;
    saveMealMutation.mutate(
      {
        mealName: mealName || nutrition.mealName || 'Untitled Meal',
        healthScore: nutrition.healthScore,
        reasoning: nutrition.reasoning,
        foodItems: nutrition.foodItems,
      },
      {
        onSuccess: () => {
          Alert.alert('Saved!', 'Meal logged successfully!', [
            { text: 'OK', onPress: () => router.replace('/') },
          ]);
        },
        onError: () => {
          Alert.alert('Error', 'Failed to save meal. Please try again.');
        },
      },
    );
  };

  if (!nutrition) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>No nutrition data available</Text>
      </View>
    );
  }

  const totalMacros = nutrition.foodItems.reduce(
    (acc, item) => ({
      protein: acc.protein + item.macros.protein,
      carbs: acc.carbs + item.macros.carbs,
      fat: acc.fat + item.macros.fat,
      calories: acc.calories + item.macros.calories,
      fiber: acc.fiber + item.macros.fiber,
      sugar: acc.sugar + item.macros.sugar,
    }),
    { protein: 0, carbs: 0, fat: 0, calories: 0, fiber: 0, sugar: 0 },
  );

  const allMicros = Array.from(
    new Set(nutrition.foodItems.flatMap((item) => item.micros.map((m) => m.name))),
  );

  const allGoodIngredients = Array.from(
    new Set(nutrition.foodItems.flatMap((item) => item.goodIngredients)),
  );

  const allBadIngredients = Array.from(
    new Set(nutrition.foodItems.flatMap((item) => item.badIngredients)),
  );

  const score = nutrition.healthScore;
  const scoreColor = score >= 70 ? theme.card.dailySummary : score >= 40 ? theme.card.yellowAccent : theme.card.fatCard;
  const toDisplayName = (name: string) => name.replace(/\b\w/g, (c) => c.toUpperCase());
  const scoreEmoji = score >= 80 ? '🌟' : score >= 60 ? '👍' : score >= 40 ? '😐' : '😬';

  const MACROS = [
    { label: 'CALORIES', value: Math.round(totalMacros.calories), unit: 'kcal', color: theme.card.fatCard, icon: 'flame' as const },
    { label: 'PROTEIN', value: Math.round(totalMacros.protein), unit: 'g', color: theme.card.proteinCard, icon: 'barbell' as const },
    { label: 'CARBS', value: Math.round(totalMacros.carbs), unit: 'g', color: theme.card.yellowAccent, icon: 'leaf' as const },
    { label: 'FAT', value: Math.round(totalMacros.fat), unit: 'g', color: '#E8D5FF', icon: 'water' as const },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.label}>MEAL ANALYSIS</Text>
          <Text style={styles.mealName}>{(mealName || nutrition.mealName || 'YOUR MEAL').toUpperCase()}</Text>
        </View>

        {/* Health Score */}
        <View style={[styles.scoreCard, { backgroundColor: scoreColor }]}>
          <View style={styles.scoreLeft}>
            <Text style={styles.scoreEmoji}>{scoreEmoji}</Text>
            <View>
              <Text style={styles.scoreNumber}>{score}</Text>
              <Text style={styles.scoreOutOf}>OUT OF 100</Text>
            </View>
          </View>
          <View style={styles.scoreDivider} />
          <View style={styles.scoreRight}>
            <Text style={styles.scoreRightLabel}>HEALTH SCORE</Text>
            <Text style={styles.scoreReasoning} numberOfLines={4}>{nutrition.reasoning}</Text>
          </View>
        </View>

        {/* Macro Grid */}
        <Text style={styles.sectionTitle}>NUTRITION FACTS</Text>
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
              <View style={[styles.chip, { backgroundColor: '#FFE5E5' }]}>
                <Text style={styles.chipText}>🍬  SUGAR  {Math.round(totalMacros.sugar)}g</Text>
              </View>
            )}
          </View>
        )}

        {/* Good Ingredients */}
        {allGoodIngredients.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionBadge, { backgroundColor: '#D1FAE5', borderColor: '#059669' }]}>
                <Ionicons name="checkmark" size={16} color="#059669" />
                <Text style={[styles.sectionBadgeText, { color: '#059669' }]}>GOOD STUFF</Text>
              </View>
            </View>
            <View style={styles.tagRow}>
              {allGoodIngredients.map((g, i) => (
                <View key={i} style={styles.goodTag}>
                  <Text style={styles.goodTagText}>{g.replace(/_/g, ' ')}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bad Ingredients */}
        {allBadIngredients.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionBadge, { backgroundColor: '#FEE2E2', borderColor: '#DC2626' }]}>
                <Ionicons name="warning" size={16} color="#DC2626" />
                <Text style={[styles.sectionBadgeText, { color: '#DC2626' }]}>WATCH OUT</Text>
              </View>
            </View>
            <View style={styles.tagRow}>
              {allBadIngredients.map((b, i) => (
                <View key={i} style={styles.badTag}>
                  <Text style={styles.badTagText}>{b.replace(/_/g, ' ')}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Vitamins & Minerals */}
        {allMicros.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionBadge, { backgroundColor: '#EDE9FE', borderColor: '#7C3AED' }]}>
                <Ionicons name="sparkles" size={16} color="#7C3AED" />
                <Text style={[styles.sectionBadgeText, { color: '#7C3AED' }]}>VITAMINS & MINERALS</Text>
              </View>
            </View>
            <View style={styles.tagRow}>
              {allMicros.map((m, i) => (
                <View key={i} style={styles.microTag}>
                  <Text style={styles.microTagText}>{m.replace(/_/g, ' ')}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Food Items Breakdown */}
        {nutrition.foodItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionBadge, { backgroundColor: theme.card.dailySummary, borderColor: theme.colors.text }]}>
                <Ionicons name="restaurant" size={16} color={theme.colors.text} />
                <Text style={styles.sectionBadgeText}>WHAT WE FOUND</Text>
              </View>
            </View>
            <View style={styles.foodCard}>
              {nutrition.foodItems.map((item, idx) => (
                <View key={idx} style={[styles.foodRow, idx === nutrition!.foodItems.length - 1 && styles.foodRowLast]}>
                  <View style={styles.foodRowLeft}>
                    <Text style={styles.foodDot}>●</Text>
                    <Text style={styles.foodName}>{toDisplayName(item.itemName)}</Text>
                  </View>
                  <View style={styles.foodMeta}>
                    <Text style={styles.foodGrams}>{item.amountGrams}g</Text>
                    <Text style={styles.foodCals}>{Math.round(item.macros.calories)} kcal</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={[styles.buttonRow, { paddingBottom: insets.bottom + theme.spacing.md }]}>
        <TouchableOpacity style={styles.discardBtn} onPress={() => router.replace('/')}>
          <Ionicons name="trash-outline" size={20} color={theme.colors.text} />
          <Text style={styles.discardText}>DISCARD</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveBtn, saved && styles.savedBtn]}
          onPress={handleSave}
          disabled={saving || saved}
        >
          <Ionicons name={saved ? 'checkmark-circle' : 'bookmark'} size={20} color={theme.colors.text} />
          <Text style={styles.saveBtnText}>
            {saving ? 'SAVING...' : saved ? 'SAVED!' : 'SAVE MEAL'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    padding: theme.spacing.lg,
  },

  // Header
  header: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textTertiary,
    letterSpacing: 3,
    marginBottom: theme.spacing.xs,
  },
  mealName: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: 1,
  },

  // Score Card
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
  scoreLeft: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  scoreEmoji: { fontSize: 36 },
  scoreNumber: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    lineHeight: 80,
  },
  scoreOutOf: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: 'rgba(0,0,0,0.4)',
    letterSpacing: 2,
    textAlign: 'center',
  },
  scoreDivider: {
    width: 3,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 2,
  },
  scoreRight: {
    flex: 1,
    gap: theme.spacing.sm,
  },
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

  // Section
  sectionTitle: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textTertiary,
    letterSpacing: 3,
    marginBottom: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    marginBottom: theme.spacing.md,
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
  },
  sectionBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: 1,
    color: theme.colors.text,
  },

  // Macro Grid
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

  // Tags
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
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

  // Food Items
  foodCard: {
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  foodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.text,
  },
  foodRowLast: {
    borderBottomWidth: 0,
  },
  foodRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  foodDot: {
    fontSize: 8,
    color: theme.colors.textTertiary,
  },
  foodName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    flex: 1,
  },
  foodMeta: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  foodGrams: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  foodCals: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    backgroundColor: theme.card.fatCard,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  discardBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderWidth: 3,
    borderColor: theme.colors.text,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  discardText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: 1,
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderWidth: 3,
    borderColor: theme.colors.text,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.card.yellowAccent,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  savedBtn: {
    backgroundColor: theme.card.dailySummary,
  },
  saveBtnText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: 1,
  },
  errorText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});
