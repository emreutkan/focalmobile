import { useRouter, useSegments } from "expo-router";
import { useUserStore } from "@/src/hooks/userStore";
import { useEffect } from "react";
import LoadingSplash from "@/src/components/LoadingSplash";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const isAuthLoading = useUserStore((state) => state.isAuthLoading);
  const hasSeenOnboarding = useUserStore((state) => state.hasSeenOnboarding);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  useEffect(() => {
    if (isAuthLoading) return;

    const currentRoute = segments[0];
    const inOnboarding = currentRoute === "onboarding";
    const inAuth = currentRoute === "auth";

    // First time users go to onboarding
    if (!hasSeenOnboarding && !inOnboarding) {
      router.replace("/onboarding");
      return;
    }
    console.log("hasSeenOnboarding", hasSeenOnboarding);
    console.log("inOnboarding", inOnboarding);
    console.log("inAuth", inAuth);
    console.log("currentRoute", currentRoute);

    // After onboarding, check auth
    if (hasSeenOnboarding) {
      if (!isAuthenticated && !inAuth) {
        router.replace("/auth");      
      } else if (isAuthenticated && (inAuth || inOnboarding)) {
        router.replace("/");         
      }
    }
  }, [isAuthLoading, hasSeenOnboarding, isAuthenticated, segments]);

  if (isAuthLoading) {
    return <LoadingSplash />;
  }

  return <>{children}</>;
}
