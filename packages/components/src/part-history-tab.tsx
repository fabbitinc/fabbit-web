import { type ReactNode, useState } from "react";
import { ArrowRight, ChevronDown, CircleDot, Loader2, PackageCheck, Repeat2, X } from "lucide-react";
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
  label: string;
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
  if (!summary) {
    return false;
  }

  return Object.values(summary).some((count) => (count ?? 0) > 0);
}

function getRevisionStatusLabel(status: PartHistoryRevisionStatus) {
  const map: Record<PartHistoryRevisionStatus, string> = {
    canceled: "취소됨",
    draft: "초안",
    released: "배포됨",
    superseded: "대체됨",
  };
  return map[status];
}

function getRevisionTone(status: PartHistoryRevisionStatus) {
  if (status === "released") {
    return { badgeClassName: "border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success)]" };
  }
  if (status === "draft") {
    return { badgeClassName: "border-[var(--status-info-border)] bg-[var(--status-info-bg)] text-[var(--status-info)]" };
  }
  if (status === "superseded") {
    return { badgeClassName: "bg-muted text-muted-foreground border-border" };
  }
  return { badgeClassName: "border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] text-[var(--status-danger)]" };
}

function getEventTone(type: PartHistoryRevisionEventType) {
  if (type === "released") {
    return { icon: PackageCheck, className: "text-[var(--status-success)]" };
  }
  if (type === "canceled") {
    return { icon: X, className: "text-[var(--status-danger)]" };
  }
  return { icon: Repeat2, className: "text-muted-foreground" };
}

function getEventLabel(type: PartHistoryRevisionEventType) {
  if (type === "released") return "배포";
  if (type === "canceled") return "취소";
  return "대체됨";
}

function getDraftStatusLabel(draft: PartHistoryDraft) {
  if (draft.status === "released") {
    return draft.releasedRevisionLabel
      ? `배포 · Rev ${draft.releasedRevisionLabel}`
      : "배포";
  }
  if (draft.status === "canceled") {
    return "폐기";
  }
  if (draft.status === "superseded") {
    return "대체됨";
  }
  return "진행 중";
}

function getDraftStatusClassName(status: PartHistoryDraft["status"]) {
  if (status === "released") {
    return "text-[var(--status-success)]";
  }
  if (status === "canceled") {
    return "text-[var(--status-danger)]";
  }
  if (status === "superseded") {
    return "text-muted-foreground";
  }
  return "text-[var(--status-info)]";
}

const CATEGORY_LABELS: Record<PartHistoryRevisionActivityCategory, string> = {
  property: "속성",
  file: "파일",
  bom: "BOM",
};

// ── 변경 내역 펼침 ──────────────────────────────────────

function ActivityRow({ activity }: { activity: PartHistoryRevisionActivity }) {
  // 파일: 추가/삭제
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

  // 속성/BOM: field + from → to
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
      className={cn(
        "flex flex-wrap items-center gap-1.5",
        onClick && "cursor-pointer",
      )}
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
        <ChevronDown className={cn(
          "h-3.5 w-3.5 text-muted-foreground transition-transform",
          expanded && "rotate-180",
        )} />
      ) : null}
    </button>
  );
}

function DraftHistoryRow({
  draft,
}: {
  draft: PartHistoryDraft;
}) {
  const createdMeta = [draft.createdBy, draft.createdAt ? formatDate(draft.createdAt) : null]
    .filter(Boolean)
    .join(" · ");
  const completedMeta = [getDraftStatusLabel(draft), draft.completedBy, draft.completedAt ? formatDate(draft.completedAt) : null]
    .filter(Boolean)
    .join(" · ");
  const isCanceled = draft.status === "canceled";

  return (
    <div className="flex flex-col gap-1.5 py-2">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span
          className={cn(
            "text-sm font-medium text-foreground",
            isCanceled && "text-muted-foreground line-through",
          )}
        >
          {draft.label}
        </span>
        <span className={cn("text-xs font-medium", getDraftStatusClassName(draft.status))}>
          {completedMeta || getDraftStatusLabel(draft)}
        </span>
      </div>
      {createdMeta ? (
        <p className="text-xs text-muted-foreground">{createdMeta}</p>
      ) : null}
      {draft.reason ? (
        <p className="text-xs text-muted-foreground">{draft.reason}</p>
      ) : null}
    </div>
  );
}

