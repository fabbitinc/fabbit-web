import type { ReactNode } from "react";
import { Activity, LayoutDashboard, Package, Settings } from "lucide-react";
import { Badge, Button, cn } from "@fabbit/ui";
import { ProjectOverviewTab, type ProjectOverviewTabProject } from "./project-overview-tab";

export type ProjectDetailScreenView = "overview" | "parts" | "activity" | "settings";

export interface ProjectDetailScreenProject extends ProjectOverviewTabProject {
  id: string;
  name: string;
}

export interface ProjectDetailScreenProps {
  activeView: ProjectDetailScreenView;
  activityContent: ReactNode;
  partsContent: ReactNode;
  settingsContent: ReactNode;
  isError?: boolean;
  isLoading?: boolean;
  project?: ProjectDetailScreenProject;
  onActiveViewChange: (view: ProjectDetailScreenView) => void;
  onBackClick: () => void;
  onRetry?: () => void;
}

const views: Array<{ id: ProjectDetailScreenView; label: string; count?: (project: ProjectDetailScreenProject) => number; icon: typeof LayoutDashboard }> = [
  { id: "overview", label: "개요", icon: LayoutDashboard },
  { id: "parts", label: "부품", count: (project) => project.partCount, icon: Package },
  { id: "activity", label: "활동", icon: Activity },
  { id: "settings", label: "설정", icon: Settings },
];

export function ProjectDetailScreen({
  activeView,
  activityContent,
  partsContent,
  settingsContent,
  isError = false,
  isLoading = false,
  project,
  onActiveViewChange,
  onBackClick,
  onRetry,
}: ProjectDetailScreenProps) {
  if (isLoading) {
    return (
      <div className="min-h-full py-20">
        <div className="flex items-center justify-center">
          <p className="text-sm text-muted-foreground">프로젝트 정보를 불러오는 중입니다.</p>
        </div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="min-h-full py-20">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">프로젝트 정보를 불러오지 못했습니다.</p>
          <div className="flex gap-2">
            <Button size="sm" type="button" variant="outline" onClick={onBackClick}>
              프로젝트 목록으로 이동
            </Button>
            {onRetry ? (
              <Button size="sm" type="button" onClick={onRetry}>
                다시 시도
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-sm">
            <button
              className="cursor-pointer text-muted-foreground transition-colors hover:text-primary"
              type="button"
              onClick={onBackClick}
            >
              프로젝트
            </button>
            <span className="text-muted-foreground/40">/</span>
            <h1 className="font-semibold text-foreground">{project.name}</h1>
            {project.isArchived ? <Badge variant="outline">보관됨</Badge> : null}
          </div>
          {project.description ? <p className="mt-1 text-sm text-muted-foreground">{project.description}</p> : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            부품 {project.partCount.toLocaleString()}개
          </span>
          <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            최근 수정 {new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(new Date(project.updatedAt))}
          </span>
        </div>
      </div>

      <nav className="mt-4 flex items-center gap-1 border-b">
        {views.map((view) => {
          const Icon = view.icon;
          const count = view.count ? view.count(project) : undefined;

          return (
            <button
              key={view.id}
              className={cn(
                "relative inline-flex cursor-pointer items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors",
                activeView === view.id
                  ? "text-foreground after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              type="button"
              onClick={() => onActiveViewChange(view.id)}
            >
              <Icon className="size-3.5" />
              {view.label}
              {count != null ? <span className="text-[10px] text-muted-foreground">({count})</span> : null}
            </button>
          );
        })}
      </nav>

      <div className="mt-4">
        {activeView === "overview" ? (
          <ProjectOverviewTab
            project={project}
            onActivityClick={() => onActiveViewChange("activity")}
            onPartsClick={() => onActiveViewChange("parts")}
            onSettingsClick={() => onActiveViewChange("settings")}
          />
        ) : null}
        {activeView === "parts" ? partsContent : null}
        {activeView === "activity" ? activityContent : null}
        {activeView === "settings" ? settingsContent : null}
      </div>
    </div>
  );
}
