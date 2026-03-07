import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Loader2,
  Network,
  Search,
} from "lucide-react";
import {
  Button,
  ConfirmDialog,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fabbit/ui";

export type ProjectListTableSortKey = "name" | "part-count";
export type ProjectListTableSortDirection = "asc" | "desc";

export interface ProjectListTableItem {
  id: string;
  name: string;
  description: string | null;
  partCount: number;
  isArchived: boolean;
  updatedAt: string | null;
}

export interface ProjectListTableQueryState {
  query: string;
  page: number;
  pageSize: number;
  sortKey: ProjectListTableSortKey;
  sortDirection: ProjectListTableSortDirection;
}

export interface ProjectListTableProps {
  projects: ProjectListTableItem[];
  totalCount: number;
  isLoading: boolean;
  isError: boolean;
  queryState: ProjectListTableQueryState;
  onQueryChange: (query: string) => void;
  onSortChange: (sortKey: ProjectListTableSortKey) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRetry: () => void;
  onRowClick: (projectId: string) => void;
  onCreateClick: () => void;
}

interface SortableHeaderProps {
  column: ProjectListTableSortKey;
  label: string;
  activeSortKey: ProjectListTableSortKey;
  activeSortDirection: ProjectListTableSortDirection;
  onSort: (sortKey: ProjectListTableSortKey) => void;
}

const pageSizeOptions = [15, 30, 50] as const;

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) {
    pages.push("...");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (current < total - 2) {
    pages.push("...");
  }

  pages.push(total);
  return pages;
}

function SortableHeader({
  column,
  label,
  activeSortKey,
  activeSortDirection,
  onSort,
}: SortableHeaderProps) {
  const isActive = activeSortKey === column;
  const Icon = isActive
    ? activeSortDirection === "asc"
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;

  return (
    <th className="px-2 py-3 pl-4 text-left">
      <button
        className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
        type="button"
        onClick={() => onSort(column)}
      >
        <span>{label}</span>
        <Icon className={`h-3.5 w-3.5 ${isActive ? "text-primary" : "text-muted-foreground/65"}`} />
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
  onPageSizeChange,
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
  const safePage = Math.min(queryState.page, totalPages);
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * queryState.pageSize + 1;
  const rangeEnd = Math.min(totalCount, safePage * queryState.pageSize);

  return (
    <section className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="프로젝트 검색..."
          value={queryState.query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>

      <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : null}

        {isError && !isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-sm text-muted-foreground">프로젝트 목록을 불러오지 못했습니다.</p>
            <Button type="button" variant="outline" onClick={onRetry}>
              다시 시도
            </Button>
          </div>
        ) : null}

        {!isLoading && !isError && totalCount === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <FolderKanban className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {queryState.query ? "검색 결과가 없습니다" : "아직 프로젝트가 없습니다"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {queryState.query
                  ? "다른 검색어를 입력해 보세요"
                  : "새 프로젝트를 만들어 부품을 관리해 보세요"}
              </p>
            </div>
            {!queryState.query ? (
              <Button size="sm" type="button" onClick={onCreateClick}>
                새 프로젝트
              </Button>
            ) : null}
          </div>
        ) : null}

        {!isLoading && !isError && totalCount > 0 ? (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-sm">
                <colgroup>
                  <col />
                  <col style={{ width: "55%" }} />
                  <col style={{ width: "80px" }} />
                </colgroup>
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <SortableHeader
                      activeSortDirection={queryState.sortDirection}
                      activeSortKey={queryState.sortKey}
                      column="name"
                      label="이름"
                      onSort={onSortChange}
                    />
                    <th className="px-2 py-3 pl-4 text-left text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      설명
                    </th>
                    <SortableHeader
                      activeSortDirection={queryState.sortDirection}
                      activeSortKey={queryState.sortKey}
                      column="part-count"
                      label="부품"
                      onSort={onSortChange}
                    />
                  </tr>
                </thead>
                <tbody>
                  {sortedProjects.map((project) => (
                    <tr
                      key={project.id}
                      className="group h-[45px] cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/50"
                      onClick={() => onRowClick(project.id)}
                    >
                      <td className="py-2 pl-4 pr-2 font-medium text-foreground">{project.name}</td>
                      <td className="py-2 pl-4 pr-2 text-muted-foreground">
                        {project.description ? (
                          <span className="line-clamp-1">{project.description}</span>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                      <td className="py-2 pl-4 pr-2 text-muted-foreground">
                        {project.partCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                            <Network className="h-3.5 w-3.5" />
                            {project.partCount}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Select value={String(queryState.pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
                  <SelectTrigger className="h-8 w-[80px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((option) => (
                      <SelectItem key={option} value={String(option)}>
                        {option}개씩
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground">
                  {rangeStart.toLocaleString()}-{rangeEnd.toLocaleString()} / {totalCount.toLocaleString()}건
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  disabled={safePage <= 1}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                  onClick={() => onPageChange(Math.max(1, safePage - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {getPageNumbers(safePage, totalPages).map((page, index) =>
                  page === "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground"
                    >
                      ...
                    </span>
                  ) : (
                    <Button
                      key={page}
                      className="text-xs"
                      size="icon-sm"
                      type="button"
                      variant={page === safePage ? "default" : "ghost"}
                      onClick={() => onPageChange(page)}
                    >
                      {page}
                    </Button>
                  ),
                )}
                <Button
                  disabled={safePage >= totalPages}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                  onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {!isLoading && !isError && totalCount === 0 && queryState.query ? (
        <div className="flex justify-end">
          <Button type="button" variant="ghost" onClick={() => setIsLeaveDialogOpen(true)}>
            검색어 초기화
          </Button>
        </div>
      ) : null}

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
    </section>
  );
}
