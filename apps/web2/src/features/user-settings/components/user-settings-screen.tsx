import { Bell, Palette, Shield, User } from "lucide-react";
import { SettingsShell, type SettingsNavItem } from "@/components/settings-shell";
import { UserNotificationsSettingsTab } from "@/features/user-settings/components/user-notifications-settings-tab";
import { UserPreferencesSettingsTab } from "@/features/user-settings/components/user-preferences-settings-tab";
import { UserProfileSettingsTab } from "@/features/user-settings/components/user-profile-settings-tab";
import { UserSecuritySettingsTab } from "@/features/user-settings/components/user-security-settings-tab";
import type { UserSettingsTab } from "@/features/user-settings/types/user-settings-model";

interface UserSettingsScreenProps {
  activeTab: UserSettingsTab;
  onTabChange: (tab: UserSettingsTab) => void;
}

const tabs: SettingsNavItem[] = [
  { id: "profile", label: "프로필", icon: User },
  { id: "security", label: "보안", icon: Shield },
  { id: "notifications", label: "알림", icon: Bell },
  { id: "preferences", label: "개인화", icon: Palette },
];

export function UserSettingsScreen({ activeTab, onTabChange }: UserSettingsScreenProps) {
  return (
    <SettingsShell
      activeTab={activeTab}
      description="내 계정 정보와 알림, 보안, 사용 환경을 관리합니다."
      tabs={tabs}
      title="사용자 설정"
      onTabChange={(tabId) => onTabChange(tabId as UserSettingsTab)}
    >
      {activeTab === "profile" ? <UserProfileSettingsTab /> : null}
      {activeTab === "security" ? <UserSecuritySettingsTab /> : null}
      {activeTab === "notifications" ? <UserNotificationsSettingsTab /> : null}
      {activeTab === "preferences" ? <UserPreferencesSettingsTab /> : null}
    </SettingsShell>
  );
}
