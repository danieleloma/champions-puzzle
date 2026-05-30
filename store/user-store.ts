import { create } from "zustand";
import type { StoredUser } from "@/lib/device-identity";
import { getStoredUser, storeUser, getOrCreateDeviceId } from "@/lib/device-identity";

interface UserState {
  user: StoredUser | null;
  isLoading: boolean;
  isOnboarded: boolean;

  init: () => void;
  setUser: (user: StoredUser) => void;
  addXP: (xp: number) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: true,
  isOnboarded: false,

  init: () => {
    const stored = getStoredUser();
    set({
      user: stored,
      isOnboarded: !!stored,
      isLoading: false,
    });
  },

  setUser: (user) => {
    storeUser(user);
    set({ user, isOnboarded: true });
  },

  addXP: (xp) => {
    const { user } = get();
    if (!user) return;
    const updated = { ...user, xp: user.xp + xp };
    storeUser(updated);
    set({ user: updated });
  },

  clearUser: () => {
    set({ user: null, isOnboarded: false });
  },
}));
