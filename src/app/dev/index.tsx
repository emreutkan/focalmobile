import { Redirect, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { theme } from "@/src/theme";

type ScreenLink = {
  title: string;
  href: string;
  description?: string;
};

const screens: ScreenLink[] = [
  { title: "Home", href: "/", description: "src/app/index.tsx" },
  { title: "Image Analyzer", href: "/imageAnalyzer", description: "src/app/imageAnalyzer.tsx" },
  { title: "Food Review", href: "/foodReview", description: "src/app/foodReview.tsx" },
  { title: "Nutrition Results", href: "/nutritionResults", description: "src/app/nutritionResults.tsx" },
  { title: "Components", href: "/dev/components", description: "Component previews" },
];

export default function DevScreenLauncher() {
  if (!__DEV__) {
    return <Redirect href="/" />;
  }

  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={styles.title}>Dev Screen Launcher</Text>
      <Text style={styles.subtitle}>Jump straight to a screen without navigating the app.</Text>

      <View style={styles.list}>
        {screens.map((screen) => (
          <Pressable
            key={screen.href}
            style={styles.card}
            onPress={() => router.push(screen.href)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{screen.title}</Text>
              <Text style={styles.badge}>{screen.href}</Text>
            </View>
            {screen.description ? (
              <Text style={styles.cardDesc}>{screen.description}</Text>
            ) : null}
          </Pressable>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Tip: open <Text style={styles.mono}>/dev</Text> in Expo Go for quick access.
        </Text>
      </View>
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
  list: {
    gap: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.xs,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  badge: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primaryDark,
  },
  cardDesc: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textTertiary,
  },
  footer: {
    marginTop: theme.spacing.xl,
  },
  footerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  mono: {
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.primary,
  },
});
