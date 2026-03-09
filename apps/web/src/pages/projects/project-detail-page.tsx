import { useCallback } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import {
  ProjectDetailScreen,
  type ProjectDetailView,
  type ProjectSettingsTab,
} from "@/features/project-detail";

const validViews = new Set<ProjectDetailView>(["overview", "parts", "issues", "change", "activity", "settings"]);
const validSettingsTabs = new Set<ProjectSettingsTab>(["general", "members", "labels", "danger"]);

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

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

  const activeView: ProjectDetailView =
    viewParam && validViews.has(viewParam as ProjectDetailView)
      ? (viewParam as ProjectDetailView)
      : "overview";
  const settingsTab: ProjectSettingsTab =
    activeView === "settings" && tabParam && validSettingsTabs.has(tabParam as ProjectSettingsTab)
      ? (tabParam as ProjectSettingsTab)
      : "general";

  return (
    <ProjectDetailScreen
      activeView={activeView}
      projectId={projectId}
      settingsTab={settingsTab}
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
          if (activeView !== "settings") {
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
