import { AlertCircle, CircleDot, FileCheck, FilePen, Package } from "lucide-react";

export interface ProjectOverviewTabRecentPart {
  id: string;
  partNumber: string;
  name: string | null;
  category: string | null;
}

export interface ProjectOverviewTabRecentActivity {
  id: string;
  actorName: string;
  createdAt: string;
  scope: string | null;
  state: string;
  summary: string;
}

export interface ProjectOverviewTabProject {
  description: string | null;
  partCount: number;
  issueCount: number;
  changeCount: number;
  mergedChangeCount: number;
  overviewIssueCount?: number;
  overviewChangeCount?: number;
  overviewMergedChangeCount?: number;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  recentParts: ProjectOverviewTabRecentPart[];
  recentActivities: ProjectOverviewTabRecentActivity[];
}

export interface ProjectOverviewTabProps {
  project: ProjectOverviewTabProject;
}

function StatCard({
  accentClassName,
  icon: Icon,
  label,
  value,
}: {
  accentClassName: string;
  icon: typeof Package;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className={`flex size-9 items-center justify-center rounded-full ${accentClassName}`}>
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

function getActivityScopeIcon(scope: string | null) {
  if (scope === "issue") {
    return AlertCircle;
  }

  if (scope === "cr") {
    return FilePen;
  }

  if (scope === "part") {
    return Package;
  }

  return CircleDot;
}

function getActivityStateClassName(state: string) {
  if (state === "열림") {
    return "text-emerald-600";
  }

  if (state === "반영") {
    return "text-purple-600";
  }

  if (state === "추가") {
    return "text-blue-600";
  }

  if (state === "수정") {
    return "text-amber-600";
  }

  return "text-muted-foreground";
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function ProjectOverviewTab({ project }: ProjectOverviewTabProps) {
  const overviewIssueCount = project.overviewIssueCount ?? project.issueCount;
  const overviewChangeCount = project.overviewChangeCount ?? project.changeCount;
  const overviewMergedChangeCount = project.overviewMergedChangeCount ?? project.mergedChangeCount;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <StatCard accentClassName="bg-blue-100 text-blue-600" icon={Package} label="연결된 부품" value={project.partCount} />
        <StatCard accentClassName="bg-emerald-100 text-emerald-600" icon={AlertCircle} label="열린 이슈" value={overviewIssueCount} />
        <StatCard accentClassName="bg-amber-100 text-amber-600" icon={FilePen} label="열린 변경 요청" value={overviewChangeCount} />
        <StatCard accentClassName="bg-purple-100 text-purple-600" icon={FileCheck} label="반영 완료" value={overviewMergedChangeCount} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-medium text-foreground">최근 부품</h3>
            <span className="text-xs text-muted-foreground">{project.partCount}건</span>
          </div>
          {project.recentParts.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">연결된 부품이 없습니다</div>
          ) : (
            <div className="divide-y">
              {project.recentParts.slice(0, 5).map((part) => (
                <div key={part.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="font-mono text-xs font-medium text-primary">{part.partNumber}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">{part.name ?? "—"}</span>
                  <span className="text-xs text-muted-foreground">{part.category ?? "—"}</span>
                </div>
              ))}
              {project.recentParts.length > 5 ? (
                <div className="px-4 py-2.5 text-center text-xs text-muted-foreground">
                  외 {project.recentParts.length - 5}건
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-card">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-medium text-foreground">최근 활동</h3>
          </div>
          <div className="px-4 py-2">
            {project.recentActivities.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">최근 활동이 없습니다</div>
            ) : (
              project.recentActivities.map((activity) => {
                const ScopeIcon = getActivityScopeIcon(activity.scope);

                return (
                  <div key={activity.id} className="flex gap-3 py-2">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <ScopeIcon className="size-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground/80">
                        <span className={`font-medium ${getActivityStateClassName(activity.state)}`}>{activity.state}</span>
                        {" · "}
                        {activity.summary}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {activity.actorName} · {formatDateTime(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
