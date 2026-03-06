import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  FileCheck2,
  GitPullRequestArrow,
  Loader2,
  MessageSquare,
  Plus,
  Search,
} from "lucide-react";
import {
  Badge,
  Button,
  Input,
  LabelBadge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  UserAvatar,
} from "@fabbit/ui";
import { useChangeRequestListQuery } from "@/features/change-management/hooks/use-change-request-list-query";
import { useIssueListQuery } from "@/features/change-management/hooks/use-issue-list-query";
import type {
  ChangeManagementItemModel,
  ChangeManagementQueryState,
  ChangeManagementState,
  ChangeManagementView,
} from "@/features/change-management/types/change-management-model";

interface ChangeManagementScreenProps {
  queryState: ChangeManagementQueryState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onQueryChange: (query: string) => void;
  onStateChange: (state: ChangeManagementState) => void;
  onViewChange: (view: ChangeManagementView) => void;
}

const pageSizeOptions = [20, 40, 80] as const;

function getItemStatusLabel(item: ChangeManagementItemModel) {
  if (item.kind === "issues") {
    return item.state === "CLOSED" ? "닫힘" : "열림";
  }

  const statusLabelMap: Record<string, string> = {
    DRAFT: "초안",
    SUBMITTED: "제출됨",
    MERGED: "반영됨",
    CLOSED: "닫힘",
  };

  return statusLabelMap[item.crState ?? ""] ?? item.crState ?? item.state;
}

function getItemStatusVariant(item: ChangeManagementItemModel) {
  if (item.kind === "issues") {
    return item.state === "CLOSED" ? "neutral" : "accent";
  }

  if (item.crState === "MERGED") {
    return "success";
  }

  if (item.crState === "CLOSED") {
    return "neutral";
  }

  return "accent";
}

