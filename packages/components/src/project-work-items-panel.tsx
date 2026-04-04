import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileCheck,
  FilePen,
  FileX,
  Loader2,
  MessageSquare,
  Plus,
} from "lucide-react";
import { Button, LabelBadge, UserAvatar } from "@fabbit/ui";

export type ProjectWorkItemsPanelKind = "issue" | "change";

export interface ProjectWorkItemsPanelLabel {
  id: string;
  name: string;
  colorHex: string;
}

export interface ProjectWorkItemsPanelAssignee {
  id: string;
  name: string;
  profileImageUrl: string | null;
}

export interface ProjectWorkItemsPanelItem {
  id: string;
  number: number;
  title: string;
  status: string;
  author: string;
  createdAt: string;
  commentsCount: number;
  labels: ProjectWorkItemsPanelLabel[];
  assignees: ProjectWorkItemsPanelAssignee[];
}

export interface ProjectWorkItemsPanelProps {
  items: ProjectWorkItemsPanelItem[];
  kind: ProjectWorkItemsPanelKind;
  createLabel?: string;
  onCreateClick?: () => void;
  onItemClick: (itemId: string) => void;
  onRetry?: () => void;
  isError?: boolean;
  isLoading?: boolean;
}

function formatTimeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);

  if (minutes < 1) {
    return "방금";
  }

  if (minutes < 60) {
    return `${minutes}분 전`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}시간 전`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days}일 전`;
  }

  const date = new Date(iso);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function isOpenItem(kind: ProjectWorkItemsPanelKind, status: string) {
  const normalized = status.trim().toLowerCase();

  if (kind === "issue") {
    return normalized === "open" || normalized === "열림";
  }

  return normalized === "draft" || normalized === "open" || normalized === "submitted" || normalized === "초안";
}

function WorkItemStatus({
  kind,
  status,
}: {
  kind: ProjectWorkItemsPanelKind;
  status: string;
}) {
  const normalized = status.trim().toLowerCase();

  if (kind === "issue") {
    if (normalized === "closed" || normalized === "닫힘") {
      return (
        <span className="inline-flex items-center gap-1 text-purple-600">
          <CheckCircle2 className="size-4" />
          <span className="text-xs font-medium">닫힘</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-emerald-600">
        <AlertCircle className="size-4" />
        <span className="text-xs font-medium">열림</span>
      </span>
    );
  }

  if (normalized === "merged" || normalized === "반영") {
    return (
      <span className="inline-flex items-center gap-1 text-purple-600">
        <FileCheck className="size-4" />
        <span className="text-xs font-medium">반영</span>
      </span>
    );
  }

  if (normalized === "closed" || normalized === "닫힘") {
    return (
      <span className="inline-flex items-center gap-1 text-red-500">
        <FileX className="size-4" />
        <span className="text-xs font-medium">닫힘</span>
      </span>
    );
  }

  if (normalized === "draft" || normalized === "초안") {
    return (
      <span className="inline-flex items-center gap-1 text-gray-500">
        <FilePen className="size-4" />
        <span className="text-xs font-medium">초안</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-emerald-600">
      <FilePen className="size-4" />
      <span className="text-xs font-medium">제출</span>
    </span>
  );
}

export function ProjectWorkItemsPanel({
  createLabel,
  items,
  kind,
  onCreateClick,
  onItemClick,
  onRetry,
  isError = false,
  isLoading = false,
}: ProjectWorkItemsPanelProps) {
  const [statusFilter, setStatusFilter] = useState<"open" | "closed">("open");
  const openCount = useMemo(() => items.filter((item) => isOpenItem(kind, item.status)).length, [items, kind]);
  const closedCount = useMemo(() => items.filter((item) => !isOpenItem(kind, item.status)).length, [items, kind]);
  const filteredItems = useMemo(
    () => items.filter((item) => (statusFilter === "open" ? isOpenItem(kind, item.status) : !isOpenItem(kind, item.status))),
    [items, kind, statusFilter],
  );

  const emptyLabel =
    kind === "issue"
      ? statusFilter === "open"
        ? "열린 이슈가 없습니다"
        : "닫힌 이슈가 없습니다"
      : statusFilter === "open"
        ? "열린 변경관리가 없습니다"
        : "닫힌 변경관리가 없습니다";

  const EmptyIcon = kind === "issue" ? AlertCircle : FilePen;

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <div className="flex items-center gap-4">
          <button
            className={`inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium transition-colors ${
              statusFilter === "open" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            type="button"
            onClick={() => setStatusFilter("open")}
          >
            <AlertCircle className="size-4" />
            {openCount} 열림
          </button>
          <button
            className={`inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium transition-colors ${
              statusFilter === "closed" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            type="button"
            onClick={() => setStatusFilter("closed")}
          >
            <CheckCircle2 className="size-4" />
            {closedCount} 닫힘
          </button>
        </div>
        <div className="flex items-center gap-2">
          {createLabel && onCreateClick ? (
            <Button size="sm" type="button" onClick={onCreateClick}>
              <Plus className="size-3.5" />
              {createLabel}
            </Button>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : null}

      {isError && !isLoading ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            {kind === "issue" ? "이슈 목록을 불러오지 못했습니다." : "변경관리 목록을 불러오지 못했습니다."}
          </p>
          {onRetry ? (
            <Button size="sm" type="button" variant="outline" onClick={onRetry}>
              다시 시도
            </Button>
          ) : null}
        </div>
      ) : null}

      {!isLoading && !isError && filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <EmptyIcon className="size-8 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">{emptyLabel}</p>
        </div>
      ) : null}

      {!isLoading && !isError && filteredItems.length > 0 ? (
        <div className="divide-y">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              className="flex w-full cursor-pointer items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-muted/30"
              type="button"
              onClick={() => onItemClick(item.id)}
            >
              <div className="mt-0.5 w-14 shrink-0">
                <WorkItemStatus kind={kind} status={item.status} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{item.title}</span>
                  {item.labels.map((label) => (
                    <LabelBadge key={label.id} colorHex={label.colorHex} label={label.name} size="sm" />
                  ))}
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>#{item.number}</span>
                  <span>·</span>
                  <span>
                    {item.author} 님이 {formatTimeAgo(item.createdAt)} 생성했습니다
                  </span>
                  {item.assignees.length > 0 ? (
                    <>
                      <span>·</span>
                      <div className="flex -space-x-1">
                        {item.assignees.map((assignee) => (
                          <UserAvatar
                            key={assignee.id}
                            className="size-4 border border-background text-[8px]"
                            imageUrl={assignee.profileImageUrl}
                            name={assignee.name}
                          />
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>

              {item.commentsCount > 0 ? (
                <div className="mt-1 flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare className="size-3.5" />
                  {item.commentsCount}
                </div>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
