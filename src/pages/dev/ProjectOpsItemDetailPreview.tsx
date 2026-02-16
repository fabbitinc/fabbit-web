import { Link, useLocation, useParams } from "react-router-dom";
import {
  CalendarDays,
  ChevronRight,
  FileText,
  GitPullRequest,
  ShieldCheck,
  Siren,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OPS_ITEMS, PROJECT_OPTIONS } from "@/pages/dev/projectOpsMock";

type OpsTab = "approvals" | "changes" | "issues";

const TAB_META: Record<OpsTab, { label: string; icon: typeof FileText }> = {
  approvals: { label: "승인", icon: ShieldCheck },
  changes: { label: "변경요청", icon: GitPullRequest },
  issues: { label: "이슈", icon: Siren },
};

export function ProjectOpsItemDetailPreview() {
  const { projectId, itemId } = useParams<{
    projectId: string;
    itemId: string;
  }>();
  const { pathname } = useLocation();

  const project = PROJECT_OPTIONS.find((item) => item.id === projectId);
  const safeTab: OpsTab | null =
    pathname.includes("/approvals/")
      ? "approvals"
      : pathname.includes("/changes/")
        ? "changes"
        : pathname.includes("/issues/")
          ? "issues"
          : null;

  const item = OPS_ITEMS.find(
    (row) =>
      row.projectId === projectId &&
      row.id === itemId &&
      ((safeTab === "approvals" && row.type === "approval") ||
        (safeTab === "changes" && row.type === "change") ||
        (safeTab === "issues" && row.type === "issue"))
  );

  if (!project || !safeTab || !item) {
    return (
      <div className="min-h-screen bg-background px-5 py-8 lg:px-8">
        <div className="dev-page-container rounded-2xl border border-border bg-card p-6">
          <p className="text-lg font-semibold text-foreground">상세 항목을 찾을 수 없습니다.</p>
          <Button asChild className="mt-4" variant="outline">
            <Link to={`/dev/projects/${projectId}`}>프로젝트로 돌아가기</Link>
          </Button>
        </div>
      </div>
    );
  }

  const TabIcon = TAB_META[safeTab].icon;

  return (
    <div className="min-h-screen bg-background px-5 py-8 lg:px-8">
      <div className="dev-page-container space-y-5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link className="hover:text-foreground" to="/dev/projects">Projects</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link className="hover:text-foreground" to={`/dev/projects/${project.id}`}>{project.name}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>{TAB_META[safeTab].label}</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>{item.id}</span>
        </div>

        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <TabIcon className="h-3.5 w-3.5" />
                {TAB_META[safeTab].label} 상세
              </p>
              <h1 className="text-2xl font-semibold text-foreground">{item.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{item.id} · 프로젝트 {project.name}</p>
            </div>
            <StatusBadge status={item.status} />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">핵심 정보</h2>
            <div className="space-y-2 text-sm">
              <Row label="유형" value={item.type === "approval" ? "승인" : item.type === "change" ? "변경요청" : "이슈"} />
              <Row label="대상" value={item.target} mono />
              <Row label="담당" value={item.owner} />
              <Row label="마감" value={item.dueDate} />
              <Row label="우선순위" value={item.priority} />
              <Row label="영향도" value={item.impact ?? "-"} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground">활동 타임라인</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="rounded-md border border-border bg-background p-2">요청 생성 · 2일 전</li>
                <li className="rounded-md border border-border bg-background p-2">검토 코멘트 추가 · 5시간 전</li>
                <li className="rounded-md border border-border bg-background p-2">담당자 재할당 · 1시간 전</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground">관련 정보</h2>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-1.5"><User className="h-4 w-4" /> 담당: {item.owner}</p>
                <p className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> 마감: {item.dueDate}</p>
                <p className="flex items-center gap-1.5"><FileText className="h-4 w-4" /> 관련 문서: 3건</p>
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link to={`/dev/projects/${project.id}`}>목록으로</Link>
          </Button>
          <Button>상태 변경</Button>
        </div>
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

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-xs text-foreground" : "text-sm text-foreground"}>{value}</span>
    </div>
  );
}
