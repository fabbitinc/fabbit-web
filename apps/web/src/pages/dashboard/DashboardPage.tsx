import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  CircleDot,
  GitPullRequestArrow,
  ArrowRight,
  HardDrive,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { useDashboardStats } from "@/api/hooks/useDashboard";
import { useAuthStore } from "@/stores/authStore";

// ─── 내부 유틸 ─────────────────────────────────────────

function AnimatedCount({ value, durationMs = 420 }: { value: number; durationMs?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const safeTarget = Math.max(0, Math.floor(value));
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplay(Math.round(safeTarget * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs]);

  return <>{display.toLocaleString()}</>;
}

function DeltaBadge({ value, label }: { value: number; label: string }) {
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

// ─── Mock 데이터 ───────────────────────────────────────

interface MyWorkItem {
  id: string;
  number: number;
  title: string;
  type: "issue" | "change";
  state: string;
  crState?: string;
  projectName: string;
  updatedAt: string;
  labels: { name: string; color: string }[];
  createdBy: { name: string; initials: string };
}

const MOCK_MY_WORK: MyWorkItem[] = [
  {
    id: "1",
    number: 42,
    title: "센서 모듈 하우징 간섭 이슈",
    type: "issue",
    state: "open",
    projectName: "EV 모터 컨트롤러",
    updatedAt: "2시간 전",
    labels: [{ name: "긴급", color: "#ef4444" }],
    createdBy: { name: "김태현", initials: "태" },
  },
  {
    id: "2",
    number: 15,
    title: "PCB 커넥터 핀 배열 변경",
    type: "change",
    state: "open",
    crState: "in_review",
    projectName: "EV 모터 컨트롤러",
    updatedAt: "4시간 전",
    labels: [{ name: "설계변경", color: "#3b82f6" }],
    createdBy: { name: "이수진", initials: "수" },
  },
  {
    id: "3",
    number: 78,
    title: "방열판 재질 SUS304 → AL6061 검토",
    type: "issue",
    state: "open",
    projectName: "배터리 팩 v2",
    updatedAt: "1일 전",
    labels: [{ name: "검토필요", color: "#f59e0b" }],
    createdBy: { name: "박준서", initials: "준" },
  },
  {
    id: "4",
    number: 8,
    title: "메인 하우징 도면 Rev.C 반영",
    type: "change",
    state: "open",
    crState: "draft",
    projectName: "배터리 팩 v2",
    updatedAt: "2일 전",
    labels: [],
    createdBy: { name: "최민정", initials: "민" },
  },
  {
    id: "5",
    number: 103,
    title: "볼트 체결 토크 규격 정의",
    type: "issue",
    state: "open",
    projectName: "EV 모터 컨트롤러",
    updatedAt: "3일 전",
    labels: [{ name: "규격", color: "#8b5cf6" }],
    createdBy: { name: "정하은", initials: "하" },
  },
];

interface UsageItem {
  label: string;
  icon: typeof HardDrive;
  used: number;
  limit: number;
  unit: string;
  color: string;
  /** gradient CSS 문자열 (Progress 바에 적용) */
  gradient?: string;
}

const MOCK_USAGE: UsageItem[] = [
  {
    label: "파일 저장 용량",
    icon: HardDrive,
    used: 8.2,
    limit: 10,
    unit: "GB",
    color: "var(--brand-500, #3b82f6)",
  },
  {
    label: "AI 크레딧",
    icon: Sparkles,
    used: 620,
    limit: 1000,
    unit: "크레딧",
    color: "var(--ai-from, #06b6d4)",
    gradient: "linear-gradient(90deg, var(--ai-from, #06b6d4), var(--ai-to, #2563eb))",
  },
];

// ─── 상태 배지 헬퍼 ────────────────────────────────────

function stateLabel(item: MyWorkItem): { text: string; className: string } {
  if (item.type === "change") {
    switch (item.crState) {
      case "in_review":
        return { text: "검토 중", className: "border-blue-200 bg-blue-50 text-blue-700" };
      case "draft":
        return { text: "초안", className: "border-gray-200 bg-gray-50 text-gray-600" };
      case "approved":
        return { text: "승인됨", className: "border-green-200 bg-green-50 text-green-700" };
      default:
        return { text: "열림", className: "border-emerald-200 bg-emerald-50 text-emerald-700" };
    }
  }
  return { text: "열림", className: "border-emerald-200 bg-emerald-50 text-emerald-700" };
}

// ─── 서브 컴포넌트: 요약 카드 ──────────────────────────

function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
  onClick,
}: {
  icon: typeof CircleDot;
  label: string;
  value: number;
  sub?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col gap-1 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-border/80 hover:bg-accent/40"
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="text-2xl font-bold text-foreground">
        <AnimatedCount value={value} />
      </p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </button>
  );
}

// ─── 서브 컴포넌트: 내 작업 목록 ────────────────────────

