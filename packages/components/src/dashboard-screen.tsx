import { useEffect, useState } from "react";
import {
  ChevronRight,
  CircleDot,
  GitPullRequestArrow,
  HardDrive,
  Package,
  type LucideIcon,
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
  icon: LucideIcon;
}

export interface DashboardScreenWorkItemLabel {
  name: string;
  color: string;
}

export interface DashboardScreenWorkItem {
  id: string;
  title: string;
  href: string;
  kind: "issue" | "change";
  status: string;
  ownerName: string;
  number?: number;
  ownerImageUrl?: string | null;
  projectName?: string;
  updatedAt?: string;
  labels?: DashboardScreenWorkItemLabel[];
}

export interface DashboardScreenUsageItem {
  label: string;
  icon: LucideIcon;
  used: number;
  limit: number;
  unit: string;
  color?: string;
  gradient?: string;
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

function AnimatedCount({ value, durationMs = 420 }: { value: number; durationMs?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = Math.max(0, Math.floor(value));
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplay(Math.round(target * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [durationMs, value]);

  return <>{display.toLocaleString()}</>;
}

function DeltaBadge({ label, value }: { label: string; value: number }) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const prefix = isPositive ? "+" : "";
  const style = isPositive
    ? {
        color: "var(--status-success)",
        borderColor: "var(--status-success-border)",
        backgroundColor: "var(--status-success-bg)",
      }
    : isNegative
      ? {
          color: "var(--status-danger)",
          borderColor: "var(--status-danger-border)",
          backgroundColor: "var(--status-danger-bg)",
        }
      : {
          color: "var(--status-info)",
          borderColor: "var(--status-info-border)",
          backgroundColor: "var(--status-info-bg)",
        };

  return (
    <span className="inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium" style={style}>
      {label} {prefix}
      {Math.abs(value).toLocaleString()}
    </span>
  );
}

function getStatusBadge(item: DashboardScreenWorkItem) {
  const normalizedStatus = item.status.trim().toLowerCase();

  if (item.kind === "change") {
    if (normalizedStatus.includes("draft") || normalizedStatus.includes("초안")) {
      return { className: "border-gray-200 bg-gray-50 text-gray-600", text: "초안" };
    }
    if (normalizedStatus.includes("review") || normalizedStatus.includes("검토")) {
      return { className: "border-blue-200 bg-blue-50 text-blue-700", text: "검토 중" };
    }
    if (normalizedStatus.includes("merge") || normalizedStatus.includes("반영") || normalizedStatus.includes("승인")) {
      return { className: "border-purple-200 bg-purple-50 text-purple-700", text: "반영" };
    }

    return { className: "border-emerald-200 bg-emerald-50 text-emerald-700", text: item.status || "열림" };
  }

  if (normalizedStatus.includes("close") || normalizedStatus.includes("닫힘")) {
    return { className: "border-gray-200 bg-gray-50 text-gray-600", text: "닫힘" };
  }

  return { className: "border-emerald-200 bg-emerald-50 text-emerald-700", text: item.status || "열림" };
}

function resolveWorkNumber(item: DashboardScreenWorkItem) {
  if (item.number != null) {
    return item.number;
  }

  const matched = item.href.match(/(\d+)(?:\/)?$/);
  return matched ? Number(matched[1]) : null;
}

export function DashboardScreen({
  myWorkItems,
  stats,
  usageItems,
  onMyWorkItemClick,
  onOpenChanges,
  onOpenParts,
}: DashboardScreenProps) {
  const issueCount = myWorkItems.filter((item) => item.kind === "issue").length;
  const changeCount = myWorkItems.filter((item) => item.kind === "change").length;
  const partsTotal = stats?.parts.total ?? 0;
  const partsAddedThisWeek = stats?.parts.addedThisWeek ?? 0;
  const bomLinksTotal = stats?.bomLinks.total ?? 0;
  const lastSynthesis = stats?.lastSynthesis ?? null;
  const lastSynthesisAt = lastSynthesis?.completedAt
    ? new Date(lastSynthesis.completedAt).toLocaleString("ko-KR", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : null;

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">내 현황</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard
            icon={CircleDot}
            label="할당된 이슈"
            sub="열린 이슈"
            value={issueCount}
            onClick={onOpenChanges}
          />
          <SummaryCard
            icon={GitPullRequestArrow}
            label="할당된 변경요청"
            sub="진행 중인 CR"
            value={changeCount}
            onClick={onOpenChanges}
          />
          <SummaryCard
            icon={Package}
            label="관리 중인 부품"
            sub="전체 부품 수"
            value={1234}
            onClick={onOpenParts}
          />
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-foreground">내 작업</h2>
          <Button className="h-7 gap-1 px-2 text-xs text-muted-foreground" size="sm" type="button" variant="ghost" onClick={onOpenChanges}>
            전체 보기
          </Button>
        </div>

        <div className="divide-y divide-border">
          {myWorkItems.map((item) => {
            const status = getStatusBadge(item);
            const workNumber = resolveWorkNumber(item);

            return (
              <button
                key={item.id}
                className="group flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-accent/40"
                type="button"
                onClick={() => onMyWorkItemClick(item.href)}
              >
                <div className="shrink-0">
                  {item.kind === "issue" ? (
                    <CircleDot className="size-4 text-emerald-500" />
                  ) : (
                    <GitPullRequestArrow className="size-4 text-blue-500" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {workNumber != null ? (
                      <span className="text-xs font-medium text-muted-foreground">#{workNumber}</span>
                    ) : null}
                    <span className="truncate text-sm font-medium text-foreground group-hover:text-foreground/90">
                      {item.title}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    {item.projectName ? <span>{item.projectName}</span> : null}
                    {item.projectName && item.updatedAt ? <span>·</span> : null}
                    {item.updatedAt ? <span>{item.updatedAt}</span> : null}
                    {!item.projectName && !item.updatedAt ? <span>{item.status}</span> : null}
                  </div>
                </div>

                <div className="hidden items-center gap-1.5 sm:flex">
                  {item.labels?.map((label) => (
                    <span
                      key={label.name}
                      className="inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium"
                      style={{
                        backgroundColor: `${label.color}10`,
                        borderColor: `${label.color}33`,
                        color: label.color,
                      }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>

                <Badge className={`shrink-0 text-[11px] ${status.className}`} variant="outline">
                  {status.text}
                </Badge>

                <UserAvatar className="size-6 text-[10px]" imageUrl={item.ownerImageUrl ?? null} name={item.ownerName} />

                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">부품 현황</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {stats ? (
            <>
              {partsTotal > 0 ? (
                <div className="rounded-lg border border-border bg-card p-5 md:col-span-2">
                  <p className="text-xs text-muted-foreground">관리 중인 부품</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    <AnimatedCount value={partsTotal} />개
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">현재 시스템에서 관리 중인 부품 수</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <DeltaBadge label="이번 주" value={partsAddedThisWeek} />
                  </div>
                </div>
              ) : (
                <div
                  className="rounded-lg border border-dashed p-5 md:col-span-2"
                  style={{
                    borderColor: "var(--status-info-border)",
                    backgroundColor: "var(--status-info-bg)",
                  }}
                >
                  <p className="text-xs text-muted-foreground">부품 현황</p>
                  <p className="mt-2 text-lg font-semibold" style={{ color: "var(--status-info)" }}>
                    아직 등록된 부품이 없습니다.
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">부품 등록을 하러 가볼까요?</p>
                  <div className="mt-3">
                    <Button
                      style={{ borderColor: "var(--brand-500)", color: "var(--brand-600)" }}
                      type="button"
                      variant="outline"
                      onClick={onOpenParts}
                    >
                      부품 등록 페이지로 이동
                    </Button>
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-xs text-muted-foreground">BOM 연결</p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  <AnimatedCount value={bomLinksTotal} />개
                </p>
                <p className="mt-1 text-xs text-muted-foreground">부품 간 구성 관계 수</p>
              </div>

              {lastSynthesis ? (
                <div className="rounded-lg border border-border bg-card p-5 md:col-span-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">마지막 부품 업로드</p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {lastSynthesisAt ? `완료 시각: ${lastSynthesisAt}` : `상태: ${lastSynthesis.status}`}
                      </p>
                    </div>
                    <div className="flex gap-6">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">등록 항목</p>
                        <p className="text-2xl font-bold text-foreground">
                          <AnimatedCount value={lastSynthesis.nodesCreated} />
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">등록 관계</p>
                        <p className="text-2xl font-bold text-foreground">
                          <AnimatedCount value={lastSynthesis.relationshipsCreated} />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="rounded-lg border border-dashed p-5 md:col-span-3"
                  style={{
                    borderColor: "var(--status-info-border)",
                    backgroundColor: "var(--status-info-bg)",
                  }}
                >
                  <p className="text-xs text-muted-foreground">부품 업로드</p>
                  <p className="mt-1 text-sm text-muted-foreground">아직 부품 업로드 이력이 없습니다.</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="h-36 animate-pulse rounded-lg bg-muted md:col-span-2" />
              <div className="h-36 animate-pulse rounded-lg bg-muted" />
              <div className="h-20 animate-pulse rounded-lg bg-muted md:col-span-3" />
            </>
          )}
        </div>
      </section>

      {usageItems && usageItems.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground">사용량</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {usageItems.map((item) => (
              <UsageCard
                key={item.label}
                color={item.color ?? (item.icon === HardDrive ? "var(--brand-500)" : "var(--ai-from)")}
                gradient={item.gradient}
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
    </div>
  );
}
