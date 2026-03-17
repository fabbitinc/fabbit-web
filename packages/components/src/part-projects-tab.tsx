import { ExternalLink, FolderKanban, Loader2 } from "lucide-react";

export interface PartProjectsTabProject {
  id: string;
  name: string;
  description: string | null;
}

export interface PartProjectsTabProps {
  projects: PartProjectsTabProject[];
  isLoading?: boolean;
  showLoadingIndicator?: boolean;
  onProjectClick: (projectId: string) => void;
}

export function PartProjectsTab({
  projects,
  isLoading = false,
  showLoadingIndicator = false,
  onProjectClick,
}: PartProjectsTabProps) {
  return (
    <section aria-busy={isLoading} className="app-panel rounded-lg p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-foreground">프로젝트</p>
          <p className="mt-1 text-sm text-muted-foreground">이 부품이 연결된 프로젝트 목록입니다.</p>
        </div>
        {showLoadingIndicator ? (
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            불러오는 중
          </div>
        ) : null}
      </div>

      <div className="mt-4 space-y-2">
        {projects.length === 0 ? (
          <p className="rounded-md border border-border/70 bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
            연결된 프로젝트가 없습니다.
          </p>
        ) : null}
        {projects.map((project) => (
          <button
            key={project.id}
            type="button"
            className="flex w-full cursor-pointer items-center justify-between rounded-md border border-border/70 bg-card px-4 py-3 text-left"
            onClick={() => onProjectClick(project.id)}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-muted/70 p-2">
                <FolderKanban className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{project.name}</p>
                <p className="truncate text-xs text-muted-foreground">{project.description ?? "설명이 없습니다."}</p>
              </div>
            </div>
            <ExternalLink className="size-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </section>
  );
}
