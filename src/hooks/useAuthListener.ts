import { useEffect } from "react";
import { useUserStore } from "./userStore";
import { onAuthStateChange, getCurrentUser } from "@/src/lib/auth";

export function useAuthListener() {
  const setIsAuthLoading = useUserStore((s) => s.setIsAuthLoading);
  const setIsAuthenticated = useUserStore((s) => s.setIsAuthenticated);

  const initAuth = async () => {
    try {
      const user = await getCurrentUser();
      setIsAuthenticated(!!user);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsAuthLoading(false);
    }
  };

  useEffect(() => {

    initAuth();

    // Supabase's onAuthStateChange opens a persistent connection that listens for auth events. Think of it like a phone line that stays open.

    //// You're saying: "Hey Supabase, call me whenever auth changes"

    const { data: subscription } = onAuthStateChange((session) => {
      setIsAuthenticated(!!session);
      setIsAuthLoading(false);
    });

    // You're saying: "Stop calling me. Hang up the phone. I don't need updates anymore."
    return () => subscription?.subscription.unsubscribe();
  }, []);
}