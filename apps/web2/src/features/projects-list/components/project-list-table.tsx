import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Loader2,
  Search,
} from "lucide-react";
import { Badge, Button, ConfirmDialog, Input } from "@fabbit/ui";
import type {
  ProjectListItemModel,
  ProjectListQueryState,
  ProjectListSortDirection,
  ProjectListSortKey,
} from "@/features/projects-list/types/project-list-model";

interface ProjectListTableProps {
  projects: ProjectListItemModel[];
  totalCount: number;
  isLoading: boolean;
  isError: boolean;
  queryState: ProjectListQueryState;
  onQueryChange: (query: string) => void;
  onSortChange: (sortKey: ProjectListSortKey) => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onRowClick: (projectId: string) => void;
  onCreateClick: () => void;
}

function SortableHeader({
  column,
  label,
  activeSortKey,
  activeSortDirection,
  onSort,
}: {
  column: ProjectListSortKey;
  label: string;
  activeSortKey: ProjectListSortKey;
  activeSortDirection: ProjectListSortDirection;
  onSort: (sortKey: ProjectListSortKey) => void;
}) {
  const isActive = activeSortKey === column;
  const Icon = isActive
    ? activeSortDirection === "asc"
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;

  return (
    <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
      <button
        className="inline-flex cursor-pointer items-center gap-1.5 transition-colors hover:text-foreground"
        type="button"
        onClick={() => onSort(column)}
      >
        <span>{label}</span>
        <Icon className={`size-3.5 ${isActive ? "text-primary" : "text-muted-foreground/65"}`} />
      </button>
    </th>
  );
}

export function ProjectListTable({
  projects,
  totalCount,
  isLoading,
  isError,
  queryState,
  onQueryChange,
  onSortChange,
  onPageChange,
  onRetry,
  onRowClick,
  onCreateClick,
}: ProjectListTableProps) {
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  const sortedProjects = useMemo(() => {
    const collator = new Intl.Collator("ko");

    return [...projects].sort((left, right) => {
      if (queryState.sortKey === "name") {
        const compareResult = collator.compare(left.name, right.name);
        return queryState.sortDirection === "asc" ? compareResult : -compareResult;
      }

      const compareResult = left.partCount - right.partCount;
      return queryState.sortDirection === "asc" ? compareResult : -compareResult;
    });
  }, [projects, queryState.sortDirection, queryState.sortKey]);

  const totalPages = Math.max(1, Math.ceil(totalCount / queryState.pageSize));
  const rangeStart = totalCount === 0 ? 0 : (queryState.page - 1) * queryState.pageSize + 1;
  const rangeEnd = Math.min(totalCount, queryState.page * queryState.pageSize);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="프로젝트 이름으로 검색"
            value={queryState.query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">{`${totalCount.toLocaleString()}개 프로젝트`}</Badge>
          <Button type="button" onClick={onCreateClick}>
            프로젝트 생성
          </Button>
        </div>
      </div>

      <section className="app-panel overflow-hidden rounded-[32px]">
        <div className="border-b border-border/70 px-5 py-4">
          <p className="text-sm font-medium text-foreground">프로젝트 레지스트리</p>
          <p className="mt-1 text-sm text-muted-foreground">검색, 정렬, 페이지 이동을 URL 상태로 관리합니다.</p>
        </div>

        {isLoading ? (
          <div className="flex h-72 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : null}

        {isError && !isLoading ? (
          <div className="flex h-72 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-base font-medium text-foreground">프로젝트 목록을 불러오지 못했습니다.</p>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              네트워크 상태를 확인한 뒤 다시 시도해 주세요.
            </p>
            <Button type="button" variant="outline" onClick={onRetry}>
              다시 시도
            </Button>
          </div>
        ) : null}

        {!isLoading && !isError && totalCount === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FolderKanban className="size-6" />
            </div>
            <div>
              <p className="text-base font-medium text-foreground">
                {queryState.query ? "검색 결과가 없습니다." : "프로젝트가 아직 없습니다."}
              </p>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {queryState.query
                  ? "검색어를 조정하거나 새 프로젝트를 생성해 보세요."
                  : "첫 프로젝트를 만들어 부품과 변경 흐름을 묶어 관리하세요."}
              </p>
            </div>
            <Button type="button" onClick={onCreateClick}>
              프로젝트 생성
            </Button>
          </div>
        ) : null}

        {!isLoading && !isError && totalCount > 0 ? (
          <div>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/25">
                    <SortableHeader
                      activeSortDirection={queryState.sortDirection}
                      activeSortKey={queryState.sortKey}
                      column="name"
                      label="이름"
                      onSort={onSortChange}
                    />
                    <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      설명
                    </th>
                    <SortableHeader
                      activeSortDirection={queryState.sortDirection}
                      activeSortKey={queryState.sortKey}
                      column="part-count"
                      label="부품 수"
                      onSort={onSortChange}
                    />
                    <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      상태
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProjects.map((project) => (
                    <tr key={project.id} className="border-b border-border/60 last:border-b-0">
                      <td className="px-4 py-3">
                        <button
                          className="group flex w-full cursor-pointer flex-col rounded-2xl px-1 py-2 text-left transition-colors hover:bg-primary/5"
                          type="button"
                          onClick={() => onRowClick(project.id)}
                        >
                          <span className="font-medium text-foreground transition-colors group-hover:text-primary">
                            {project.name}
                          </span>
                          <span className="mt-1 text-xs text-muted-foreground">
                            {project.updatedAt
                              ? `업데이트 ${new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(new Date(project.updatedAt))}`
                              : "업데이트 일시 정보 없음"}
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm leading-6 text-muted-foreground">
                        {project.description || "설명이 없습니다."}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {project.partCount.toLocaleString()}개
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={project.isArchived ? "outline" : "accent"}>
                          {project.isArchived ? "보관됨" : "운영 중"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-border/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {rangeStart.toLocaleString()} - {rangeEnd.toLocaleString()} / {totalCount.toLocaleString()}
              </p>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Button
                  disabled={queryState.page <= 1}
                  type="button"
                  variant="outline"
                  onClick={() => onPageChange(queryState.page - 1)}
                >
                  <ChevronLeft className="size-4" />
                  이전
                </Button>
                <div className="min-w-20 text-center text-sm font-medium text-foreground">
                  {queryState.page} / {totalPages}
                </div>
                <Button
                  disabled={queryState.page >= totalPages}
                  type="button"
                  variant="outline"
                  onClick={() => onPageChange(queryState.page + 1)}
                >
                  다음
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <ConfirmDialog
        cancelLabel="계속 검색"
        confirmLabel="검색어 비우기"
        description="프로젝트가 보이지 않는다면 검색어를 초기화하고 전체 목록으로 돌아갈 수 있습니다."
        open={isLeaveDialogOpen}
        title="검색어를 초기화할까요?"
        variant="default"
        onCancel={() => setIsLeaveDialogOpen(false)}
        onConfirm={() => onQueryChange("")}
        onOpenChange={setIsLeaveDialogOpen}
      />

      {!isLoading && !isError && totalCount === 0 && queryState.query ? (
        <div className="flex justify-end">
          <Button type="button" variant="ghost" onClick={() => setIsLeaveDialogOpen(true)}>
            검색어 초기화
          </Button>
        </div>
      ) : null}
    </section>
  );
}
