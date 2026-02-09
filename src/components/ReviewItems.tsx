import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { theme } from '../theme';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AI_IMAGE_ANALYSIS_FOOD_ITEM } from '@/src/constants/apiConstants';

const CARD_COLORS = ['#FFE5E5', '#E5FFF9', '#FFFDE5', '#F3E8FF', '#FFE5D0', '#E5F0FF'];
const CARD_ACCENTS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#FF9F1C', '#007AFF'];

interface ReviewItemsProps {
  items: AI_IMAGE_ANALYSIS_FOOD_ITEM[];
  onUpdateItem: (
    index: number,
    field: keyof AI_IMAGE_ANALYSIS_FOOD_ITEM,
    value: string | number,
  ) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onConfirm: () => void;
}

export default function ReviewItems({
  items,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
  onConfirm,
}: ReviewItemsProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 100 }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🍽️</Text>
          <Text style={styles.headerTitle}>Is this right?</Text>
          <View style={styles.headerRow}>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </Text>
            </View>
            <TouchableOpacity onPress={onAddItem} style={styles.addIconButton}>
              <Ionicons name="add" size={22} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {items.map((item, idx) => {
          const cardColor = CARD_COLORS[idx % CARD_COLORS.length];
          const accent = CARD_ACCENTS[idx % CARD_ACCENTS.length];
          return (
            <View key={idx} style={[styles.itemCard, { backgroundColor: cardColor }]}>
              <View style={styles.itemTopRow}>
                <View style={[styles.indexBadge, { backgroundColor: accent }]}>
                  <Text style={styles.indexBadgeText}>{idx + 1}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => onRemoveItem(idx)}
                  style={styles.removeButton}
                >
                  <Ionicons name="close" size={18} color="#DC2626" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>ITEM NAME</Text>
                <TextInput
                  value={item.name}
                  onChangeText={(value) => onUpdateItem(idx, 'name', value)}
                  placeholder="Item Name"
                  placeholderTextColor={theme.colors.textTertiary}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, styles.weightChip]}>
                  <Text style={styles.inputLabel}>WEIGHT</Text>
                  <View style={styles.weightRow}>
                    <TextInput
                      value={item.estimatedGrams.toString()}
                      onChangeText={(value) =>
                        onUpdateItem(idx, 'estimatedGrams', Number(value) || 0)
                      }
                      placeholder="0"
                      placeholderTextColor={theme.colors.placeholder}
                      keyboardType="numeric"
                      style={styles.input}
                    />
                    <Text style={styles.unitLabel}>g</Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        <TouchableOpacity onPress={onAddItem} style={styles.addButton}>
          <Ionicons name="add-circle" size={28} color="#4ECDC4" />
          <Text style={styles.addButtonText}>Add Something Else</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      <BlurView
        intensity={60}
        tint="systemChromeMaterialLight"
        style={[styles.floatingButtonContainer, { bottom: insets.bottom + theme.spacing.xl }]}
      >
        <TouchableOpacity onPress={onConfirm} style={styles.confirmButton}>
          <Ionicons name="sparkles" size={22} color={theme.colors.text} />
          <Text style={styles.confirmButtonText}>See Results!</Text>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  countBadge: {
    backgroundColor: theme.card.dailySummary,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    borderColor: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  countBadgeText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  addIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5FFF9',
    borderWidth: 2,
    borderColor: theme.colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  itemCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 3,
    borderColor: theme.colors.text,
    gap: theme.spacing.md,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  indexBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexBadgeText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  inputContainer: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.text,
  },
  weightChip: {
    flex: 0,
    minWidth: 120,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.xxs,
  },
  input: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    padding: 0,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  unitLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textTertiary,
  },
  addButton: {
    paddingVertical: theme.spacing.md,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: '#4ECDC4',
    backgroundColor: '#E5FFF9',
    borderRadius: theme.borderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  addButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#059669',
  },
  floatingButtonContainer: {
    position: 'absolute',
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: theme.borderRadius.xl,
    borderWidth: 3,
    borderColor: theme.colors.text,
    zIndex: 40,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  confirmButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  confirmButtonText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
