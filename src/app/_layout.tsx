import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthListener } from "@/src/hooks/useAuthListener";
import AuthGate from "@/src/components/AuthGate";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { checkHealth, HealthStatus } from "@/src/services/mealService";
import { useUserStore } from "@/src/hooks/userStore";
import MaintenanceScreen from "@/src/components/MaintenanceScreen";

import { ThemeProvider } from "@/src/contexts/ThemeContext";

const queryClient = new QueryClient();
const POLL_INTERVAL_MS = 10_000;

export default function RootLayout() {
  useAuthListener();
  const { isBackendUp, setIsBackendUp } = useUserStore();
  const [checked, setChecked] = useState(false);
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({ api: false, db: false });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runCheck = async () => {
    const status = await checkHealth();
    const up = status.api && status.db;
    setHealthStatus(status);
    setIsBackendUp(up);
    setChecked(true);
    return up;
  };

  useEffect(() => {
    runCheck().then((up) => {
      if (!up) {
        pollRef.current = setInterval(async () => {
          const nowUp = await runCheck();
          if (nowUp && pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }, POLL_INTERVAL_MS);
      }
    });

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  if (checked && !isBackendUp) {
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <MaintenanceScreen healthStatus={healthStatus} />
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
