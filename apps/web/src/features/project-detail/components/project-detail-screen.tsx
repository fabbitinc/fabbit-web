import { useMemo } from "react";
import { ProjectDetailScreen as ProjectDetailScreenView, ProjectWorkItemsPanel } from "@fabbit/components";
import { useNavigate } from "react-router-dom";
import { ProjectActivityTab } from "@/features/project-detail/components/project-activity-tab";
import { ProjectPartsTab } from "@/features/project-detail/components/project-parts-tab";
import { ProjectSettingsScreen } from "@/features/project-detail/components/project-settings-screen";
import { useProjectActivitiesQuery } from "@/features/project-detail/hooks/use-project-activities-query";
import { useProjectChangesQuery } from "@/features/project-detail/hooks/use-project-changes-query";
import { useProjectDetailQuery } from "@/features/project-detail/hooks/use-project-detail-query";
import { useProjectIssuesQuery } from "@/features/project-detail/hooks/use-project-issues-query";
import { useProjectPartsQuery } from "@/features/project-detail/hooks/use-project-parts-query";
import { getWebProjectOverviewSummary } from "@/features/project-detail/lib/project-overview-summary";
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
  showWorkItemViews: boolean;
}

function getOverviewActivityState(action: string) {
  switch (action) {
    case "issue:created":
      return "열림";
    case "cr:created":
      return "열림";
    case "cr:merged":
      return "반영";
    case "project:part_added":
      return "추가";
    case "project:updated":
      return "수정";
    default:
      return "활동";
  }
}

function getOverviewActivitySummary(action: string) {
  switch (action) {
    case "project:updated":
      return "프로젝트 정보 수정";
    case "project:part_added":
      return "부품 연결";
    case "project:part_removed":
      return "부품 연결 해제";
    case "project:archived":
      return "프로젝트 보관";
    case "project:unarchived":
      return "프로젝트 보관 해제";
    case "issue:created":
      return "이슈 생성";
    case "cr:created":
      return "변경관리 생성";
    case "cr:merged":
      return "변경관리 반영";
    default:
      return action;
  }
}

export function ProjectDetailScreen({
  activeView,
  onActiveViewChange,
  onSettingsTabChange,
  projectId,
  settingsTab,
  showWorkItemViews,
}: ProjectDetailScreenProps) {
  const navigate = useNavigate();
  const projectQuery = useProjectDetailQuery(projectId, Boolean(projectId));
  const overviewPartsQuery = useProjectPartsQuery(projectId, { limit: 5, offset: 0 }, Boolean(projectId));
  const overviewActivitiesQuery = useProjectActivitiesQuery(projectId, { limit: 3 }, Boolean(projectId));
  const projectIssuesQuery = useProjectIssuesQuery(projectId, Boolean(projectId));
  const projectChangesQuery = useProjectChangesQuery(projectId, Boolean(projectId));
  const overviewSummary = getWebProjectOverviewSummary();

  const projectView = useMemo(() => {
    if (!projectQuery.data) {
      return undefined;
    }

    return {
      ...projectQuery.data,
      issueCount: projectIssuesQuery.data?.total ?? 0,
      changeCount: projectChangesQuery.data?.total ?? 0,
      mergedChangeCount:
        projectChangesQuery.data?.items.filter((item) => item.engineeringChangeState === "MERGED").length ?? 0,
      overviewIssueCount: overviewSummary.issueCount,
      overviewChangeCount: overviewSummary.changeCount,
      overviewMergedChangeCount: overviewSummary.mergedChangeCount,
      recentParts: (overviewPartsQuery.data?.items ?? []).map((part) => ({
        category: null,
        id: part.id,
        name: part.name,
        partNumber: part.partNumber,
      })),
      recentActivities: (overviewActivitiesQuery.data?.items ?? []).map((activity) => ({
        actorName: activity.actor?.fullName ?? activity.actorId.slice(0, 8),
        createdAt: activity.createdAt,
        id: activity.id,
        scope: activity.scope,
        state: getOverviewActivityState(activity.action),
        summary: getOverviewActivitySummary(activity.action),
      })),
    };
  }, [
    overviewActivitiesQuery.data?.items,
    overviewPartsQuery.data?.items,
    overviewSummary.changeCount,
    overviewSummary.issueCount,
    overviewSummary.mergedChangeCount,
    projectChangesQuery.data?.items,
    projectChangesQuery.data?.total,
    projectIssuesQuery.data?.total,
    projectQuery.data,
  ]);

  return (
    <ProjectDetailScreenView
      activeView={activeView}
      activityContent={projectQuery.data ? <ProjectActivityTab projectId={projectQuery.data.id} /> : null}
      changeContent={(
        <ProjectWorkItemsPanel
          isError={projectChangesQuery.isError}
          isLoading={projectChangesQuery.isLoading}
          items={(projectChangesQuery.data?.items ?? []).map((item) => ({
            assignees: item.assignees.map((assignee) => ({
              id: assignee.userId,
              name: assignee.fullName,
              profileImageUrl: assignee.profileImageUrl,
            })),
            author: item.createdByName,
            commentsCount: item.commentsCount,
            createdAt: item.createdAt,
            id: item.id,
            labels: item.labels.map((label) => ({
              colorHex: label.color,
              id: label.id,
              name: label.name,
            })),
            number: item.number,
            status: item.engineeringChangeState,
            title: item.title,
          }))}
          kind="change"
          onItemClick={(itemId) => navigate(`/changes/engineering-changes/${itemId}`)}
          onRetry={() => {
            void projectChangesQuery.refetch();
          }}
        />
      )}
      isError={projectQuery.isError || !projectQuery.data}
      isLoading={projectQuery.isLoading}
      showWorkItemViews={showWorkItemViews}
      issuesContent={(
        <ProjectWorkItemsPanel
          isError={projectIssuesQuery.isError}
          isLoading={projectIssuesQuery.isLoading}
          items={(projectIssuesQuery.data?.items ?? []).map((item) => ({
            assignees: item.assignees.map((assignee) => ({
              id: assignee.userId,
              name: assignee.fullName,
              profileImageUrl: assignee.profileImageUrl,
            })),
            author: item.createdByName,
            commentsCount: item.commentsCount,
            createdAt: item.createdAt,
            id: item.id,
            labels: item.labels.map((label) => ({
              colorHex: label.color,
              id: label.id,
              name: label.name,
            })),
            number: item.number,
            status: item.state,
            title: item.title,
          }))}
          kind="issue"
          onItemClick={(itemId) => navigate(`/changes/issues/${itemId}`)}
          onRetry={() => {
            void projectIssuesQuery.refetch();
          }}
        />
      )}
      partsContent={projectQuery.data ? <ProjectPartsTab isReadonly={projectQuery.data.isArchived} projectId={projectQuery.data.id} /> : null}
      project={projectView}
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
      onDangerClick={() => {
        onActiveViewChange("settings");
        onSettingsTabChange("danger");
      }}
      onEditClick={() => {
        onActiveViewChange("settings");
        onSettingsTabChange("general");
      }}
      onRetry={() => {
        void projectQuery.refetch();
      }}
      onSettingsClick={() => {
        onActiveViewChange("settings");
        onSettingsTabChange("general");
      }}
    />
  );
}
