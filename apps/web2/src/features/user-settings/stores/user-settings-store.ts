import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserSecuritySettings {
  mfaEnabled: boolean;
  loginAlertEnabled: boolean;
  sessionProtection: boolean;
}

interface UserNotificationSettings {
  emailNotification: boolean;
  mentionNotification: boolean;
  digestNotification: boolean;
}

interface UserPreferenceSettings {
  compactMode: boolean;
  autoSaveDraft: boolean;
}

interface UserSettingsStoreState {
  security: UserSecuritySettings;
  notifications: UserNotificationSettings;
  preferences: UserPreferenceSettings;
  setSecurity: (next: Partial<UserSecuritySettings>) => void;
  setNotifications: (next: Partial<UserNotificationSettings>) => void;
  setPreferences: (next: Partial<UserPreferenceSettings>) => void;
  reset: () => void;
}

const initialSecurity: UserSecuritySettings = {
  mfaEnabled: true,
  loginAlertEnabled: true,
  sessionProtection: true,
};

const initialNotifications: UserNotificationSettings = {
  emailNotification: true,
  mentionNotification: true,
  digestNotification: false,
};

const initialPreferences: UserPreferenceSettings = {
  compactMode: false,
  autoSaveDraft: true,
};

export const useUserSettingsStore = create<UserSettingsStoreState>()(
  persist(
    (set) => ({
      security: initialSecurity,
      notifications: initialNotifications,
      preferences: initialPreferences,
      setSecurity: (next) =>
        set((state) => ({
          security: {
            ...state.security,
            ...next,
          },
        })),
      setNotifications: (next) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            ...next,
          },
        })),
      setPreferences: (next) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...next,
          },
        })),
      reset: () =>
        set({
          security: initialSecurity,
          notifications: initialNotifications,
          preferences: initialPreferences,
        }),
    }),
    {
      name: "fabbit-web2-user-settings",
      version: 1,
      partialize: (state) => ({
        security: state.security,
        notifications: state.notifications,
        preferences: state.preferences,
      }),
    },
  ),
);
