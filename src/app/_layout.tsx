import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthListener } from "@/src/hooks/useAuthListener";
import AuthGate from "@/src/components/AuthGate";

export default function RootLayout() {
  useAuthListener();

  return (
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
        </Stack>
      </AuthGate>
    </SafeAreaProvider>
  );
}
