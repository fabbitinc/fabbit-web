import type { ReactNode } from "react";
import { ArrowRight, Circle, Loader2 } from "lucide-react";
import { cn } from "@fabbit/ui";

// ── 타입 ────────────────────────────────────────────────

export interface PartHistoryEntry {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

export type PartHistoryRevisionStatus = "draft" | "released" | "superseded" | "canceled";

export type PartHistoryRevisionActivityCategory = "property" | "bom" | "file";

export interface PartHistoryRevisionActivity {
  id: string;
  category: PartHistoryRevisionActivityCategory;
  field?: string;
  fileName?: string;
  fromValue?: string | null;
  toValue?: string | null;
}

export interface PartHistoryRevisionChangeSummary {
  property?: number;
  file?: number;
  bom?: number;
}

export interface PartHistoryEvent {
  eventType: "CREATED" | "DRAFT_CREATED" | "DRAFT_RELEASED" | "DRAFT_CANCELED";
  occurredAt?: string;
  actorName?: string;
  reason?: string;
  creationSourceType?: "USER" | "SYNTHESIS";
  releaseWorkflowType?: "DIRECT" | "ENGINEERING_CHANGE";
  targetRevisionCode?: string;
  sourceRefNumber?: number;
  sourceRefTitle?: string;
}

export interface PartHistoryRevision {
  id: string;
  revisionLabel: string;
  revisionTitle: string;
  status: PartHistoryRevisionStatus;
  activities?: PartHistoryRevisionActivity[];
  changeSummary?: PartHistoryRevisionChangeSummary;
  events?: PartHistoryEvent[];
}

export interface PartHistoryTabProps {
  diffLoadingRevisionId?: string | null;
  entries?: PartHistoryEntry[];
  notice?: string;
  onOpenDiff?: (revision: PartHistoryRevision) => void;
  revisions?: PartHistoryRevision[];
}

// ── 유틸리티 ────────────────────────────────────────────

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date(value))
    .replace(/\. /g, ".")
    .replace(/\.$/, "");
}

function toLegacyRevisions(entries: PartHistoryEntry[]): PartHistoryRevision[] {
  return [
    {
      id: "legacy-revision",
      revisionLabel: "A",
      revisionTitle: "Rev A",
      status: "draft",
      changeSummary: { property: entries.length },
      activities: entries.map((entry) => ({
        id: entry.id,
        category: "property" as const,
        field: entry.title,
        toValue: entry.description,
      })),
    },
  ];
}

function hasMeaningfulSummary(summary?: PartHistoryRevisionChangeSummary) {
  if (!summary) return false;
  return Object.values(summary).some((count) => (count ?? 0) > 0);
}

const STATUS_LABEL: Record<PartHistoryRevisionStatus, string> = {
  draft: "초안",
  released: "배포됨",
  superseded: "대체됨",
  canceled: "취소됨",
};

const STATUS_DOT_CLASS: Record<PartHistoryRevisionStatus, string> = {
  released: "text-[var(--status-success)] fill-[var(--status-success)]",
  draft: "text-[var(--status-info)] fill-[var(--status-info)]",
  superseded: "text-muted-foreground fill-muted-foreground",
  canceled: "text-[var(--status-danger)] fill-[var(--status-danger)]",
};

const STATUS_BADGE_CLASS: Record<PartHistoryRevisionStatus, string> = {
  released: "border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success)]",
  draft: "border-[var(--status-info-border)] bg-[var(--status-info-bg)] text-[var(--status-info)]",
  superseded: "bg-muted text-muted-foreground border-border",
  canceled: "border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] text-[var(--status-danger)]",
};

// ── 이벤트 라벨 ─────────────────────────────────────────

function getEventLabel(event: PartHistoryEvent): string {
  switch (event.eventType) {
    case "CREATED":
      return "생성됨";
    case "DRAFT_CREATED":
      return event.creationSourceType === "SYNTHESIS" ? "EC 합성 초안" : "초안";
    case "DRAFT_RELEASED":
      return event.targetRevisionCode ? `배포 (Rev ${event.targetRevisionCode})` : "배포";
    case "DRAFT_CANCELED":
      return "초안 폐기";
    default:
      return "";
  }
}

function getEventDotClass(event: PartHistoryEvent): string {
  switch (event.eventType) {
    case "DRAFT_RELEASED":
      return "text-[var(--status-success)] fill-[var(--status-success)]";
    case "DRAFT_CANCELED":
      return "text-[var(--status-danger)] fill-[var(--status-danger)]";
    default:
      return "text-muted-foreground fill-muted-foreground";
  }
}

function ChangeSummary({
  isLoading = false,
  onClick,
  summary,
}: {
  isLoading?: boolean;
  onClick?: () => void;
  summary: PartHistoryRevisionChangeSummary;
}) {
  const parts: string[] = [];
  if (summary.property) parts.push(`속성 ${summary.property}건`);
  if (summary.bom) parts.push(`BOM ${summary.bom}건`);
  if (summary.file) parts.push(`파일 ${summary.file}건`);

  if (parts.length === 0) return null;

  return (
    <button
      type="button"
      className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", onClick && "cursor-pointer hover:text-foreground")}
      onClick={onClick}
    >
      <span>{parts.join(", ")} 변경</span>
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : onClick ? (
        <ArrowRight className="h-3 w-3" />
      ) : null}
    </button>
  );
}

