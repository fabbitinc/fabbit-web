import type { ReactNode } from "react";
import { Shield, User } from "lucide-react";
import { SettingsShell, type SettingsNavItem } from "./settings-shell";

export interface UserSettingsScreenProps {
  activeTab: string;
  profileContent: ReactNode;
  securityContent: ReactNode;
  onTabChange: (tab: string) => void;
}

const tabs: SettingsNavItem[] = [
  { id: "profile", label: "프로필", icon: User },
  { id: "security", label: "보안", icon: Shield },
];

export function UserSettingsScreen({
  activeTab,
  profileContent,
  securityContent,
  onTabChange,
}: UserSettingsScreenProps) {
  return (
    <SettingsShell
      activeTab={activeTab}
      description="내 계정 정보와 보안을 관리합니다."
      tabs={tabs}
      title="사용자 설정"
      onTabChange={onTabChange}
    >
      {activeTab === "profile" ? profileContent : null}
      {activeTab === "security" ? securityContent : null}
    </SettingsShell>
  );
}
