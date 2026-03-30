import { useCallback } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import {
  ProjectDetailScreen,
  type ProjectDetailView,
  type ProjectSettingsTab,
} from "@/features/project-detail";
import { useSettingsQuery } from "@/features/settings";

const validViews = new Set<ProjectDetailView>(["overview", "parts", "issues", "change", "activity", "settings"]);
const validSettingsTabs = new Set<ProjectSettingsTab>(["general", "members", "labels", "danger"]);

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const settingsQuery = useSettingsQuery();

  const updateSearchParams = useCallback(
    (updater: (current: URLSearchParams) => URLSearchParams) => {
      setSearchParams((previous) => updater(new URLSearchParams(previous)), { replace: true });
    },
    [setSearchParams],
  );

  if (!projectId) {
    return <Navigate replace to="/projects" />;
  }

  const viewParam = searchParams.get("view");
  const tabParam = searchParams.get("tab");
  const showWorkItemViews = settingsQuery.data?.partWorkflowMode === "ENGINEERING_CHANGE_REQUIRED";

  const activeView: ProjectDetailView =
    viewParam && validViews.has(viewParam as ProjectDetailView)
      ? (viewParam as ProjectDetailView)
      : "overview";
  if (settingsQuery.isSuccess && !showWorkItemViews && (activeView === "issues" || activeView === "change")) {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("view");
    nextSearchParams.delete("tab");
    const nextSearch = nextSearchParams.toString();

    return <Navigate replace to={nextSearch ? `/projects/${projectId}?${nextSearch}` : `/projects/${projectId}`} />;
  }

  const normalizedActiveView: ProjectDetailView =
    !showWorkItemViews && (activeView === "issues" || activeView === "change") ? "overview" : activeView;
  const settingsTab: ProjectSettingsTab =
    normalizedActiveView === "settings" && tabParam && validSettingsTabs.has(tabParam as ProjectSettingsTab)
      ? (tabParam as ProjectSettingsTab)
      : "general";

  return (
    <ProjectDetailScreen
      activeView={normalizedActiveView}
      projectId={projectId}
      settingsTab={settingsTab}
      showWorkItemViews={showWorkItemViews}
      onActiveViewChange={(view) => {
        updateSearchParams((next) => {
          if (view === "overview") {
            next.delete("view");
          } else {
            next.set("view", view);
          }

          if (view !== "settings") {
            next.delete("tab");
          }

          return next;
        });
      }}
      onSettingsTabChange={(tab) => {
        updateSearchParams((next) => {
          if (normalizedActiveView !== "settings") {
            next.set("view", "settings");
          }

          if (tab === "general") {
            next.delete("tab");
          } else {
            next.set("tab", tab);
          }

          return next;
        });
      }}
    />
  );
}
