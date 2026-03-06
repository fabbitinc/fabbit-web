import { useNavigate } from "react-router-dom";
import { ArrowRight, Boxes, FolderKanban, GitPullRequestArrow, Sparkles } from "lucide-react";
import { Badge, Button, UserAvatar } from "@fabbit/ui";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { useDashboardQuery } from "@/features/dashboard/hooks/use-dashboard-query";

interface QuickAction {
  href: string;
  label: string;
  description: string;
  icon: typeof FolderKanban;
}

interface MyWorkItem {
  id: string;
  title: string;
  href: string;
  kind: "issue" | "change";
  status: string;
  ownerName: string;
}

const quickActions: QuickAction[] = [
  {
    href: "/parts",
    label: "부품 관리",
    description: "부품과 BOM 구조를 확인합니다.",
    icon: FolderKanban,
  },
  {
    href: "/projects",
    label: "프로젝트 보기",
    description: "진행 중인 프로젝트 현황으로 이동합니다.",
    icon: Boxes,
  },
  {
    href: "/changes",
    label: "변경 관리",
    description: "이슈와 변경 요청 흐름을 확인합니다.",
    icon: GitPullRequestArrow,
  },
];

const myWorkItems: MyWorkItem[] = [
  {
    id: "1",
    title: "센서 모듈 하우징 간섭 이슈",
    href: "/changes/issues/42",
    kind: "issue",
    status: "열림",
    ownerName: "김태현",
  },
  {
    id: "2",
    title: "PCB 커넥터 핀 배열 변경",
    href: "/changes/requests/15",
    kind: "change",
    status: "검토 중",
    ownerName: "이수진",
  },
  {
    id: "3",
    title: "방열판 재질 전환 검토",
    href: "/changes/issues/78",
    kind: "issue",
    status: "열림",
    ownerName: "박준서",
  },
];

function SummaryCard({
  title,
  value,
  description,
  onClick,
}: {
  title: string;
  value: number;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      className="rounded-[24px] border border-border/70 bg-card p-5 text-left transition-colors hover:border-primary/45 hover:bg-primary/5"
      type="button"
      onClick={onClick}
    >
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-foreground">{value.toLocaleString()}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </button>
  );
}

export function DashboardScreen() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const currentMembership = useAuthStore((state) => state.currentMembership);
  const dashboardQuery = useDashboardQuery();

  const stats = dashboardQuery.data;

  return (
    <div className="space-y-6">
      <section className="app-panel rounded-[32px] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge variant="accent">Dashboard</Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
              {user ? `${user.name}님, 환영합니다.` : "대시보드"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              {currentMembership
                ? `${currentMembership.organization.name} 워크스페이스의 현재 상태를 요약합니다.`
                : "워크스페이스의 현재 상태를 요약합니다."}
            </p>
          </div>

          {user ? (
            <div className="rounded-[24px] border border-border/70 bg-muted/35 p-4">
              <div className="flex items-center gap-3">
                <UserAvatar imageUrl={user.profileImageUrl} name={user.name} />
                <div>
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <SummaryCard
          description="등록된 전체 부품 수와 이번 주 추가 추이를 확인합니다."
          title="부품 수"
          value={stats?.parts.total ?? 0}
          onClick={() => navigate("/parts")}
        />
        <SummaryCard
          description="현재 연결된 BOM 링크 수를 확인합니다."
          title="BOM 링크"
          value={stats?.bomLinks.total ?? 0}
          onClick={() => navigate("/parts")}
        />
        <SummaryCard
          description="최근 합성 결과의 생성 노드 수를 빠르게 확인합니다."
          title="최근 합성 노드"
          value={stats?.lastSynthesis?.nodesCreated ?? 0}
          onClick={() => navigate("/parts/templates")}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-border/70 bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-foreground">빠른 이동</p>
              <p className="mt-1 text-sm text-muted-foreground">주요 작업 흐름으로 바로 이동합니다.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.href}
                  className="flex items-center justify-between rounded-[22px] border border-border/70 bg-muted/35 px-4 py-4 text-left transition-colors hover:border-primary/45 hover:bg-primary/5"
                  type="button"
                  onClick={() => navigate(action.href)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{action.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[28px] border border-border/70 bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-foreground">최근 합성</p>
              <p className="mt-1 text-sm text-muted-foreground">가장 최근 ontology 합성 결과입니다.</p>
            </div>
            <Sparkles className="size-5 text-primary" />
          </div>

          {stats?.lastSynthesis ? (
            <div className="mt-5 space-y-3 rounded-[22px] bg-muted/35 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">작업 ID</span>
                <span className="font-medium text-foreground">{stats.lastSynthesis.jobId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">상태</span>
                <span className="font-medium text-foreground">{stats.lastSynthesis.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">생성 노드</span>
                <span className="font-medium text-foreground">{stats.lastSynthesis.nodesCreated.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">생성 관계</span>
                <span className="font-medium text-foreground">{stats.lastSynthesis.relationshipsCreated.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-[22px] border border-dashed border-border/80 px-4 py-6 text-sm text-muted-foreground">
              아직 실행된 합성 기록이 없습니다.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[28px] border border-border/70 bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-foreground">내 작업</p>
            <p className="mt-1 text-sm text-muted-foreground">최근 확인해야 할 변경 항목입니다.</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => navigate("/changes")}>
            전체 보기
          </Button>
        </div>

        <div className="mt-5 space-y-3">
          {myWorkItems.map((item) => (
            <button
              key={item.id}
              className="flex w-full items-center justify-between rounded-[22px] border border-border/70 bg-muted/35 px-4 py-4 text-left transition-colors hover:border-primary/45 hover:bg-primary/5"
              type="button"
              onClick={() => navigate(item.href)}
            >
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={item.kind === "issue" ? "warning" : "info"}>{item.kind === "issue" ? "Issue" : "Change"}</Badge>
                  <span className="text-sm font-medium text-foreground">{item.title}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{item.status}</p>
              </div>

              <div className="flex items-center gap-3">
                <UserAvatar name={item.ownerName} />
                <ArrowRight className="size-4 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
