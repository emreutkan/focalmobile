import { Stack } from "expo-router";
import { theme } from "@/src/theme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";



export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="imageAnalyzer" options={{ headerShown: false }} />
        <Stack.Screen name="foodReview" options={{ headerShown: false }} />
        <Stack.Screen name="nutritionResults" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}