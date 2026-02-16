import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  CalendarDays,
  ChevronRight,
  Clock3,
  FileText,
  GitPullRequest,
  ShieldCheck,
  Siren,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { OPS_ITEMS, PROJECT_OPTIONS, SCHEDULE_ITEMS } from "@/pages/dev/projectOpsMock";

type RepoTab = "dashboard" | "approvals" | "changes" | "issues" | "schedules";
type OpsRow = (typeof OPS_ITEMS)[number];
type ScheduleRow = (typeof SCHEDULE_ITEMS)[number];

export function ProjectRepoPreview() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<RepoTab>("dashboard");

  const project = PROJECT_OPTIONS.find((item) => item.id === projectId);

  const scopedOps = useMemo(
    () => OPS_ITEMS.filter((item) => item.projectId === projectId),
    [projectId]
  );

  const approvals = scopedOps.filter((item) => item.type === "approval");
  const changes = scopedOps.filter((item) => item.type === "change");
  const issues = scopedOps.filter((item) => item.type === "issue");
  const schedules = SCHEDULE_ITEMS.filter((item) => item.projectId === projectId);

  if (!project) {
    return (
      <div className="min-h-screen bg-background px-5 py-8 lg:px-8">
        <div className="dev-page-container rounded-2xl border border-border bg-card p-6">
          <p className="text-lg font-semibold text-foreground">프로젝트를 찾을 수 없습니다.</p>
          <p className="mt-1 text-sm text-muted-foreground">프로젝트 목록에서 다시 선택해 주세요.</p>
          <Button asChild className="mt-4" variant="outline">
            <Link to="/dev/projects">프로젝트 목록으로</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-5 py-8 lg:px-8">
      <div className="dev-page-container space-y-5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link className="hover:text-foreground" to="/dev/projects">Projects</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>{project.name}</span>
        </div>

        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{project.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">프로젝트 내부 운영 탭</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Open {scopedOps.filter((item) => item.status !== "done").length}</Badge>
              <Badge variant="outline">Milestone {schedules.length}</Badge>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <TabButton label="대시보드" active={tab === "dashboard"} onClick={() => setTab("dashboard")} icon={Clock3} count={scopedOps.filter((item) => item.status !== "done").length} />
            <TabButton label="승인" active={tab === "approvals"} onClick={() => setTab("approvals")} icon={ShieldCheck} count={approvals.length} />
            <TabButton label="변경요청" active={tab === "changes"} onClick={() => setTab("changes")} icon={GitPullRequest} count={changes.length} />
            <TabButton label="이슈" active={tab === "issues"} onClick={() => setTab("issues")} icon={Siren} count={issues.length} />
            <TabButton label="일정" active={tab === "schedules"} onClick={() => setTab("schedules")} icon={CalendarDays} count={schedules.length} />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          {tab === "dashboard" && (
            <DashboardPanel
              approvals={approvals}
              changes={changes}
              issues={issues}
              schedules={schedules}
              scopedOps={scopedOps}
              onItemClick={(item) => navigate(`/dev/projects/${project.id}/${item.type}s/${item.id}`)}
            />
          )}
          {tab === "approvals" && (
            <OpsTable
              title="승인 탭"
              rows={approvals}
              onRowClick={(itemId) => navigate(`/dev/projects/${project.id}/approvals/${itemId}`)}
            />
          )}
          {tab === "changes" && (
            <OpsTable
              title="변경요청 탭"
              rows={changes}
              onRowClick={(itemId) => navigate(`/dev/projects/${project.id}/changes/${itemId}`)}
            />
          )}
          {tab === "issues" && (
            <OpsTable
              title="이슈 탭"
              rows={issues}
              onRowClick={(itemId) => navigate(`/dev/projects/${project.id}/issues/${itemId}`)}
            />
          )}
          {tab === "schedules" && (
            <ScheduleTable
              rows={schedules}
              onRowClick={(itemId) => navigate(`/dev/projects/${project.id}/schedules/${itemId}`)}
            />
          )}
        </section>
      </div>
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
  icon: Icon,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: typeof Clock3;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
      <span className="rounded-full bg-black/10 px-1.5 text-xs">{count}</span>
    </button>
  );
}

function OpsTable({
  title,
  rows,
  onRowClick,
}: {
  title: string;
  rows: OpsRow[];
  onRowClick: (itemId: string) => void;
}) {
  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <FileText className="h-4 w-4" />
        {title}
      </h2>
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-3 py-2.5">요청</th>
              <th className="px-3 py-2.5">대상</th>
              <th className="px-3 py-2.5">담당</th>
              <th className="px-3 py-2.5">마감</th>
              <th className="px-3 py-2.5">상태</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick(row.id)}
                className="cursor-pointer border-b border-border/70 bg-background last:border-b-0 hover:bg-muted/20"
              >
                <td className="px-3 py-3">
                  <p className="font-medium text-foreground">{row.title}</p>
                  <p className="text-xs text-muted-foreground">{row.id}</p>
                </td>
                <td className="px-3 py-3 font-mono text-xs text-foreground">{row.target}</td>
                <td className="px-3 py-3 text-muted-foreground">{row.owner}</td>
                <td className="px-3 py-3 text-muted-foreground">{row.dueDate}</td>
                <td className="px-3 py-3"><StatusBadge status={row.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScheduleTable({
  rows,
  onRowClick,
}: {
  rows: ScheduleRow[];
  onRowClick: (itemId: string) => void;
}) {
  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <CalendarDays className="h-4 w-4" />
        일정 탭
      </h2>
      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.id}
            onClick={() => onRowClick(row.id)}
            className="cursor-pointer rounded-xl border border-border bg-background p-3 hover:bg-muted/20"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">{row.title}</p>
              <Badge variant="outline">{row.dueDate}</Badge>
            </div>
            <Progress value={row.progress} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">담당 {row.owner} · 진척률 {row.progress}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "open" | "in_review" | "blocked" | "done" }) {
  if (status === "done") return <Badge>Done</Badge>;
  if (status === "in_review") return <Badge variant="secondary">In Review</Badge>;
  if (status === "blocked") return <Badge variant="destructive">Blocked</Badge>;
  return <Badge variant="outline">Open</Badge>;
}

function DashboardPanel({
  approvals,
  changes,
  issues,
  schedules,
  scopedOps,
  onItemClick,
}: {
  approvals: OpsRow[];
  changes: OpsRow[];
  issues: OpsRow[];
  schedules: ScheduleRow[];
  scopedOps: OpsRow[];
  onItemClick: (item: OpsRow) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">프로젝트 대시보드</h2>
        <Badge variant="outline">Overview</Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={ShieldCheck} label="대기 승인" value={`${approvals.filter((item) => item.status !== "done").length}건`} />
        <SummaryCard icon={GitPullRequest} label="진행 변경요청" value={`${changes.filter((item) => item.status !== "done").length}건`} />
        <SummaryCard icon={AlertTriangle} label="오픈 이슈" value={`${issues.filter((item) => item.status !== "done").length}건`} />
        <SummaryCard icon={CalendarDays} label="리스크 일정" value={`${schedules.filter((item) => item.risk !== "low").length}개`} />
      </div>

      <div className="grid gap-3 lg:grid-cols-4">
        {([
          { key: "open", label: "Open" },
          { key: "in_review", label: "In Review" },
          { key: "blocked", label: "Blocked" },
          { key: "done", label: "Done" },
        ] as const).map((column) => {
          const cards = scopedOps.filter((item) => item.status === column.key);
          return (
            <div key={column.key} className="rounded-xl border border-border bg-muted/20 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{column.label}</span>
                <Badge variant="outline">{cards.length}</Badge>
              </div>
                <div className="space-y-2">
                  {cards.slice(0, 3).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onItemClick(item)}
                    className="w-full rounded-md border border-border bg-background p-2 text-left transition-colors hover:bg-muted/30"
                  >
                    <p className="text-xs text-muted-foreground">{item.id}</p>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="mt-1 font-mono text-xs text-primary">{item.target}</p>
                  </button>
                ))}
                {cards.length === 0 && (
                  <p className="rounded-md border border-dashed border-border px-2 py-3 text-xs text-muted-foreground">
                    항목 없음
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className="text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}
