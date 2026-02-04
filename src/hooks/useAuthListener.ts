import { useEffect } from "react";
import { useUserStore } from "./userStore";
import { onAuthStateChange, getCurrentUser } from "@/src/lib/auth";

export function useAuthListener() {
  const { setAuthUser, setAuthLoading } = useUserStore();

  useEffect(() => {
    // Check for existing session on mount
    const initAuth = async () => {
      try {
        const user = await getCurrentUser();
        setAuthUser(user);
      } catch (error) {
        console.error("Error checking auth state:", error);
      } finally {
        setAuthLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: subscription } = onAuthStateChange((user) => {
      setAuthUser(user);
      setAuthLoading(false);
    });

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, [setAuthUser, setAuthLoading]);
}
