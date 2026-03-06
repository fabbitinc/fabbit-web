import { ProjectDetailScreen as ProjectDetailScreenView } from "@fabbit/components";
import { useNavigate } from "react-router-dom";
import { ProjectActivityTab } from "@/features/project-detail/components/project-activity-tab";
import { ProjectPartsTab } from "@/features/project-detail/components/project-parts-tab";
import { ProjectSettingsScreen } from "@/features/project-detail/components/project-settings-screen";
import { useProjectDetailQuery } from "@/features/project-detail/hooks/use-project-detail-query";
import type {
  ProjectDetailView,
  ProjectSettingsTab,
} from "@/features/project-detail/types/project-detail-model";

interface ProjectDetailScreenProps {
  activeView: ProjectDetailView;
  onActiveViewChange: (view: ProjectDetailView) => void;
  onSettingsTabChange: (tab: ProjectSettingsTab) => void;
  projectId: string;
  settingsTab: ProjectSettingsTab;
}

export function ProjectDetailScreen({
  activeView,
  onActiveViewChange,
  onSettingsTabChange,
  projectId,
  settingsTab,
}: ProjectDetailScreenProps) {
  const navigate = useNavigate();
  const projectQuery = useProjectDetailQuery(projectId, Boolean(projectId));

  return (
    <ProjectDetailScreenView
      activeView={activeView}
      activityContent={projectQuery.data ? <ProjectActivityTab projectId={projectQuery.data.id} /> : null}
      isError={projectQuery.isError || !projectQuery.data}
      isLoading={projectQuery.isLoading}
      partsContent={projectQuery.data ? <ProjectPartsTab isReadonly={projectQuery.data.isArchived} projectId={projectQuery.data.id} /> : null}
      project={projectQuery.data}
      settingsContent={projectQuery.data ? (
        <ProjectSettingsScreen
          activeTab={settingsTab}
          project={projectQuery.data}
          onDeleted={() => navigate("/projects")}
          onTabChange={onSettingsTabChange}
        />
      ) : null}
      onActiveViewChange={onActiveViewChange}
      onBackClick={() => navigate("/projects")}
      onRetry={() => {
        void projectQuery.refetch();
      }}
    />
  );
}
