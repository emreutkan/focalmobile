import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { theme } from "@/src/theme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ModelProvider } from "@/src/contexts/ModelContext";
import { ModelSetupModal } from "@/src/components/ModelSetupModal";
import ModelLoadingSplash from "@/src/components/ModelLoadingSplash";

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const { initDatabase } = await import("@/src/utils/database");
        await initDatabase();
        console.log("Database initialized");
      } catch (error) {
        console.error("Database init error:", error);
      }
      setDbReady(true);
    };
    init();
  }, []);

  return (
    <SafeAreaProvider>
      <ModelProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="imageAnalyzer" options={{ headerShown: false }} />
          <Stack.Screen name="foodReview" options={{ headerShown: false }} />
          <Stack.Screen name="nutritionResults" options={{ headerShown: false }} />
        </Stack>
        <ModelLoadingSplash />
        <ModelSetupModal />
      </ModelProvider>
    </SafeAreaProvider>
  );
}
