import { ProjectSettingsLabelsTab, ProjectSettingsScreen as ProjectSettingsScreenView } from "@fabbit/components";
import { ProjectSettingsDangerTab } from "@/features/project-detail/components/project-settings-danger-tab";
import { ProjectSettingsGeneralTab } from "@/features/project-detail/components/project-settings-general-tab";
import { ProjectSettingsMembersTab } from "@/features/project-detail/components/project-settings-members-tab";
import type {
  ProjectDetailModel,
  ProjectSettingsTab,
} from "@/features/project-detail/types/project-detail-model";

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
    <ProjectSettingsScreenView
      activeTab={activeTab}
      dangerContent={(
        <ProjectSettingsDangerTab
          isArchived={project.isArchived}
          projectId={project.id}
          projectName={project.name}
          onDeleted={onDeleted}
        />
      )}
      generalContent={<ProjectSettingsGeneralTab isReadonly={project.isArchived} project={project} />}
      labelsContent={<ProjectSettingsLabelsTab />}
      membersContent={<ProjectSettingsMembersTab isReadonly={project.isArchived} projectId={project.id} />}
      onTabChange={(tab) => onTabChange(tab as ProjectSettingsTab)}
    />
  );
}
