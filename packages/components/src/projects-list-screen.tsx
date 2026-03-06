import type { ReactNode } from "react";
import { FolderKanban } from "lucide-react";
import { Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fabbit/ui";
import {
  ProjectListTable,
  type ProjectListTableItem,
  type ProjectListTableQueryState,
  type ProjectListTableSortKey,
} from "./project-list-table";

export interface ProjectsListScreenProps {
  createDialogContent?: ReactNode;
  isError: boolean;
  isLoading: boolean;
  pageSizeOptions?: readonly number[];
  projects: ProjectListTableItem[];
  queryState: ProjectListTableQueryState;
  totalCount: number;
  onCreateClick: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onQueryChange: (query: string) => void;
  onRetry: () => void;
  onRowClick: (projectId: string) => void;
  onSortChange: (sortKey: ProjectListTableSortKey) => void;
}

const defaultPageSizeOptions = [15, 30, 50] as const;

export function ProjectsListScreen({
  createDialogContent,
  isError,
  isLoading,
  pageSizeOptions = defaultPageSizeOptions,
  projects,
  queryState,
  totalCount,
  onCreateClick,
  onPageChange,
  onPageSizeChange,
  onQueryChange,
  onRetry,
  onRowClick,
  onSortChange,
}: ProjectsListScreenProps) {
  return (
    <div className="space-y-6">
      <section className="app-panel rounded-[32px] p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Badge variant="accent">Projects</Badge>
            <div className="mt-4 flex items-start gap-4">
              <div className="flex size-14 items-center justify-center rounded-[22px] bg-primary/10 text-primary">
                <FolderKanban className="size-7" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">프로젝트</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  프로젝트별로 부품을 그룹화하고 이후 변경관리, 담당자, 연관 데이터를 연결하는 기준점을 관리합니다.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-border/70 bg-muted/30 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Page Size</p>
              <div className="mt-2">
                <Select value={String(queryState.pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
                  <SelectTrigger className="w-[140px] bg-background">
                    <SelectValue placeholder="페이지 크기" />
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

            <div className="rounded-[24px] border border-border/70 bg-muted/30 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current Page</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{queryState.page}</p>
              <p className="mt-1 text-sm text-muted-foreground">{totalCount.toLocaleString()}개 항목</p>
            </div>
          </div>
        </div>
      </section>

      <ProjectListTable
        isError={isError}
        isLoading={isLoading}
        projects={projects}
        queryState={queryState}
        totalCount={totalCount}
        onCreateClick={onCreateClick}
        onPageChange={onPageChange}
        onQueryChange={onQueryChange}
        onRetry={onRetry}
        onRowClick={onRowClick}
        onSortChange={onSortChange}
      />

      {createDialogContent}
    </div>
  );
}
