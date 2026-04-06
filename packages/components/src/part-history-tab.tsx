import { type ReactNode, useState } from "react";
import { ArrowRight, ChevronDown, Circle, GitCommit, Loader2 } from "lucide-react";
import { cn } from "@fabbit/ui";

export interface PartHistoryEntry {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

export type PartHistoryRevisionStatus = "draft" | "released" | "superseded" | "canceled";

export type PartHistoryRevisionActivityCategory =
  | "property"
  | "bom"
  | "file";

export interface PartHistoryRevisionActivity {
  id: string;
  category: PartHistoryRevisionActivityCategory;
  field?: string;
  fileName?: string;
  fromValue?: string | null;
  toValue?: string | null;
}

export type PartHistoryRevisionEventType = "released" | "superseded" | "canceled";

export interface PartHistoryRevisionEvent {
  type: PartHistoryRevisionEventType;
  author: string;
  reason?: string;
  timestamp?: string;
}

export interface PartHistoryDraft {
  id: string;
  creationSourceType?: "USER" | "SYNTHESIS";
  status: PartHistoryRevisionStatus;
  createdAt?: string;
  createdBy?: string;
  completedAt?: string;
  completedBy?: string;
  releasedRevisionLabel?: string;
  reason?: string;
}

export interface PartHistoryRevisionChangeSummary {
  property?: number;
  file?: number;
  bom?: number;
}

export interface PartHistoryRevision {
  id: string;
  revisionLabel: string;
  revisionTitle: string;
  author?: string;
  timestamp?: string;
  status: PartHistoryRevisionStatus;
  releaseReason?: string;
  releaseWorkflowType?: "DIRECT" | "ENGINEERING_CHANGE";
  releaseSourceNumber?: number;
  releaseSourceTitle?: string;
  activities?: PartHistoryRevisionActivity[];
  changeSummary?: PartHistoryRevisionChangeSummary;
  drafts?: PartHistoryDraft[];
  events?: PartHistoryRevisionEvent[];
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
      author: "시스템",
      timestamp: entries[0]?.timestamp ?? new Date().toISOString(),
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

const CATEGORY_LABELS: Record<PartHistoryRevisionActivityCategory, string> = {
  property: "속성",
  file: "파일",
  bom: "BOM",
};

// ── 변경 내역 ───────────────────────────────────────────

function ActivityRow({ activity }: { activity: PartHistoryRevisionActivity }) {
  if (activity.category === "file" && activity.fileName) {
    const isAdded = activity.toValue === "added";
    return (
      <div className="flex items-baseline gap-1.5 py-0.5 text-sm">
        <span className={cn(
          isAdded ? "text-emerald-700 dark:text-emerald-400" : "text-red-600/80 line-through dark:text-red-400/80",
        )}>
          {activity.fileName}
        </span>
        <span className="text-xs text-muted-foreground">{isAdded ? "추가" : "삭제"}</span>
      </div>
    );
  }

  if (activity.field) {
    const isAdded = !activity.fromValue || activity.fromValue === "added";
    const isRemoved = activity.fromValue === "removed" || (!activity.toValue && activity.fromValue);

    if (isAdded && activity.toValue && activity.toValue !== "added") {
      return (
        <div className="flex items-baseline gap-1.5 py-0.5 text-sm">
          <span className="text-muted-foreground">{activity.field}</span>
          <span className="font-medium text-foreground">{activity.toValue}</span>
        </div>
      );
    }

    if (isRemoved || activity.fromValue === "removed") {
      return (
        <div className="flex items-baseline gap-1.5 py-0.5 text-sm">
          <span className="text-red-600/80 line-through dark:text-red-400/80">{activity.field}</span>
          <span className="text-xs text-muted-foreground">삭제</span>
        </div>
      );
    }

    if (activity.toValue === "added") {
      return (
        <div className="flex items-baseline gap-1.5 py-0.5 text-sm">
          <span className="text-emerald-700 dark:text-emerald-400">{activity.field}</span>
          <span className="text-xs text-muted-foreground">추가</span>
        </div>
      );
    }

    return (
      <div className="flex items-baseline gap-1.5 py-0.5 text-sm">
        <span className="text-muted-foreground">{activity.field}</span>
        <span className="text-red-600/70 line-through dark:text-red-400/70">{activity.fromValue}</span>
        <ArrowRight className="inline h-3 w-3 shrink-0 text-muted-foreground/40" />
        <span className="font-medium text-foreground">{activity.toValue}</span>
      </div>
    );
  }

  return null;
}

function ActivitiesByCategory({ activities }: { activities: PartHistoryRevisionActivity[] }) {
  const grouped = new Map<PartHistoryRevisionActivityCategory, PartHistoryRevisionActivity[]>();
  for (const activity of activities) {
    const list = grouped.get(activity.category) ?? [];
    list.push(activity);
    grouped.set(activity.category, list);
  }

  return (
    <div className="space-y-3">
      {(["property", "bom", "file"] as const).map((category) => {
        const items = grouped.get(category);
        if (!items || items.length === 0) return null;
        return (
          <div key={category}>
            <p className="mb-1 text-xs font-medium text-muted-foreground">{CATEGORY_LABELS[category]}</p>
            <div className="space-y-0.5">
              {items.map((activity) => (
                <ActivityRow key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChangeSummaryBadges({
  isLoading = false,
  isOpenDiff = false,
  onClick,
  summary,
  expanded,
  hasActivities,
}: {
  isLoading?: boolean;
  isOpenDiff?: boolean;
  onClick?: () => void;
  summary: PartHistoryRevisionChangeSummary;
  expanded: boolean;
  hasActivities: boolean;
}) {
  const entries = (Object.entries(summary) as [PartHistoryRevisionActivityCategory, number | undefined][])
    .filter(([, count]) => count != null && count > 0);

  if (entries.length === 0) return null;

  return (
    <button
      type="button"
      className={cn("flex flex-wrap items-center gap-1.5", onClick && "cursor-pointer")}
      onClick={onClick}
    >
      {entries.map(([category, count]) => (
        <span
          key={category}
          className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
        >
          {CATEGORY_LABELS[category]} {count}건
        </span>
      ))}
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
      ) : isOpenDiff ? (
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
      ) : hasActivities ? (
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", expanded && "rotate-180")} />
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
}: {
  children: ReactNode;
  isLast: boolean;
}) {
  return (
    <div className={cn("relative pl-5", !isLast && "pb-3")}>
      {!isLast ? <div className="absolute left-[5px] top-3 bottom-0 w-px bg-border/50" /> : null}
      <GitCommit className="absolute left-0 top-0.5 h-2.5 w-2.5 text-muted-foreground/40" />
      {children}
    </div>
  );
}

// ── Draft 행 ────────────────────────────────────────────

function getDraftLabel(draft: PartHistoryDraft, isFirst: boolean) {
  if (isFirst) return "생성됨";
  if (draft.creationSourceType === "SYNTHESIS") return "EC 합성 초안";
  return "초안";
}

function getDraftStatusSuffix(draft: PartHistoryDraft) {
  if (draft.status === "released") {
    return draft.releasedRevisionLabel ? `→ 배포 (Rev ${draft.releasedRevisionLabel})` : "→ 배포";
  }
  if (draft.status === "canceled") return "→ 폐기";
  if (draft.status === "superseded") return "→ 대체됨";
  return "";
}

function getDraftStatusClassName(status: PartHistoryDraft["status"]) {
  if (status === "released") return "text-[var(--status-success)]";
  if (status === "canceled") return "text-[var(--status-danger)]";
  if (status === "superseded") return "text-muted-foreground";
  return "text-[var(--status-info)]";
}

function DraftTimelineItem({ draft, isFirst, isLast }: { draft: PartHistoryDraft; isFirst: boolean; isLast: boolean }) {
  const label = getDraftLabel(draft, isFirst);
  const suffix = getDraftStatusSuffix(draft);
  const meta = [draft.createdBy, draft.createdAt ? formatDate(draft.createdAt) : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <SubTimelineNode isLast={isLast}>
      <div className="space-y-0.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-sm text-foreground">{label}</span>
          {suffix ? (
            <span className={cn("text-xs font-medium", getDraftStatusClassName(draft.status))}>{suffix}</span>
          ) : null}
        </div>
        {meta ? <p className="text-xs text-muted-foreground">{meta}</p> : null}
        {draft.reason ? (
          <p className="mt-1 rounded bg-muted/50 px-2 py-1 text-xs text-muted-foreground">{draft.reason}</p>
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
  const [expanded, setExpanded] = useState(false);
  const drafts = revision.drafts ?? [];
  const activities = revision.activities ?? [];
  const hasSummary = hasMeaningfulSummary(revision.changeSummary);
  const canOpenDiff = hasSummary && onOpenDiff != null;
  const isDiffLoading = diffLoadingRevisionId === revision.id;
  const meta = [revision.author, revision.timestamp ? formatDate(revision.timestamp) : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <TimelineNode isLast={isLast} dotClassName={STATUS_DOT_CLASS[revision.status]}>
      <div className="space-y-3">
        {/* 헤더 */}
        <div>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="text-sm font-semibold text-foreground">{revision.revisionTitle}</span>
            <span className={cn("rounded-md border px-1.5 py-px text-xs font-medium", STATUS_BADGE_CLASS[revision.status])}>
              {STATUS_LABEL[revision.status]}
            </span>
            {revision.releaseWorkflowType === "ENGINEERING_CHANGE" && revision.releaseSourceNumber ? (
              <span className="rounded-md border border-border bg-muted/50 px-1.5 py-px text-xs text-muted-foreground">
                EC-{revision.releaseSourceNumber}
              </span>
            ) : null}
            {meta ? <span className="text-xs text-muted-foreground">{meta}</span> : null}
          </div>
        </div>

        {/* 변경 요약 */}
        {revision.changeSummary && hasSummary ? (
          <div>
            <ChangeSummaryBadges
              isLoading={isDiffLoading}
              isOpenDiff={canOpenDiff}
              summary={revision.changeSummary}
              expanded={expanded}
              onClick={
                canOpenDiff
                  ? () => onOpenDiff(revision)
                  : activities.length > 0
                    ? () => setExpanded((prev) => !prev)
                    : undefined
              }
              hasActivities={activities.length > 0}
            />
            {expanded && activities.length > 0 ? (
              <div className="mt-2 rounded-md border bg-muted/20 p-3">
                <ActivitiesByCategory activities={activities} />
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Draft 서브 타임라인 */}
        {drafts.length > 0 ? (
          <div className="pt-1">
            {drafts.map((draft, index) => (
              <DraftTimelineItem key={draft.id} draft={draft} isFirst={index === drafts.length - 1} isLast={index === drafts.length - 1} />
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
