import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type FoodItem = {
  name: string;
  quantity: string;
  estimatedGrams: number;
  confidence?: number;
};

function getConfidenceStyle(confidence?: number): { color: string; label: string; warn: boolean } {
  if (confidence === undefined) return { color: theme.card.dailySummary, label: '', warn: false };
  if (confidence >= 0.8) return { color: '#D1FAE5', label: 'I\'m sure!', warn: false };
  if (confidence >= 0.6) return { color: theme.card.yellowAccent, label: 'Most likely...', warn: false };
  if (confidence >= 0.4) return { color: '#FFE5CC', label: 'Probably?', warn: true };
  return { color: '#FFD6D6', label: 'No idea 😬 fix me', warn: true };
}

interface ReviewItemsProps {
  items: FoodItem[];
  onUpdateItem: (index: number, field: keyof FoodItem, value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onConfirm: () => void;
  userNotes: string;
  onUserNotesChange: (notes: string) => void;
}

function toDisplayName(name: string): string {
  return name.replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ReviewItems({ items, onUpdateItem, onAddItem, onRemoveItem, onConfirm, userNotes, onUserNotesChange }: ReviewItemsProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerEyebrow}>AI DETECTED</Text>
              <Text style={styles.headerTitle}>
                {items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={onAddItem} style={styles.addIconBtn}>
                <Ionicons name="add" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>Adjust anything that looks off</Text>
        </View>

        {/* Items */}
        {items.map((item, idx) => {
          const conf = getConfidenceStyle(item.confidence);
          return (
            <View key={idx} style={[styles.card, { backgroundColor: conf.color }]}>
              {/* Card top bar */}
              <View style={styles.cardTopBar}>
                <View style={styles.cardNumber}>
                  <Text style={styles.cardNumberText}>{idx + 1}</Text>
                </View>
                {conf.label ? (
                  <View style={[styles.confidenceBadge, conf.warn && styles.confidenceBadgeWarn]}>
                    {conf.warn && <Ionicons name="alert-circle" size={13} color="#DC2626" />}
                    <Text style={[styles.confidenceText, conf.warn && styles.confidenceTextWarn]}>
                      {conf.label}
                    </Text>
                  </View>
                ) : null}
                <TouchableOpacity onPress={() => onRemoveItem(idx)} style={styles.removeBtn}>
                  <Ionicons name="close" size={16} color="#DC2626" />
                </TouchableOpacity>
              </View>

              {/* Name input */}
              <View style={styles.nameInputWrap}>
                <TextInput
                  value={toDisplayName(item.name)}
                  onChangeText={(v) => onUpdateItem(idx, 'name', v.toLowerCase())}
                  placeholder="Food name..."
                  placeholderTextColor="rgba(0,0,0,0.3)"
                  style={styles.nameInput}
                />
              </View>

              {/* Weight row */}
              <View style={styles.weightRow}>
                <Text style={styles.weightLabel}>WEIGHT</Text>
                <View style={styles.weightInputWrap}>
                  <TextInput
                    value={item.estimatedGrams.toString()}
                    onChangeText={(v) => onUpdateItem(idx, 'estimatedGrams', Number(v) || 0)}
                    placeholder="0"
                    placeholderTextColor="rgba(0,0,0,0.3)"
                    keyboardType="numeric"
                    style={styles.weightInput}
                  />
                  <Text style={styles.weightUnit}>g</Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* Add button */}
        <TouchableOpacity onPress={onAddItem} style={styles.addBtn}>
          <Ionicons name="add-circle-outline" size={24} color={theme.colors.text} />
          <Text style={styles.addBtnText}>ADD ANOTHER ITEM</Text>
        </TouchableOpacity>

        {/* User notes */}
        <View style={styles.notesWrap}>
          <Text style={styles.notesLabel}>ANYTHING TO ADD?</Text>
          <Text style={styles.notesHint}>e.g. "I only ate half the rice"</Text>
          <TextInput
            value={userNotes}
            onChangeText={onUserNotesChange}
            placeholder="Tell the AI what you actually ate..."
            placeholderTextColor={theme.colors.textTertiary}
            style={styles.notesInput}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>

      {/* Floating confirm */}
      <View style={[styles.floatingBar, { bottom: insets.bottom + theme.spacing.lg }]}>
        <TouchableOpacity onPress={onConfirm} style={styles.confirmBtn} activeOpacity={0.85}>
          <Ionicons name="sparkles" size={22} color={theme.colors.text} />
          <Text style={styles.confirmText}>CALCULATE NUTRITION</Text>
          <Ionicons name="arrow-forward" size={20} color={theme.colors.text} />
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
  scroll: { flex: 1 },
  scrollContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },

  // Header
  header: {
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerEyebrow: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textTertiary,
    letterSpacing: 3,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  addIconBtn: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.card,
    borderWidth: 3,
    borderColor: theme.colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.text,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },

  // Card
  card: {
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.15)',
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  cardTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardNumberText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  confidenceBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    marginHorizontal: theme.spacing.sm,
  },
  confidenceBadgeWarn: {
    backgroundColor: '#FEE2E2',
  },
  confidenceText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: 'rgba(0,0,0,0.5)',
  },
  confidenceTextWarn: {
    color: '#DC2626',
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Name input
  nameInputWrap: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.2)',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  nameInput: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    padding: 0,
  },

  // Weight row
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weightLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: 'rgba(0,0,0,0.4)',
    letterSpacing: 2,
  },
  weightInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.2)',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    minWidth: 100,
  },
  weightInput: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    padding: 0,
    flex: 1,
    textAlign: 'right',
  },
  weightUnit: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: 'rgba(0,0,0,0.4)',
  },

  // Notes
  notesWrap: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  notesLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textTertiary,
    letterSpacing: 2,
  },
  notesHint: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  notesInput: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    minHeight: 72,
    textAlignVertical: 'top',
    padding: 0,
  },

  // Add button
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: theme.colors.text,
    borderRadius: theme.borderRadius['2xl'],
    paddingVertical: theme.spacing.lg,
    backgroundColor: 'transparent',
  },
  addBtnText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: 1,
  },

  // Floating confirm
  floatingBar: {
    position: 'absolute',
    left: theme.spacing.lg,
    right: theme.spacing.lg,
  },
  confirmBtn: {
    backgroundColor: theme.card.yellowAccent,
    borderWidth: 3,
    borderColor: theme.colors.text,
    borderRadius: theme.borderRadius['2xl'],
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  confirmText: {
    flex: 1,
    textAlign: 'center',
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: 1,
  },
});
