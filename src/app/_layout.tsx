import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuthListener } from "@/src/hooks/useAuthListener";
import { useUserStore } from "@/src/hooks/userStore";
import { theme } from "@/src/theme";

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isAuthLoading } = useUserStore();

  useEffect(() => {
    if (isAuthLoading) return;

    const inAuthGroup = segments[0] === "auth";

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to auth if not logged in
      router.replace("/auth");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home if logged in and on auth screen
      router.replace("/");
    }
  }, [isAuthenticated, isAuthLoading, segments]);

  if (isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.text} />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  useAuthListener();

  return (
    <SafeAreaProvider>
      <AuthGate>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="imageAnalyzer" options={{ headerShown: false }} />
        </Stack>
      </AuthGate>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
});