import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AllowedIpEntry } from "@/features/organization-settings/types/organization-settings-model";

interface OrganizationGeneralSettings {
  allowOutsideInvite: boolean;
  approvalRequired: boolean;
}

interface OrganizationSecuritySettings {
  enforceSso: boolean;
  requireMfa: boolean;
  ipRestrictionEnabled: boolean;
  allowedIps: AllowedIpEntry[];
}

interface OrganizationSettingsStoreState {
  general: OrganizationGeneralSettings;
  security: OrganizationSecuritySettings;
  setGeneral: (next: Partial<OrganizationGeneralSettings>) => void;
  setSecurity: (
    next: Partial<Omit<OrganizationSecuritySettings, "allowedIps">>,
  ) => void;
  addAllowedIp: (cidr: string) => void;
  removeAllowedIp: (id: string) => void;
  reset: () => void;
}

const initialGeneral: OrganizationGeneralSettings = {
  allowOutsideInvite: false,
  approvalRequired: true,
};

const initialSecurity: OrganizationSecuritySettings = {
  enforceSso: false,
  requireMfa: true,
  ipRestrictionEnabled: false,
  allowedIps: [],
};

export const useOrganizationSettingsStore =
  create<OrganizationSettingsStoreState>()(
    persist(
      (set) => ({
        general: initialGeneral,
        security: initialSecurity,
        setGeneral: (next) =>
          set((state) => ({
            general: {
              ...state.general,
              ...next,
            },
          })),
        setSecurity: (next) =>
          set((state) => ({
            security: {
              ...state.security,
              ...next,
            },
          })),
        addAllowedIp: (cidr) =>
          set((state) => ({
            security: {
              ...state.security,
              allowedIps: [
                ...state.security.allowedIps,
                {
                  id: `ip-${Date.now()}`,
                  cidr,
                },
              ],
            },
          })),
        removeAllowedIp: (id) =>
          set((state) => ({
            security: {
              ...state.security,
              allowedIps: state.security.allowedIps.filter(
                (entry) => entry.id !== id,
              ),
            },
          })),
        reset: () =>
          set({
            general: initialGeneral,
            security: initialSecurity,
          }),
      }),
      {
        name: "fabbit-web-organization-settings",
        version: 1,
        partialize: (state) => ({
          general: state.general,
          security: state.security,
        }),
      },
    ),
  );
