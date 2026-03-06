import { ArrowLeft, Boxes, Clock3, Settings2, Wrench } from "lucide-react";
import { Button, Badge } from "@fabbit/ui";
import { useNavigate } from "react-router-dom";
import { ProjectActivityTab } from "@/features/project-detail/components/project-activity-tab";
import { ProjectOverviewTab } from "@/features/project-detail/components/project-overview-tab";
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

const views: Array<{ id: ProjectDetailView; label: string; icon: typeof Boxes }> = [
  { id: "overview", label: "개요", icon: Boxes },
  { id: "parts", label: "부품", icon: Wrench },
  { id: "activity", label: "활동", icon: Clock3 },
  { id: "settings", label: "설정", icon: Settings2 },
];

export function ProjectDetailScreen({
  activeView,
  onActiveViewChange,
  onSettingsTabChange,
  projectId,
  settingsTab,
}: ProjectDetailScreenProps) {
  const navigate = useNavigate();
  const projectQuery = useProjectDetailQuery(projectId, Boolean(projectId));

  if (projectQuery.isLoading) {
    return (
      <section className="app-panel rounded-[32px] px-6 py-10 text-center text-sm text-muted-foreground">
        프로젝트 정보를 불러오는 중입니다.
      </section>
    );
  }

  if (projectQuery.isError || !projectQuery.data) {
    return (
      <section className="app-panel rounded-[32px] px-6 py-10 text-center">
        <p className="text-base font-medium text-foreground">프로젝트를 불러오지 못했습니다.</p>
        <p className="mt-2 text-sm text-muted-foreground">목록으로 돌아가서 다시 시도해 주세요.</p>
        <div className="mt-4">
          <Button type="button" variant="outline" onClick={() => navigate("/projects")}>
            프로젝트 목록으로 이동
          </Button>
        </div>
      </section>
    );
  }

  const project = projectQuery.data;

  return (
    <div className="space-y-6">
      <section className="app-panel rounded-[32px] p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Button type="button" variant="ghost" onClick={() => navigate("/projects")}>
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

      {activeView === "parts" ? <ProjectPartsTab isReadonly={project.isArchived} projectId={project.id} /> : null}
      {activeView === "activity" ? <ProjectActivityTab projectId={project.id} /> : null}
      {activeView === "settings" ? (
        <ProjectSettingsScreen
          activeTab={settingsTab}
          project={project}
          onDeleted={() => navigate("/projects")}
          onTabChange={onSettingsTabChange}
        />
      ) : null}
    </div>
  );
}
