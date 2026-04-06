import { UserSettingsScreen as UserSettingsScreenView } from "@fabbit/components";
import { UserProfileSettingsTab } from "@/features/user-settings/components/user-profile-settings-tab";
import { UserSecuritySettingsTab } from "@/features/user-settings/components/user-security-settings-tab";
import type { UserSettingsTab } from "@/features/user-settings/types/user-settings-model";

interface UserSettingsScreenProps {
  activeTab: UserSettingsTab;
  onTabChange: (tab: UserSettingsTab) => void;
}

export function UserSettingsScreen({ activeTab, onTabChange }: UserSettingsScreenProps) {
  return (
    <UserSettingsScreenView
      activeTab={activeTab}
      profileContent={<UserProfileSettingsTab />}
      securityContent={<UserSecuritySettingsTab />}
      onTabChange={(tab) => onTabChange(tab as UserSettingsTab)}
    />
  );
}
