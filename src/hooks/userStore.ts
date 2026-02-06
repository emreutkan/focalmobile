import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
interface UserStore {
  isPro: boolean;
  isAuthLoading: boolean;
  hasSeenOnboarding: boolean;
  isAuthenticated: boolean;
  setIsPro: (isPro: boolean) => void;
  setIsAuthLoading: (isAuthLoading: boolean) => void;
  setHasSeenOnboarding: (hasSeenOnboarding: boolean) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;  
}

export const useUserStore = create(
  persist<UserStore>(
    (set) => ({
    // now these are the left side section of useState
    isPro: true,
    isAuthLoading: true,
    hasSeenOnboarding: false,
    isAuthenticated: false,
    // and thse are the right side setters 
    setIsPro: (isPro) => set({ isPro }),
    setIsAuthLoading: (isAuthLoading) => set({ isAuthLoading }),
    setHasSeenOnboarding: (hasSeenOnboarding) => set({ hasSeenOnboarding }),
    setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  }),
  {
    name: "user-store",
    storage: createJSONStorage(() => AsyncStorage),
  }
    ),
  );