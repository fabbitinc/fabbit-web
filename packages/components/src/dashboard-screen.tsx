import type { ComponentType } from "react";
import {
  ArrowRight,
  Boxes,
  CircleDot,
  GitPullRequestArrow,
} from "lucide-react";
import { Badge, Button, UserAvatar } from "@fabbit/ui";
import { SummaryCard } from "./summary-card";
import { UsageCard } from "./usage-card";

export interface DashboardScreenUser {
  name: string;
  email: string;
  profileImageUrl: string | null;
}

export interface DashboardScreenQuickAction {
  href: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

export interface DashboardScreenWorkItem {
  id: string;
  title: string;
  href: string;
  kind: "issue" | "change";
  status: string;
  ownerName: string;
}

export interface DashboardScreenUsageItem {
  label: string;
  icon: ComponentType<{ className?: string }>;
  used: number;
  limit: number;
  unit: string;
}

export interface DashboardScreenStats {
  parts: {
    total: number;
    addedThisWeek: number;
  };
  bomLinks: {
    total: number;
  };
  lastSynthesis: {
    jobId: string;
    status: string;
    completedAt: string | null;
    nodesCreated: number;
    relationshipsCreated: number;
  } | null;
}

export interface DashboardScreenProps {
  user?: DashboardScreenUser | null;
  workspaceName?: string | null;
  stats?: DashboardScreenStats | null;
  quickActions: DashboardScreenQuickAction[];
  myWorkItems: DashboardScreenWorkItem[];
  usageItems?: DashboardScreenUsageItem[];
  onQuickActionClick: (href: string) => void;
  onMyWorkItemClick: (href: string) => void;
  onOpenChanges: () => void;
  onOpenParts: () => void;
  onOpenTemplates: () => void;
}

function formatCompletedAt(value: string | null) {
  if (!value) {
    return "완료 시각 정보 없음";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function DashboardScreen({
  user,
  workspaceName,
  stats,
  quickActions,
  myWorkItems,
  usageItems,
  onQuickActionClick,
  onMyWorkItemClick,
  onOpenChanges,
  onOpenParts,
  onOpenTemplates,
}: DashboardScreenProps) {
  const partsTotal = stats?.parts.total ?? 0;
  const partsAddedThisWeek = stats?.parts.addedThisWeek ?? 0;
  const bomLinksTotal = stats?.bomLinks.total ?? 0;
  const lastSynthesisNodes = stats?.lastSynthesis?.nodesCreated ?? 0;

  return (
    <div className="space-y-6">
      <section className="app-panel rounded-[32px] p-6 sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <Badge variant="accent">Dashboard</Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
              {user ? `${user.name}님, 환영합니다.` : "대시보드"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              {workspaceName
                ? `${workspaceName} 워크스페이스의 현재 상태를 요약합니다.`
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

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">내 현황</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard
            icon={CircleDot}
            label="관리 중인 부품"
            sub={`이번 주 ${partsAddedThisWeek.toLocaleString()}개 추가`}
            value={`${partsTotal.toLocaleString()}개`}
            onClick={onOpenParts}
          />
          <SummaryCard
            icon={Boxes}
            label="BOM 연결"
            sub="부품 간 구성 관계 수"
            value={`${bomLinksTotal.toLocaleString()}개`}
            onClick={onOpenParts}
          />
          <SummaryCard
            icon={GitPullRequestArrow}
            label="최근 합성"
            sub="가장 최근 업로드에서 생성된 노드"
            value={`${lastSynthesisNodes.toLocaleString()}개`}
            onClick={onOpenTemplates}
          />
        </div>
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
                  className="flex cursor-pointer items-center justify-between rounded-[22px] border border-border/70 bg-muted/35 px-4 py-4 text-left transition-colors hover:border-primary/45 hover:bg-primary/5"
                  type="button"
                  onClick={() => onQuickActionClick(action.href)}
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
                <span className="text-muted-foreground">완료 시각</span>
                <span className="font-medium text-foreground">
                  {formatCompletedAt(stats.lastSynthesis.completedAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">생성 노드</span>
                <span className="font-medium text-foreground">
                  {stats.lastSynthesis.nodesCreated.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">생성 관계</span>
                <span className="font-medium text-foreground">
                  {stats.lastSynthesis.relationshipsCreated.toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-[22px] border border-dashed border-border/80 px-4 py-6 text-sm text-muted-foreground">
              아직 실행된 합성 기록이 없습니다.
            </div>
          )}
        </div>
      </section>

      {usageItems && usageItems.length > 0 ? (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">사용량</h2>
            <Button size="sm" type="button" variant="ghost" onClick={onOpenChanges}>
              변경 보기
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {usageItems.map((item) => (
              <UsageCard
                key={item.label}
                icon={item.icon}
                label={item.label}
                limit={item.limit}
                unit={item.unit}
                used={item.used}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-[28px] border border-border/70 bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-foreground">내 작업</p>
            <p className="mt-1 text-sm text-muted-foreground">최근 확인해야 할 변경 항목입니다.</p>
          </div>
          <Button size="sm" type="button" variant="ghost" onClick={onOpenChanges}>
            전체 보기
          </Button>
        </div>

        <div className="mt-5 space-y-3">
          {myWorkItems.map((item) => (
            <button
              key={item.id}
              className="flex w-full cursor-pointer items-center justify-between rounded-[22px] border border-border/70 bg-muted/35 px-4 py-4 text-left transition-colors hover:border-primary/45 hover:bg-primary/5"
              type="button"
              onClick={() => onMyWorkItemClick(item.href)}
            >
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={item.kind === "issue" ? "warning" : "info"}>
                    {item.kind === "issue" ? "Issue" : "Change"}
                  </Badge>
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