export function ChangeManagementScreen({
  queryState,
  onPageChange,
  onPageSizeChange,
  onQueryChange,
  onStateChange,
  onViewChange,
}: ChangeManagementScreenProps) {
  const navigate = useNavigate();
  const issuesQuery = useIssueListQuery(
    {
      search: queryState.query || undefined,
      state: queryState.state.toUpperCase(),
      offset: (queryState.page - 1) * queryState.pageSize,
      limit: queryState.pageSize,
    },
    queryState.view === "issues",
  );
  const requestsQuery = useChangeRequestListQuery(
    {
      search: queryState.query || undefined,
      state: queryState.state.toUpperCase(),
      offset: (queryState.page - 1) * queryState.pageSize,
      limit: queryState.pageSize,
    },
    queryState.view === "requests",
  );

  const activeQuery = queryState.view === "issues" ? issuesQuery : requestsQuery;
  const listData = activeQuery.data;
  const totalPages = Math.max(1, Math.ceil((listData?.total ?? 0) / queryState.pageSize));

  return (
    <div className="space-y-6">
      <section className="app-panel rounded-[32px] p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Badge variant="accent">Changes</Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">변경 관리</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              이슈와 변경 요청을 한 곳에서 조회하고, 상태에 따라 생성과 상세 검토로 이어집니다.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-border/70 bg-muted/30 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current View</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                {queryState.view === "issues" ? "Issues" : "Requests"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{listData?.total.toLocaleString() ?? 0}개 항목</p>
            </div>

            <div className="rounded-[24px] border border-border/70 bg-muted/30 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Page Size</p>
              <div className="mt-3">
                <Select value={String(queryState.pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
                  <SelectTrigger className="w-[140px] bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((option) => (
                      <SelectItem key={option} value={String(option)}>
                        {option}개씩 보기
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={queryState.view === "issues" ? "default" : "outline"}
          onClick={() => onViewChange("issues")}
        >
          <AlertCircle className="size-4" />
          이슈
        </Button>
        <Button
          type="button"
          variant={queryState.view === "requests" ? "default" : "outline"}
          onClick={() => onViewChange("requests")}
        >
          <GitPullRequestArrow className="size-4" />
          변경 요청
        </Button>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder={queryState.view === "issues" ? "이슈 제목으로 검색" : "변경 요청 제목으로 검색"}
              value={queryState.query}
              onChange={(event) => onQueryChange(event.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={queryState.state === "open" ? "default" : "outline"}
              onClick={() => onStateChange("open")}
            >
              <AlertCircle className="size-4" />
              열림 {listData?.openCount ?? 0}
            </Button>
            <Button
              type="button"
              variant={queryState.state === "closed" ? "default" : "outline"}
              onClick={() => onStateChange("closed")}
            >
              <CheckCircle2 className="size-4" />
              닫힘 {listData?.closedCount ?? 0}
            </Button>
            <Button
              type="button"
              onClick={() =>
                navigate(queryState.view === "issues" ? "/changes/issues/new" : "/changes/requests/new")
              }
            >
              <Plus className="size-4" />
              {queryState.view === "issues" ? "새 이슈" : "새 변경 요청"}
            </Button>
          </div>
        </div>

        <section className="app-panel overflow-hidden rounded-[32px]">
          <div className="border-b border-border/70 px-5 py-4">
            <p className="text-sm font-medium text-foreground">
              {queryState.view === "issues" ? "이슈 레지스트리" : "변경 요청 레지스트리"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              현재 상태와 담당자, 라벨, 댓글 수를 한 번에 확인합니다.
            </p>
          </div>

          {activeQuery.isLoading ? (
            <div className="flex h-72 items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : null}

          {!activeQuery.isLoading && (listData?.items.length ?? 0) === 0 ? (
            <div className="flex h-72 flex-col items-center justify-center gap-3 px-6 text-center">
              <FileCheck2 className="size-8 text-muted-foreground/40" />
              <p className="text-base font-medium text-foreground">
                {queryState.query ? "검색 결과가 없습니다." : "표시할 항목이 없습니다."}
              </p>
              <p className="max-w-md text-sm leading-6 text-muted-foreground">
                검색 조건이나 상태 필터를 조정하거나 새 항목을 생성해 주세요.
              </p>
            </div>
          ) : null}

          {!activeQuery.isLoading ? (
            <div className="divide-y divide-border/60">
              {listData?.items.map((item) => (
                <button
                  key={item.id}
                  className="flex w-full cursor-pointer flex-col gap-3 px-5 py-4 text-left transition-colors hover:bg-primary/5"
                  type="button"
                  onClick={() =>
                    navigate(item.kind === "issues" ? `/changes/issues/${item.number}` : `/changes/requests/${item.number}`)
                  }
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={getItemStatusVariant(item)}>{getItemStatusLabel(item)}</Badge>
                        <span className="text-sm text-muted-foreground">#{item.number}</span>
                        {item.labels.slice(0, 3).map((label) => (
                          <LabelBadge key={label.id} colorHex={label.color} label={label.name} size="sm" />
                        ))}
                      </div>
                      <p className="mt-3 text-base font-medium text-foreground">{item.title}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {item.createdBy ? `${item.createdBy} 님이 생성` : "작성자 정보 없음"} ·{" "}
                        {new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(new Date(item.updatedAt))}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {item.assignees.length > 0 ? (
                        <div className="flex -space-x-2">
                          {item.assignees.slice(0, 3).map((assignee) => (
                            <UserAvatar
                              key={assignee.userId}
                              imageUrl={assignee.profileImageUrl}
                              name={assignee.fullName}
                            />
                          ))}
                        </div>
                      ) : (
                        <span>담당자 없음</span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="size-4" />
                        {item.commentsCount}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : null}

          <div className="flex items-center justify-between border-t border-border/70 px-5 py-4">
            <p className="text-sm text-muted-foreground">
              {queryState.page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <Button disabled={queryState.page <= 1} type="button" variant="outline" onClick={() => onPageChange(queryState.page - 1)}>
                이전
              </Button>
              <Button
                disabled={queryState.page >= totalPages}
                type="button"
                variant="outline"
                onClick={() => onPageChange(queryState.page + 1)}
              >
                다음
              </Button>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
