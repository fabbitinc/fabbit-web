import type { ComponentType, ReactNode } from "react";
import { ArrowLeft, Boxes, Clock3, Settings2, Wrench } from "lucide-react";
import { Badge, Button } from "@fabbit/ui";
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

const views: { id: ProjectDetailScreenView; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: "overview", label: "개요", icon: Boxes },
  { id: "parts", label: "부품", icon: Wrench },
  { id: "activity", label: "활동", icon: Clock3 },
  { id: "settings", label: "설정", icon: Settings2 },
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
      <section className="app-panel rounded-[32px] px-6 py-10 text-center text-sm text-muted-foreground">
        프로젝트 정보를 불러오는 중입니다.
      </section>
    );
  }

  if (isError || !project) {
    return (
      <section className="app-panel rounded-[32px] px-6 py-10 text-center">
        <p className="text-base font-medium text-foreground">프로젝트를 불러오지 못했습니다.</p>
        <p className="mt-2 text-sm text-muted-foreground">목록으로 돌아가서 다시 시도해 주세요.</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button type="button" variant="outline" onClick={onBackClick}>
            프로젝트 목록으로 이동
          </Button>
          {onRetry ? (
            <Button type="button" onClick={onRetry}>
              다시 시도
            </Button>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="app-panel rounded-[32px] p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Button type="button" variant="ghost" onClick={onBackClick}>
              <ArrowLeft className="size-4" />
              프로젝트 목록
            </Button>
            <div className="mt-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent">Project</Badge>
                {project.isArchived ? <Badge variant="warning">보관됨</Badge> : null}
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">{project.name}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                {project.description || "설명이 없습니다. 설정 탭에서 프로젝트 설명을 추가할 수 있습니다."}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-border/70 bg-muted/30 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Parts</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{project.partCount.toLocaleString()}</p>
              <p className="mt-1 text-sm text-muted-foreground">연결된 부품 수</p>
            </div>
            <div className="rounded-[24px] border border-border/70 bg-muted/30 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Updated</p>
              <p className="mt-3 text-lg font-semibold tracking-tight text-foreground">
                {new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(new Date(project.updatedAt))}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">최근 수정일</p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        {views.map((view) => {
          const Icon = view.icon;

          return (
            <Button
              key={view.id}
              type="button"
              variant={activeView === view.id ? "default" : "outline"}
              onClick={() => onActiveViewChange(view.id)}
            >
              <Icon className="size-4" />
              {view.label}
            </Button>
          );
        })}
      </section>

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
  );
}
