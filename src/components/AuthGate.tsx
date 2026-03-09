import { useRouter, useSegments, useNavigationContainerRef } from "expo-router";
import { useUserStore } from "@/src/hooks/userStore";
import { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import LoadingSplash from "@/src/components/LoadingSplash";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const navigationRef = useNavigationContainerRef();
  const isAuthLoading = useUserStore((state) => state.isAuthLoading);
  const hasSeenOnboarding = useUserStore((state) => state.hasSeenOnboarding);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxRedirectAttempts = 20;

  useEffect(() => {
    if (isAuthLoading) return;

    const tryRedirect = (attempt = 0) => {
      if (!navigationRef.current?.isReady()) {
        if (attempt < maxRedirectAttempts) {
          timeoutRef.current = setTimeout(() => tryRedirect(attempt + 1), 50);
        }
        return;
      }

      const currentRoute = segments[0];
      const inOnboarding = currentRoute === "onboarding";
      const inAuth = currentRoute === "auth";

      // First time users go to onboarding
      if (!hasSeenOnboarding && !inOnboarding) {
        router.replace("/onboarding");
        return;
      }

      // After onboarding, check auth
      if (hasSeenOnboarding) {
        if (!isAuthenticated && !inAuth) {
          router.replace("/auth");
        } else if (isAuthenticated && (inAuth || inOnboarding)) {
          router.replace("/");
        }
      }
    };

    timeoutRef.current = setTimeout(() => tryRedirect(0), 0);
    return () => {
      if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
    };
  }, [isAuthLoading, hasSeenOnboarding, isAuthenticated, segments]);

  // Always render children (Stack navigator) so Expo Router can mount.
  // Show loading as an overlay when auth is resolving.
  return (
    <View style={styles.container}>
      {children}
      {isAuthLoading && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <LoadingSplash />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
