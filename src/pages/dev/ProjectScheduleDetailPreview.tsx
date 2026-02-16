import { Link, useParams } from "react-router-dom";
import { CalendarDays, ChevronRight, ClipboardCheck, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PROJECT_OPTIONS, SCHEDULE_ITEMS } from "@/pages/dev/projectOpsMock";

export function ProjectScheduleDetailPreview() {
  const { projectId, scheduleId } = useParams<{ projectId: string; scheduleId: string }>();

  const project = PROJECT_OPTIONS.find((item) => item.id === projectId);
  const schedule = SCHEDULE_ITEMS.find(
    (item) => item.projectId === projectId && item.id === scheduleId
  );

  if (!project || !schedule) {
    return (
      <div className="min-h-screen bg-background px-5 py-8 lg:px-8">
        <div className="dev-page-container rounded-2xl border border-border bg-card p-6">
          <p className="text-lg font-semibold text-foreground">일정 상세를 찾을 수 없습니다.</p>
          <Button asChild className="mt-4" variant="outline">
            <Link to={`/dev/projects/${projectId}`}>프로젝트로 돌아가기</Link>
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
          <Link className="hover:text-foreground" to={`/dev/projects/${project.id}`}>{project.name}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>일정</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>{schedule.id}</span>
        </div>

        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                일정 상세
              </p>
              <h1 className="text-2xl font-semibold text-foreground">{schedule.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{schedule.id} · 프로젝트 {project.name}</p>
            </div>
            <RiskBadge risk={schedule.risk} />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">진행 현황</h2>
            <Progress value={schedule.progress} className="h-2" />
            <p className="mt-2 text-sm text-muted-foreground">현재 진척률 {schedule.progress}%</p>
            <div className="mt-4 space-y-2 text-sm">
              <MetaRow label="담당" value={schedule.owner} />
              <MetaRow label="마감" value={schedule.dueDate} />
              <MetaRow label="리스크" value={schedule.risk} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground">체크리스트</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><ClipboardCheck className="h-4 w-4" /> 의존 작업 상태 점검</li>
                <li className="flex items-center gap-2"><ClipboardCheck className="h-4 w-4" /> 리스크 대응 계획 공유</li>
                <li className="flex items-center gap-2"><ClipboardCheck className="h-4 w-4" /> 승인 일정 조율</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground">최근 업데이트</h2>
              <p className="flex items-center gap-2 text-sm text-muted-foreground"><Timer className="h-4 w-4" /> 3시간 전 진척률 업데이트</p>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link to={`/dev/projects/${project.id}`}>목록으로</Link>
          </Button>
          <Button>일정 수정</Button>
        </div>
      </div>
    </div>
  );
}

function RiskBadge({ risk }: { risk: "low" | "medium" | "high" }) {
  if (risk === "high") return <Badge variant="destructive">High Risk</Badge>;
  if (risk === "medium") return <Badge variant="secondary">Medium Risk</Badge>;
  return <Badge variant="outline">Low Risk</Badge>;
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}
