import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CalendarDays,
  GitPullRequest,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OPS_ITEMS, PROJECT_OPTIONS, SCHEDULE_ITEMS } from "@/pages/projects/projectOpsMock";

export function ProjectListPage() {
  return (
    <div className="space-y-5">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">프로젝트 목록</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            GitHub repo처럼 프로젝트를 선택한 뒤, 상세 화면 탭에서 승인/변경요청/이슈/일정을 관리합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button>프로젝트 생성</Button>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3">프로젝트</th>
              <th className="px-4 py-3">대기 승인</th>
              <th className="px-4 py-3">변경요청</th>
              <th className="px-4 py-3">이슈</th>
              <th className="px-4 py-3">리스크 일정</th>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3 text-right">액션</th>
            </tr>
          </thead>
          <tbody>
            {PROJECT_OPTIONS.map((project) => {
              const approvals = OPS_ITEMS.filter(
                (item) => item.projectId === project.id && item.type === "approval" && item.status !== "done"
              ).length;
              const changes = OPS_ITEMS.filter(
                (item) => item.projectId === project.id && item.type === "change" && item.status !== "done"
              ).length;
              const issues = OPS_ITEMS.filter(
                (item) => item.projectId === project.id && item.type === "issue" && item.status !== "done"
              ).length;
              const riskySchedules = SCHEDULE_ITEMS.filter(
                (item) => item.projectId === project.id && item.risk !== "low"
              ).length;

              return (
                <tr key={project.id} className="border-b border-border/70 bg-background last:border-b-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{project.name}</p>
                    <p className="text-xs text-muted-foreground">Repo형 PLM 워크스페이스</p>
                  </td>
                  <td className="px-4 py-3">
                    <Metric icon={ShieldCheck} value={approvals} />
                  </td>
                  <td className="px-4 py-3">
                    <Metric icon={GitPullRequest} value={changes} />
                  </td>
                  <td className="px-4 py-3">
                    <Metric icon={AlertTriangle} value={issues} />
                  </td>
                  <td className="px-4 py-3">
                    <Metric icon={CalendarDays} value={riskySchedules} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">진행중</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/projects/${project.id}`}>열기</Link>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, value }: { icon: typeof ShieldCheck; value: number }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      {value}건
    </div>
  );
}
