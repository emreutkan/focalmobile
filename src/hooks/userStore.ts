import { create } from "zustand";
import { User } from "@supabase/supabase-js";

interface UserStore {
  // Auth state
  authUser: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;

  // User preferences
  user: {
    isPro: boolean;
  };

  // Actions
  setAuthUser: (user: User | null) => void;
  setAuthLoading: (loading: boolean) => void;
  setUser: (user: UserStore["user"]) => void;
  signOut: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  // Auth state
  authUser: null,
  isAuthenticated: false,
  isAuthLoading: true,

  // User preferences
  user: {
    isPro: false,
  },

  // Actions
  setAuthUser: (authUser) =>
    set({
      authUser,
      isAuthenticated: !!authUser,
    }),

  setAuthLoading: (isAuthLoading) => set({ isAuthLoading }),

  setUser: (user) => set({ user }),

  signOut: () =>
    set({
      authUser: null,
      isAuthenticated: false,
      user: { isPro: false },
    }),
}));
