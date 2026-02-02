import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { theme } from "../theme";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface FoodItem {
  name: string;
  quantity: string;
  estimatedGrams: number;
}

interface ReviewItemsProps {
  items: FoodItem[];
  onUpdateItem: (index: number, field: keyof FoodItem, value: string | number) => void;
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Is this right?</Text>
        <Text style={styles.headerSubtitle}>Double check the items!</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {items.map((item, idx) => (
          <View key={idx} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <TextInput
                value={item.name}
                onChangeText={(value) => onUpdateItem(idx, "name", value)}
                placeholder="Item Name"
                placeholderTextColor={theme.colors.textTertiary}
                style={styles.nameInput}
              />
              <TouchableOpacity
                onPress={() => onRemoveItem(idx)}
                style={styles.removeButton}
              >
                <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>QUANTITY</Text>
                <TextInput
                  value={item.quantity}
                  onChangeText={(value) => onUpdateItem(idx, "quantity", value)}
                  placeholder="1 serving"
                  placeholderTextColor={theme.colors.placeholder}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>WEIGHT (G)</Text>
                <TextInput
                  value={item.estimatedGrams.toString()}
                  onChangeText={(value) => onUpdateItem(idx, "estimatedGrams", Number(value) || 0)}
                  placeholder="0"
                  placeholderTextColor={theme.colors.placeholder}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity onPress={onAddItem} style={styles.addButton}>
          <Ionicons name="add" size={24} color={theme.colors.textSecondary} />
          <Text style={styles.addButtonText}>Add Something Else</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.spacing.md }]}>
        <TouchableOpacity onPress={onConfirm} style={styles.confirmButton}>
          <Text style={styles.confirmButtonText}>See Results!</Text>
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
  header: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  itemCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 4,
    borderColor: theme.colors.text,
    ...theme.shadows.lg,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.md,
  },
  nameInput: {
    flex: 1,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    borderBottomWidth: 4,
    borderBottomColor: "#FFE66D",
    paddingBottom: theme.spacing.xs,
    marginRight: theme.spacing.md,
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.text,
    alignItems: "center",
    justifyContent: "center",
  },
  inputRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.text,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
  },
  input: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    padding: 0,
  },
  addButton: {
    marginTop: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderWidth: 4,
    borderStyle: "dashed",
    borderColor: theme.colors.divider,
    borderRadius: theme.borderRadius.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  addButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textSecondary,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background + "E6", // 90% opacity
    borderTopWidth: 4,
    borderTopColor: theme.colors.text,
  },
  confirmButton: {
    backgroundColor: theme.card.dailySummary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 4,
    borderColor: theme.colors.text,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.lg,
  },
  confirmButtonText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
});
