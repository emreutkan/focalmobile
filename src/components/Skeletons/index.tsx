import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '../Skeleton';
import { useTheme } from '@/src/contexts/ThemeContext';

export const HomeSkeleton = () => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {/* TopBar Skeleton is usually static, but we can add one if needed */}
      
      {/* MiddleSection Skeleton */}
      <View style={styles.middleSection}>
        {/* DailySummaryCard Skeleton */}
        <Skeleton height={180} borderRadius={theme.borderRadius.xl} style={styles.card} />
        
        {/* Small Cards Skeleton */}
        <View style={styles.smallCardsContainer}>
          <Skeleton height={100} style={styles.smallCard} />
          <Skeleton height={100} style={styles.smallCard} />
          <Skeleton height={100} style={styles.smallCard} />
        </View>
      </View>

      {/* MealsSection Skeleton */}
      <View style={styles.mealsSection}>
        <Skeleton width={150} height={30} style={styles.title} />
        
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.mealCard}>
            <Skeleton width={48} height={48} borderRadius={theme.borderRadius.md} style={styles.healthBadge} />
            <View style={styles.mealInfo}>
              <Skeleton width="60%" height={20} style={styles.mealName} />
              <Skeleton width="40%" height={15} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export const MealDetailSkeleton = () => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Skeleton width="80%" height={40} style={styles.title} />
        <Skeleton width="40%" height={20} style={styles.subtitle} />
        
        <View style={styles.row}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width={70} height={70} borderRadius={theme.borderRadius.md} style={styles.macro} />
          ))}
        </View>

        <Skeleton height={100} style={styles.card} />
        <Skeleton height={150} style={styles.card} />
      </View>
    </View>
  );
};

export const NutritionResultsSkeleton = () => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Skeleton width="40%" height={15} style={styles.labelSkeleton} />
        <Skeleton width="90%" height={45} style={styles.title} />
        
        <Skeleton height={150} borderRadius={theme.borderRadius['2xl']} style={styles.card} />
        
        <Skeleton width="50%" height={20} style={styles.sectionLabel} />
        <View style={styles.macroGrid}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width="47%" height={100} borderRadius={theme.borderRadius.xl} style={styles.macroCard} />
          ))}
        </View>

        <View style={styles.chipRow}>
          <Skeleton width={100} height={30} borderRadius={theme.borderRadius.full} />
          <Skeleton width={100} height={30} borderRadius={theme.borderRadius.full} />
        </View>

        <Skeleton height={80} style={styles.card} />
        <Skeleton height={80} style={styles.card} />
      </View>
    </View>
  );
};

export const ImageAnalyzerSkeleton = () => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerSkeleton}>
          <Skeleton width={40} height={40} borderRadius={20} />
          <Skeleton width={180} height={40} />
        </View>
        
        <Skeleton height={320} borderRadius={theme.borderRadius.xl} style={styles.imageSkeleton} />
        
        <View style={styles.buttonPlaceholder}>
          <Skeleton height={56} borderRadius={theme.borderRadius.lg} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  middleSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    marginBottom: 16,
  },
  smallCardsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  smallCard: {
    flex: 1,
  },
  mealsSection: {
    paddingHorizontal: 16,
  },
  title: {
    marginBottom: 16,
  },
  subtitle: {
    marginBottom: 24,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  healthBadge: {
    marginRight: 16,
  },
  mealInfo: {
    flex: 1,
    gap: 8,
  },
  mealName: {
    marginBottom: 4,
  },
  content: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 16,
  },
  macro: {
    flex: 1,
    marginHorizontal: 4,
  },
  labelSkeleton: {
    marginBottom: 8,
    marginTop: 8,
  },
  sectionLabel: {
    marginTop: 16,
    marginBottom: 16,
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  macroCard: {
    marginBottom: 4,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  headerSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  imageSkeleton: {
    marginBottom: 24,
  },
  buttonPlaceholder: {
    marginTop: 8,
    width: '100%',
  },
});
