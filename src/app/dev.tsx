import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/contexts/ThemeContext";
import { Theme } from "@/src/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserStore } from "@/src/hooks/userStore";

export default function DevScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const isPro = useUserStore((state) => state.isPro);
  const setIsPro = useUserStore((state) => state.setIsPro);

  const handleClearUserStore = async () => {
    await AsyncStorage.removeItem("user-store");
    alert("User store cleared! Restart the app.");
  };

  const handleTogglePro = () => {
    setIsPro(!isPro);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>DEV TOOLS</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>USER STATE</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>isPro:</Text>
            <Text style={styles.infoValue}>{isPro ? "true" : "false"}</Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleTogglePro}
          >
            <Text style={styles.buttonText}>Toggle Pro Status</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleClearUserStore}
          >
            <Text style={styles.buttonText}>Clear User Store</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.text,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.text,
  },
  title: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textTertiary,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.text,
  },
  dangerButton: {
    backgroundColor: theme.colors.error,
  },
  buttonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.surface,
  },
});