// ── 타임라인 노드 ───────────────────────────────────────

function TimelineNode({
  children,
  isLast,
  dotClassName,
}: {
  children: ReactNode;
  isLast: boolean;
  dotClassName?: string;
}) {
  return (
    <div className={cn("relative pl-7", !isLast && "pb-6")}>
      {!isLast ? <div className="absolute left-[7px] top-4 bottom-0 w-px bg-border/70" /> : null}
      <Circle className={cn("absolute left-0 top-1.5 h-3.5 w-3.5", dotClassName ?? "text-muted-foreground/40 fill-muted-foreground/40")} />
      {children}
    </div>
  );
}

function SubTimelineNode({
  children,
  isLast,
  dotClassName,
}: {
  children: ReactNode;
  isLast: boolean;
  dotClassName?: string;
}) {
  return (
    <div className={cn("relative pl-6", !isLast && "pb-3")}>
      {!isLast ? <div className="absolute left-[5.5px] top-3.5 bottom-0 w-px bg-border/50" /> : null}
      <Circle className={cn("absolute left-0.5 top-1 h-2 w-2", dotClassName ?? "text-muted-foreground fill-muted-foreground")} />
      {children}
    </div>
  );
}

// ── 이벤트 행 ───────────────────────────────────────────

function EventTimelineItem({ event, isLast }: { event: PartHistoryEvent; isLast: boolean }) {
  const label = getEventLabel(event);
  const dotClass = getEventDotClass(event);
  const meta = [event.actorName, event.occurredAt ? formatDate(event.occurredAt) : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <SubTimelineNode isLast={isLast} dotClassName={dotClass}>
      <div className="space-y-0.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-sm text-foreground">{label}</span>
          {event.releaseWorkflowType === "ENGINEERING_CHANGE" && event.sourceRefNumber ? (
            <span className="rounded-md border border-border bg-muted/50 px-1.5 py-px text-xs text-muted-foreground">
              EC-{event.sourceRefNumber}
            </span>
          ) : null}
        </div>
        {meta ? <p className="text-xs text-muted-foreground">{meta}</p> : null}
        {event.reason ? (
          <p className="mt-1 rounded bg-muted/50 px-2 py-1 text-xs text-muted-foreground">{event.reason}</p>
        ) : null}
      </div>
    </SubTimelineNode>
  );
}

// ── 리비전 노드 ─────────────────────────────────────────

function RevisionNode({
  diffLoadingRevisionId,
  isLast,
  onOpenDiff,
  revision,
}: {
  diffLoadingRevisionId?: string | null;
  isLast: boolean;
  onOpenDiff?: (revision: PartHistoryRevision) => void;
  revision: PartHistoryRevision;
}) {
  const events = revision.events ?? [];
  const hasSummary = hasMeaningfulSummary(revision.changeSummary);
  const canOpenDiff = hasSummary && onOpenDiff != null;
  const isDiffLoading = diffLoadingRevisionId === revision.id;

  return (
    <TimelineNode isLast={isLast} dotClassName={STATUS_DOT_CLASS[revision.status]}>
      <div className="space-y-3">
        {/* 헤더 */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="text-sm font-semibold text-foreground">{revision.revisionTitle}</span>
          <span className={cn("rounded-md border px-1.5 py-px text-xs font-medium", STATUS_BADGE_CLASS[revision.status])}>
            {STATUS_LABEL[revision.status]}
          </span>
        </div>

        {/* 변경 요약 */}
        {revision.changeSummary && hasSummary ? (
          <ChangeSummary
            isLoading={isDiffLoading}
            summary={revision.changeSummary}
            onClick={canOpenDiff ? () => onOpenDiff(revision) : undefined}
          />
        ) : null}

        {/* 이벤트 서브 타임라인 */}
        {events.length > 0 ? (
          <div className="pt-1">
            {events.map((event, index) => (
              <EventTimelineItem
                key={`${event.eventType}-${index}`}
                event={event}
                isLast={index === events.length - 1}
              />
            ))}
          </div>
        ) : null}
      </div>
    </TimelineNode>
  );
}

// ── 메인 컴포넌트 ────────────────────────────────────────

export function PartHistoryTab({
  diffLoadingRevisionId,
  entries,
  notice,
  onOpenDiff,
  revisions,
}: PartHistoryTabProps) {
  const resolvedRevisions =
    revisions && revisions.length > 0
      ? revisions
      : entries && entries.length > 0
        ? toLegacyRevisions(entries)
        : [];

  return (
    <section>
      {notice ? <p className="mb-4 text-sm text-muted-foreground">{notice}</p> : null}

      {resolvedRevisions.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-card px-5 py-8 text-center text-sm text-muted-foreground">
          표시할 리비전 이력이 없습니다.
        </div>
      ) : (
        <div className="py-2">
          {resolvedRevisions.map((revision, index) => (
            <RevisionNode
              key={revision.id}
              diffLoadingRevisionId={diffLoadingRevisionId}
              isLast={index === resolvedRevisions.length - 1}
              onOpenDiff={onOpenDiff}
              revision={revision}
            />
          ))}
        </div>
      )}
    </section>
  );
}
