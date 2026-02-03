import React, { useMemo, useState } from "react";
import { Redirect, Stack, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "@/src/theme";
import MacroBreakdownModal from "@/src/components/MacroBreakdownModal";
import SettingsModal from "@/src/components/SettingsModal";
import DailySummaryCard from "@/src/components/Cards/dailySummaryCard";
import ProteinCard from "@/src/components/Cards/proteinCard";
import CarbCard from "@/src/components/Cards/carbCard";
import FatCard from "@/src/components/Cards/fatCard";

type DemoItem = {
  name: string;
  value: number;
  time: string;
};

export default function DevComponents() {
  if (!__DEV__) {
    return <Redirect href="/" />;
  }

  const router = useRouter();
  const [showMacro, setShowMacro] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const macroItems = useMemo<DemoItem[]>(
    () => [
      { name: "Breakfast", value: 420, time: "08:05" },
      { name: "Lunch", value: 610, time: "12:30" },
      { name: "Snack", value: 180, time: "15:20" },
      { name: "Dinner", value: 520, time: "19:10" },
    ],
    []
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={styles.title}>Dev Components</Text>
      <Text style={styles.subtitle}>Preview shared UI without navigating the app.</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Full Screen Previews</Text>
        <Pressable style={styles.rowButton} onPress={() => router.push("/dev/components/loading-screen")}>
          <Text style={styles.rowButtonText}>LoadingScreen</Text>
          <Text style={styles.rowButtonMeta}>Full screen</Text>
        </Pressable>
        <Pressable style={styles.rowButton} onPress={() => router.push("/dev/components/model-loading-splash")}>
          <Text style={styles.rowButtonText}>ModelLoadingSplash</Text>
          <Text style={styles.rowButtonMeta}>Full screen</Text>
        </Pressable>
        <Pressable style={styles.rowButton} onPress={() => router.push("/dev/components/review-items")}>
          <Text style={styles.rowButtonText}>ReviewItems</Text>
          <Text style={styles.rowButtonMeta}>Full screen</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Modals</Text>
        <Pressable style={styles.rowButton} onPress={() => setShowMacro(true)}>
          <Text style={styles.rowButtonText}>MacroBreakdownModal</Text>
          <Text style={styles.rowButtonMeta}>Opens modal</Text>
        </Pressable>
        <Pressable style={styles.rowButton} onPress={() => setShowSettings(true)}>
          <Text style={styles.rowButtonText}>SettingsModal</Text>
          <Text style={styles.rowButtonMeta}>Opens modal (delete is live)</Text>
        </Pressable>
        <Text style={styles.note}>
          SettingsModal uses real data deletion. Use with care.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cards</Text>
        <View style={styles.cardBlock}>
          <DailySummaryCard calories={1420} />
        </View>
        <View style={styles.cardRow}>
          <ProteinCard value={98} />
          <CarbCard value={220} />
          <FatCard value={65} />
        </View>
      </View>

      <MacroBreakdownModal
        visible={showMacro}
        onClose={() => setShowMacro(false)}
        title="CALORIES BREAKDOWN"
        total={1730}
        unit="kcal"
        items={macroItems}
        headerColor={theme.card.dailySummary}
        circleColor={theme.card.dailySummary}
        progressColor={theme.card.dailySummary}
      />

      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.layout.screenPadding,
    paddingBottom: theme.spacing.xxl,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  rowButton: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    marginBottom: theme.spacing.sm,
  },
  rowButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  rowButtonMeta: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textTertiary,
  },
  note: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textTertiary,
  },
  cardBlock: {
    marginBottom: theme.spacing.md,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
