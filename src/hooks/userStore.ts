import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
interface UserStore {
  isPro: boolean;
  isAuthLoading: boolean;
  hasSeenOnboarding: boolean;
  isAuthenticated: boolean;
  isBackendUp: boolean;
  setIsPro: (isPro: boolean) => void;
  setIsAuthLoading: (isAuthLoading: boolean) => void;
  setHasSeenOnboarding: (hasSeenOnboarding: boolean) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsBackendUp: (isBackendUp: boolean) => void;
}

export const useUserStore = create(
  persist<UserStore>(
    (set) => ({
    isPro: false,
    isAuthLoading: true,
    hasSeenOnboarding: false,
    isAuthenticated: false,
    isBackendUp: false,
    setIsPro: (isPro) => set({ isPro }),
    setIsAuthLoading: (isAuthLoading) => set({ isAuthLoading }),
    setHasSeenOnboarding: (hasSeenOnboarding) => set({ hasSeenOnboarding }),
    setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
    setIsBackendUp: (isBackendUp) => set({ isBackendUp }),
  }),
  {
    name: "user-store",
    storage: createJSONStorage(() => AsyncStorage),
  }
    ),
  );