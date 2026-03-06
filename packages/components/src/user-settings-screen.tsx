import type { ReactNode } from "react";
import { Bell, Palette, Shield, User } from "lucide-react";
import { SettingsShell, type SettingsNavItem } from "./settings-shell";

export interface UserSettingsScreenProps {
  activeTab: string;
  profileContent: ReactNode;
  securityContent: ReactNode;
  notificationsContent: ReactNode;
  preferencesContent: ReactNode;
  onTabChange: (tab: string) => void;
}

const tabs: SettingsNavItem[] = [
  { id: "profile", label: "프로필", icon: User },
  { id: "security", label: "보안", icon: Shield },
  { id: "notifications", label: "알림", icon: Bell },
  { id: "preferences", label: "개인화", icon: Palette },
];

export function UserSettingsScreen({
  activeTab,
  profileContent,
  securityContent,
  notificationsContent,
  preferencesContent,
  onTabChange,
}: UserSettingsScreenProps) {
  return (
    <SettingsShell
      activeTab={activeTab}
      description="내 계정 정보와 알림, 보안, 사용 환경을 관리합니다."
      tabs={tabs}
      title="사용자 설정"
      onTabChange={onTabChange}
    >
      {activeTab === "profile" ? profileContent : null}
      {activeTab === "security" ? securityContent : null}
      {activeTab === "notifications" ? notificationsContent : null}
      {activeTab === "preferences" ? preferencesContent : null}
    </SettingsShell>
  );
}
