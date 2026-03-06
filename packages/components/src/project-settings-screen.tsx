import type { ReactNode } from "react";
import { Settings, ShieldAlert, Tag, Users } from "lucide-react";
import { SettingsShell, type SettingsNavItem } from "./settings-shell";

export interface ProjectSettingsScreenProps {
  activeTab: string;
  generalContent: ReactNode;
  membersContent: ReactNode;
  labelsContent: ReactNode;
  dangerContent: ReactNode;
  onTabChange: (tab: string) => void;
}

const tabs: SettingsNavItem[] = [
  { id: "general", label: "일반", icon: Settings },
  { id: "members", label: "멤버", icon: Users },
  { id: "labels", label: "라벨", icon: Tag },
  { id: "danger", label: "위험 영역", icon: ShieldAlert },
];

export function ProjectSettingsScreen({
  activeTab,
  generalContent,
  membersContent,
  labelsContent,
  dangerContent,
  onTabChange,
}: ProjectSettingsScreenProps) {
  return (
    <SettingsShell
      activeTab={activeTab}
      description="프로젝트 정보, 멤버, 공용 라벨 정책, 보관/삭제를 관리합니다."
      tabs={tabs}
      title="프로젝트 설정"
      onTabChange={onTabChange}
    >
      {activeTab === "general" ? generalContent : null}
      {activeTab === "members" ? membersContent : null}
      {activeTab === "labels" ? labelsContent : null}
      {activeTab === "danger" ? dangerContent : null}
    </SettingsShell>
  );
}