function MyWorkSection() {
  const navigate = useNavigate();

  function handleItemClick(item: MyWorkItem) {
    if (item.type === "issue") {
      navigate(`/changes/issues/${item.number}`);
    } else {
      navigate(`/changes/requests/${item.number}`);
    }
  }

  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h2 className="text-sm font-semibold text-foreground">내 작업</h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs text-muted-foreground"
          onClick={() => navigate("/changes")}
        >
          전체 보기
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>

      <div className="divide-y divide-border">
        {MOCK_MY_WORK.map((item) => {
          const state = stateLabel(item);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item)}
              className="group flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-accent/40"
            >
              {/* 아이콘 */}
              <div className="flex-shrink-0">
                {item.type === "issue" ? (
                  <CircleDot className="h-4 w-4 text-emerald-500" />
                ) : (
                  <GitPullRequestArrow className="h-4 w-4 text-blue-500" />
                )}
              </div>

              {/* 번호 + 제목 */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    #{item.number}
                  </span>
                  <span className="truncate text-sm font-medium text-foreground group-hover:text-foreground/90">
                    {item.title}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{item.projectName}</span>
                  <span>·</span>
                  <span>{item.updatedAt}</span>
                </div>
              </div>

              {/* 라벨 */}
              <div className="hidden items-center gap-1.5 sm:flex">
                {item.labels.map((l) => (
                  <span
                    key={l.name}
                    className="inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium"
                    style={{
                      color: l.color,
                      borderColor: `${l.color}33`,
                      backgroundColor: `${l.color}10`,
                    }}
                  >
                    {l.name}
                  </span>
                ))}
              </div>

              {/* 상태 */}
              <Badge variant="outline" className={`shrink-0 text-[11px] ${state.className}`}>
                {state.text}
              </Badge>

              {/* 작성자 아바타 */}
              <UserAvatar name={item.createdBy.name} className="h-6 w-6 text-[10px]" />

              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ─── 서브 컴포넌트: 부품 현황 ───────────────────────────

function PartsSection() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-36 animate-pulse rounded-lg bg-muted md:col-span-2" />
        <div className="h-36 animate-pulse rounded-lg bg-muted" />
        <div className="h-20 animate-pulse rounded-lg bg-muted md:col-span-3" />
      </div>
    );
  }

  const totalManagedParts = stats.parts.total;
  const lastSynthesis = stats.last_synthesis;
  const lastSynthesisAt = lastSynthesis?.completed_at
    ? new Date(lastSynthesis.completed_at).toLocaleString("ko-KR", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : null;

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-foreground">부품 현황</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {totalManagedParts > 0 ? (
          <div className="rounded-lg border border-border bg-card p-5 md:col-span-2">
            <p className="text-xs text-muted-foreground">관리 중인 부품</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              <AnimatedCount value={stats.parts.total} />개
            </p>
            <p className="mt-1 text-xs text-muted-foreground">현재 시스템에서 관리 중인 부품 수</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <DeltaBadge label="이번 주" value={stats.parts.added_this_week} />
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
                variant="outline"
                style={{ borderColor: "var(--brand-500)", color: "var(--brand-600)" }}
                onClick={() => navigate("/parts")}
              >
                부품 등록 페이지로 이동
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">BOM 연결</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            <AnimatedCount value={stats.bom_links.total} />개
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
                    <AnimatedCount value={lastSynthesis.nodes_created} />
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">등록 관계</p>
                  <p className="text-2xl font-bold text-foreground">
                    <AnimatedCount value={lastSynthesis.relationships_created} />
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
      </div>
    </section>
  );
}

// ─── 서브 컴포넌트: 조직 사용량 (관리자 전용) ────────────

function UsageCard({ item }: { item: UsageItem }) {
  const Icon = item.icon;
  const percent = Math.round((item.used / item.limit) * 100);
  const isHigh = percent >= 80;
  const dangerColor = "var(--status-danger, #ef4444)";

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" style={{ color: item.color }} />
        {item.label}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-bold tabular-nums text-foreground">
          {item.used.toLocaleString()}
        </span>
        <span className="text-sm text-muted-foreground">
          / {item.limit.toLocaleString()} {item.unit}
        </span>
      </div>
      <div className="mt-3">
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${percent}%`,
              background: item.gradient ?? item.color,
            }}
          />
        </div>
      </div>
      {isHigh && (
        <p className="mt-2 text-xs" style={{ color: dangerColor }}>
          사용량이 {percent}%에 도달했습니다
        </p>
      )}
    </div>
  );
}

function UsageSection() {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-foreground">사용량</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {MOCK_USAGE.map((item) => (
          <UsageCard key={item.label} item={item} />
        ))}
      </div>
    </section>
  );
}

// ─── 메인 DashboardPage ────────────────────────────────

export function DashboardPage() {
  const navigate = useNavigate();
  const currentMembership = useAuthStore((s) => s.currentMembership);
  const isAdmin =
    currentMembership?.role?.toUpperCase() === "ADMIN" ||
    currentMembership?.role?.toUpperCase() === "OWNER";

  // mock 요약 수치
  const myIssueCount = MOCK_MY_WORK.filter((w) => w.type === "issue").length;
  const myCrCount = MOCK_MY_WORK.filter((w) => w.type === "change").length;

  return (
    <div className="space-y-6">
      {/* 내 현황 */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">내 현황</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard
            icon={CircleDot}
            label="할당된 이슈"
            value={myIssueCount}
            sub="열린 이슈"
            onClick={() => navigate("/changes")}
          />
          <SummaryCard
            icon={GitPullRequestArrow}
            label="할당된 변경요청"
            value={myCrCount}
            sub="진행 중인 CR"
            onClick={() => navigate("/changes")}
          />
          <SummaryCard
            icon={Package}
            label="관리 중인 부품"
            value={1234}
            sub="전체 부품 수"
            onClick={() => navigate("/parts")}
          />
        </div>
      </section>

      {/* 내 작업 목록 */}
      <MyWorkSection />

      {/* 부품 현황 */}
      <PartsSection />

      {/* 조직 사용량 (관리자 전용) */}
      {isAdmin && <UsageSection />}
    </div>
  );
}
