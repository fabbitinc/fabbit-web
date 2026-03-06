import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthSessionModel } from "@/features/auth/types/auth-model";

interface AuthStoreState {
  user: AuthSessionModel["user"] | null;
  memberships: AuthSessionModel["memberships"];
  currentMembership: AuthSessionModel["currentMembership"];
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  setSession: (session: AuthSessionModel) => void;
  clearSession: () => void;
  setBootstrapping: (isBootstrapping: boolean) => void;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      user: null,
      memberships: [],
      currentMembership: null,
      isAuthenticated: false,
      isBootstrapping: true,
      setSession: (session) =>
        set({
          user: session.user,
          memberships: session.memberships,
          currentMembership: session.currentMembership,
          isAuthenticated: true,
        }),
      clearSession: () =>
        set({
          user: null,
          memberships: [],
          currentMembership: null,
          isAuthenticated: false,
        }),
      setBootstrapping: (isBootstrapping) => set({ isBootstrapping }),
    }),
    {
      name: "fabbit-web2-auth",
      version: 1,
      partialize: (state) => ({
        user: state.user,
        memberships: state.memberships,
        currentMembership: state.currentMembership,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
