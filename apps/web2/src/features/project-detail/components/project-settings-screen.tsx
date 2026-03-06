import { Settings, ShieldAlert, Tag, Users } from "lucide-react";
import { SettingsShell, type SettingsNavItem } from "@/components/settings-shell";
import { ProjectSettingsDangerTab } from "@/features/project-detail/components/project-settings-danger-tab";
import { ProjectSettingsGeneralTab } from "@/features/project-detail/components/project-settings-general-tab";
import { ProjectSettingsLabelsTab } from "@/features/project-detail/components/project-settings-labels-tab";
import { ProjectSettingsMembersTab } from "@/features/project-detail/components/project-settings-members-tab";
import type {
  ProjectDetailModel,
  ProjectSettingsTab,
} from "@/features/project-detail/types/project-detail-model";

const tabs: SettingsNavItem[] = [
  { id: "general", label: "일반", icon: Settings },
  { id: "members", label: "멤버", icon: Users },
  { id: "labels", label: "라벨", icon: Tag },
  { id: "danger", label: "위험 영역", icon: ShieldAlert },
];

interface ProjectSettingsScreenProps {
  activeTab: ProjectSettingsTab;
  onDeleted: () => void;
  onTabChange: (tab: ProjectSettingsTab) => void;
  project: ProjectDetailModel;
}

export function ProjectSettingsScreen({
  activeTab,
  onDeleted,
  onTabChange,
  project,
}: ProjectSettingsScreenProps) {
  return (
    <SettingsShell
      activeTab={activeTab}
      description="프로젝트 정보, 멤버, 공용 라벨 정책, 보관/삭제를 관리합니다."
      tabs={tabs}
      title="프로젝트 설정"
      onTabChange={(tabId) => onTabChange(tabId as ProjectSettingsTab)}
    >
      {activeTab === "general" ? (
        <ProjectSettingsGeneralTab isReadonly={project.isArchived} project={project} />
      ) : null}
      {activeTab === "members" ? (
        <ProjectSettingsMembersTab isReadonly={project.isArchived} projectId={project.id} />
      ) : null}
      {activeTab === "labels" ? <ProjectSettingsLabelsTab /> : null}
      {activeTab === "danger" ? (
        <ProjectSettingsDangerTab
          isArchived={project.isArchived}
          projectId={project.id}
          projectName={project.name}
          onDeleted={onDeleted}
        />
      ) : null}
    </SettingsShell>
  );
}
