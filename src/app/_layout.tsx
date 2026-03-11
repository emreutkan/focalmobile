import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthListener } from "@/src/hooks/useAuthListener";
import AuthGate from "@/src/components/AuthGate";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { checkHealth } from "@/src/services/mealService";
import { useUserStore } from "@/src/hooks/userStore";
import MaintenanceScreen from "@/src/components/MaintenanceScreen";

import { ThemeProvider } from "@/src/contexts/ThemeContext";

const queryClient = new QueryClient();

export default function RootLayout() {
  useAuthListener();
  const { isBackendUp, setIsBackendUp } = useUserStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    checkHealth().then((up) => {
      setIsBackendUp(up);
      setChecked(true);
    });
  }, []);

  if (checked && !isBackendUp) {
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <MaintenanceScreen />
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <SafeAreaProvider>
      <AuthGate>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="imageAnalyzer" />
          <Stack.Screen name="pro" />
          <Stack.Screen name="dev" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="foodReview" />
          <Stack.Screen name="nutritionResults" />
          <Stack.Screen name="mealDetail" />
        </Stack>
      </AuthGate>
    </SafeAreaProvider>
    </ThemeProvider>
    </QueryClientProvider>
  );
}
