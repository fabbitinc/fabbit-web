import { useState } from "react";
import {
  GitCommitHorizontal,
  Settings,
  Network,
  FileText,
  Paperclip,
  Shield,
  ChevronDown,
  ChevronRight,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PartHistoryEntry, HistoryEntryType, ChangeDetail } from "./types";

// --- 타입별 아이콘 매핑 ---

const ENTRY_CONFIG: Record<
  HistoryEntryType,
  { icon: React.ElementType; label: string }
> = {
  revision: { icon: GitCommitHorizontal, label: "리비전" },
  property_change: { icon: Settings, label: "속성 변경" },
  bom_change: { icon: Network, label: "BOM 변경" },
  drawing_change: { icon: FileText, label: "도면 변경" },
  attachment_change: { icon: Paperclip, label: "첨부 변경" },
  lifecycle_change: { icon: Shield, label: "상태 변경" },
};

// --- 날짜 포맷 ---

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }) +
    " " +
    d.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  );
}

// --- 변경 상세 ---

function ChangeDetailsTable({ details }: { details: ChangeDetail[] }) {
  return (
    <div className="mt-2.5 space-y-1.5">
      {details.map((d) => (
        <div
          key={d.field}
          className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-1.5 text-xs"
        >
          <span className="shrink-0 text-muted-foreground">{d.label}</span>
          <span className="text-muted-foreground/50">
            {d.old_value ?? "—"}
          </span>
          <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground/40" />
          <span className="font-medium text-foreground">
            {d.new_value ?? "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

// --- 타임라인 항목 ---

// 노드 폭 상수 (라인 정렬용)
const NODE_CENTER = 14; // 28px(h-7) / 2 = 중심점

function RevisionItem({
  entry,
  isLatestRevision,
}: {
  entry: PartHistoryEntry;
  isLatestRevision: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = entry.details != null && entry.details.length > 0;

  return (
    <div className="relative flex gap-4 py-3">
      {/* 노드 */}
      <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
        <GitCommitHorizontal className="h-3.5 w-3.5" />
      </div>

      {/* 콘텐츠 */}
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-foreground">
            Rev.{entry.revision}
          </span>
          {isLatestRevision && (
            <Badge
              variant="secondary"
              className="h-5 px-1.5 text-[10px] font-medium"
            >
              현재
            </Badge>
          )}
          {entry.previous_revision && (
            <span className="text-[11px] text-muted-foreground">
              ← Rev.{entry.previous_revision}
            </span>
          )}
        </div>

        {/* 요약 — 클릭으로 상세 토글 */}
        <button
          type="button"
          onClick={hasDetails ? () => setExpanded(!expanded) : undefined}
          className={`mt-0.5 flex items-center gap-1 text-left text-sm text-foreground/80 ${
            hasDetails ? "cursor-pointer hover:text-foreground" : "cursor-default"
          }`}
        >
          {hasDetails &&
            (expanded ? (
              <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
            ))}
          <span>{entry.summary}</span>
        </button>

        {/* 메타 */}
        <p className="mt-1 text-[11px] text-muted-foreground">
          {entry.user_name} · {formatDateTime(entry.created_at)}
        </p>

        {/* 상세 */}
        {expanded && hasDetails && (
          <ChangeDetailsTable details={entry.details!} />
        )}
      </div>
    </div>
  );
}

function AuditItem({ entry }: { entry: PartHistoryEntry }) {
  const [expanded, setExpanded] = useState(false);
  const config = ENTRY_CONFIG[entry.type];
  const Icon = config.icon;
  const hasDetails = entry.details != null && entry.details.length > 0;

  return (
    <div className="relative flex gap-4 py-2.5">
      {/* 노드 — 작은 원, 라인 중심에 정렬 */}
      <div
        className="relative z-10 flex shrink-0 items-center justify-center"
        style={{ width: 28 }} // h-7과 같은 폭으로 수평 정렬
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background">
          <Icon className="h-2.5 w-2.5 text-muted-foreground" />
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          {/* 요약 — 클릭으로 상세 토글 */}
          <button
            type="button"
            onClick={hasDetails ? () => setExpanded(!expanded) : undefined}
            className={`flex items-center gap-1 text-left text-sm text-foreground/80 ${
              hasDetails ? "cursor-pointer hover:text-foreground" : "cursor-default"
            }`}
          >
            {hasDetails &&
              (expanded ? (
                <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
              ))}
            <span>{entry.summary}</span>
          </button>
          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {config.label}
          </span>
        </div>

        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {entry.user_name} · {formatDateTime(entry.created_at)}
        </p>

        {/* 상세 */}
        {expanded && hasDetails && (
          <ChangeDetailsTable details={entry.details!} />
        )}
      </div>
    </div>
  );
}

// --- 필터 타입 ---

type FilterMode = "all" | "revision";

// --- 메인 컴포넌트 ---

export function HistoryTimeline({
  entries,
}: {
  entries: PartHistoryEntry[];
}) {
  const [filter, setFilter] = useState<FilterMode>("all");

  const filtered =
    filter === "revision"
      ? entries.filter((e) => e.type === "revision")
      : entries;

  // 최신 리비전 ID 찾기
  const latestRevisionId = entries.find((e) => e.type === "revision")?.id;

  const filters: { key: FilterMode; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "revision", label: "리비전만" },
  ];

  return (
    <div>
      {/* 필터 세그먼트 */}
      <div className="mb-5 flex w-fit gap-1 rounded-lg bg-muted/50 p-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 타임라인 */}
      {filtered.length === 0 ? (
        <div className="flex items-center gap-3 rounded-lg border border-dashed px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
            <Clock className="h-4 w-4 text-muted-foreground/30" />
          </div>
          <p className="text-sm text-muted-foreground/50">이력이 없습니다</p>
        </div>
      ) : (
        <div className="relative">
          {/* 연속 세로 라인 — 첫 번째 노드 중심부터 마지막 노드 중심까지 */}
          <div
            className="absolute w-px bg-border"
            style={{
              left: NODE_CENTER,
              top: 12 + NODE_CENTER, // 첫 아이템의 py-3(12px) + 노드 중심
              bottom: 10 + NODE_CENTER, // 마지막 아이템의 py(10px) + 노드 중심
            }}
          />

          {filtered.map((entry) =>
            entry.type === "revision" ? (
              <RevisionItem
                key={entry.id}
                entry={entry}
                isLatestRevision={entry.id === latestRevisionId}
              />
            ) : (
              <AuditItem key={entry.id} entry={entry} />
            ),
          )}
        </div>
      )}
    </div>
  );
}
