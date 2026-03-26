import {
  AlertCircle,
  CheckCircle2,
  FilePen,
  HelpCircle,
  Loader,
  MessageSquare,
  Plus,
} from "lucide-react";
import { Button, LabelBadge, UserAvatar } from "@fabbit/ui";
import {
  getEngineeringChangeStatusConfig,
  getIssueStatusConfig,
} from "./work-item-status";

export type ChangeManagementScreenView = "issues" | "engineering-changes";
export type ChangeManagementScreenState = "open" | "in_progress" | "done";

export interface ChangeManagementScreenLabel {
  id: string;
  name: string;
  color: string;
}

export interface ChangeManagementScreenUser {
  userId: string;
  fullName: string;
  profileImageUrl: string | null;
}

export interface ChangeManagementScreenItem {
  id: string;
  number: number;
  kind: ChangeManagementScreenView;
  title: string;
  state: string;
  engineeringChangeState: string | null;
  createdAt?: string;
  createdBy: string | null;
  updatedAt: string;
  labels: ChangeManagementScreenLabel[];
  assignees: ChangeManagementScreenUser[];
  commentsCount: number;
}

export interface ChangeManagementScreenListData {
  openCount: number;
  inProgressCount: number;
  doneCount: number;
  total: number;
  items: ChangeManagementScreenItem[];
}

export interface ChangeManagementScreenQueryState {
  query: string;
  page: number;
  pageSize: number;
  state: ChangeManagementScreenState;
  view: ChangeManagementScreenView;
}

export interface ChangeManagementScreenProps {
  isError?: boolean;
  isLoading?: boolean;
  listData?: ChangeManagementScreenListData | null;
  queryState: ChangeManagementScreenQueryState;
  onCreateClick: () => void;
  onItemClick: (item: ChangeManagementScreenItem) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onQueryChange: (query: string) => void;
  onRetry?: () => void;
  onStateChange: (state: ChangeManagementScreenState) => void;
  onViewChange: (view: ChangeManagementScreenView) => void;
}

function formatShortDate(dateString: string) {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);

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

  return formatShortDate(iso);
}

function getStatusConfig(item: ChangeManagementScreenItem) {
  return item.kind === "engineering-changes"
    ? getEngineeringChangeStatusConfig(item.engineeringChangeState ?? item.state)
    : getIssueStatusConfig(item.state);
}

export function ChangeManagementScreen({
  isError = false,
  isLoading = false,
  listData,
  queryState,
  onCreateClick,
  onItemClick,
  onPageChange,
  onRetry,
  onStateChange,
  onViewChange,
}: ChangeManagementScreenProps) {
  const totalCount = listData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / queryState.pageSize));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">변경 관리</h1>
        <button
          className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
          title="내가 담당자, 검토자, 생성자인 항목만 표시됩니다"
          type="button"
        >
          <HelpCircle className="size-5" />
        </button>
      </div>

      <div className="flex gap-4 border-b">
        <button
          className={`relative px-1 pb-2 text-sm font-medium transition-colors ${
            queryState.view === "issues" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
          type="button"
          onClick={() => onViewChange("issues")}
        >
          이슈
          {queryState.view === "issues" ? (
            <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-foreground" />
          ) : null}
        </button>
        <button
          className={`relative px-1 pb-2 text-sm font-medium transition-colors ${
            queryState.view === "engineering-changes" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
          type="button"
          onClick={() => onViewChange("engineering-changes")}
        >
          변경관리
          {queryState.view === "engineering-changes" ? (
            <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-foreground" />
          ) : null}
        </button>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-4">
            <button
              className={`inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium transition-colors ${
                queryState.state === "open" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              type="button"
              onClick={() => onStateChange("open")}
            >
              <AlertCircle className="size-4" />
              {listData?.openCount ?? 0} 열림
            </button>
            {queryState.view === "engineering-changes" ? (
              <button
                className={`inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium transition-colors ${
                  queryState.state === "in_progress" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                type="button"
                onClick={() => onStateChange("in_progress")}
              >
                <Loader className="size-4" />
                {listData?.inProgressCount ?? 0} 진행중
              </button>
            ) : null}
            <button
              className={`inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium transition-colors ${
                queryState.state === "done" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              type="button"
              onClick={() => onStateChange("done")}
            >
              <CheckCircle2 className="size-4" />
              {listData?.doneCount ?? 0} {queryState.view === "engineering-changes" ? "완료" : "닫힘"}
            </button>
          </div>
          <Button size="sm" type="button" onClick={onCreateClick}>
            <Plus className="size-3.5" />
            {queryState.view === "issues" ? "새 이슈" : "새 변경관리"}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
            목록을 불러오는 중입니다.
          </div>
        ) : null}

        {isError && !isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-sm text-muted-foreground">목록을 불러오지 못했습니다.</p>
            {onRetry ? (
              <Button size="sm" type="button" variant="outline" onClick={onRetry}>
                다시 시도
              </Button>
            ) : null}
          </div>
        ) : null}

        {!isLoading && !isError && totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            {queryState.view === "issues" ? (
              <AlertCircle className="size-8 text-muted-foreground/30" />
            ) : (
              <FilePen className="size-8 text-muted-foreground/30" />
            )}
            <p className="mt-3 text-sm text-muted-foreground">
              {queryState.view === "issues"
                ? queryState.state === "open"
                  ? "열린 이슈가 없습니다"
                  : "닫힌 이슈가 없습니다"
                : queryState.state === "open"
                  ? "열린 변경관리가 없습니다"
                  : "닫힌 변경관리가 없습니다"}
            </p>
          </div>
        ) : null}

        {!isLoading && !isError && totalCount > 0 ? (
          <div className="divide-y">
            {listData?.items.map((item) => {
              const status = getStatusConfig(item);
              const StatusIcon = status.icon;
              const createdAt = item.createdAt ?? item.updatedAt;

              return (
                <button
                  key={item.id}
                  className="flex w-full cursor-pointer items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-muted/30"
                  type="button"
                  onClick={() => onItemClick(item)}
                >
                  <div className="mt-0.5 w-14 shrink-0">
                    <span className={`inline-flex items-center gap-1 ${status.toneClassName}`}>
                      <StatusIcon className="size-4" />
                      <span className="text-xs font-medium">{status.label}</span>
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{item.title}</span>
                      {item.labels.map((label) => (
                        <LabelBadge key={label.id} colorHex={label.color} label={label.name} size="sm" />
                      ))}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>#{item.number}</span>
                      <span>·</span>
                      <span>
                        {item.createdBy ? `${item.createdBy} 님이 ${timeAgo(createdAt)} 생성했습니다` : `${timeAgo(createdAt)} 업데이트`}
                      </span>
                      {item.assignees.length > 0 ? (
                        <>
                          <span>·</span>
                          <div className="flex -space-x-1">
                            {item.assignees.map((assignee) => (
                              <UserAvatar
                                key={assignee.userId}
                                className="size-4 border border-background text-[8px]"
                                imageUrl={assignee.profileImageUrl}
                                name={assignee.fullName}
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
              );
            })}
          </div>
        ) : null}

        {!isLoading && !isError && totalPages > 1 ? (
          <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-3">
            <span className="text-xs text-muted-foreground">
              {queryState.page} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                disabled={queryState.page <= 1}
                size="sm"
                type="button"
                variant="ghost"
                onClick={() => onPageChange(queryState.page - 1)}
              >
                이전
              </Button>
              <Button
                disabled={queryState.page >= totalPages}
                size="sm"
                type="button"
                variant="ghost"
                onClick={() => onPageChange(queryState.page + 1)}
              >
                다음
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