// ── 타임라인 ─────────────────────────────────────────────

function RevisionTimelineRow({
  children,
  isLast,
  toneClassName,
}: {
  children: ReactNode;
  isLast: boolean;
  toneClassName?: string;
}) {
  return (
    <div className={cn("relative pl-7", !isLast ? "pb-5" : "")}>
      {!isLast ? <div className="absolute left-[7px] top-4 bottom-0 w-px bg-border" /> : null}
      <CircleDot className={cn("absolute left-0 top-1 h-3.5 w-3.5", toneClassName ?? "text-muted-foreground/60")} />
      {children}
    </div>
  );
}

// ── 리비전 카드 ──────────────────────────────────────────

function RevisionItem({
  diffLoadingRevisionId,
  onOpenDiff,
  revision,
}: {
  diffLoadingRevisionId?: string | null;
  onOpenDiff?: (revision: PartHistoryRevision) => void;
  revision: PartHistoryRevision;
}) {
  const [expanded, setExpanded] = useState(false);
  const tone = getRevisionTone(revision.status);
  const events = revision.events ?? [];
  const drafts = revision.drafts ?? [];
  const activities = revision.activities ?? [];
  const hasSummary = hasMeaningfulSummary(revision.changeSummary);
  const canOpenDiff = hasSummary && onOpenDiff != null;
  const isDiffLoading = diffLoadingRevisionId === revision.id;
  const hasMeta = Boolean(revision.author || revision.timestamp);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-base font-semibold text-foreground">{revision.revisionTitle}</span>
        <span className={cn("rounded-md border px-2 py-0.5 text-xs font-medium", tone.badgeClassName)}>
          {getRevisionStatusLabel(revision.status)}
        </span>
        {hasMeta ? (
          <span className="text-xs text-muted-foreground">
            {[revision.author, revision.timestamp ? formatDate(revision.timestamp) : null]
              .filter(Boolean)
              .join(" · ")}
          </span>
        ) : null}
      </div>

      {revision.changeSummary && hasSummary ? (
        <div className="mb-4">
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">변경 내역</p>
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
            <div className="mt-3 rounded-md border bg-muted/20 p-3">
              <ActivitiesByCategory activities={activities} />
            </div>
          ) : null}
        </div>
      ) : null}

      {drafts.length > 0 ? (
        <div className="mb-4 divide-y divide-border/50">
          {drafts.map((draft) => (
            <DraftHistoryRow key={draft.id} draft={draft} />
          ))}
        </div>
      ) : null}

      {events.length > 0 ? (
        <div>
          {events.map((event, index) => {
            const eventTone = getEventTone(event.type);
            const EventIcon = eventTone.icon;

            return (
              <RevisionTimelineRow
                key={`${event.type}-${index}`}
                isLast={index === events.length - 1}
                toneClassName={eventTone.className}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <EventIcon className={cn("h-3.5 w-3.5", eventTone.className)} />
                    <span className={cn("text-sm font-medium", eventTone.className)}>{getEventLabel(event.type)}</span>
                    {event.author && event.author !== "시스템" ? (
                      <span className="text-sm text-muted-foreground">{event.author}</span>
                    ) : null}
                    {event.timestamp ? (
                      <span className="text-xs text-muted-foreground">{formatDate(event.timestamp)}</span>
                    ) : null}
                  </div>
                  {event.reason ? (
                    <p className="mt-0.5 ml-5.5 text-xs text-muted-foreground">{event.reason}</p>
                  ) : null}
                </div>
              </RevisionTimelineRow>
            );
          })}
        </div>
      ) : null}
    </div>
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
    <section className="space-y-4">
      {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}

      {resolvedRevisions.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-card px-5 py-8 text-center text-sm text-muted-foreground">
          표시할 리비전 이력이 없습니다.
        </div>
      ) : null}

      {resolvedRevisions.map((revision) => (
        <div key={revision.id} className="rounded-lg border bg-card p-5">
          <RevisionItem
            diffLoadingRevisionId={diffLoadingRevisionId}
            onOpenDiff={onOpenDiff}
            revision={revision}
          />
        </div>
      ))}
    </section>
  );
}
