import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@fabbit/ui";
import {
  ProjectListTable,
  type ProjectListTableItem,
  type ProjectListTableQueryState,
  type ProjectListTableSortKey,
} from "./project-list-table";

export interface ProjectListScreenProps {
  createDialogContent: ReactNode;
  isError: boolean;
  isLoading: boolean;
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

export function ProjectListScreen({
  createDialogContent,
  isError,
  isLoading,
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
}: ProjectListScreenProps) {
  return (
    <div className="min-h-full">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">프로젝트</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            프로젝트별로 부품을 그룹화하여 관리합니다
          </p>
        </div>
        <Button type="button" onClick={onCreateClick}>
          <Plus className="size-4" />
          새 프로젝트
        </Button>
      </div>

      <ProjectListTable
        isError={isError}
        isLoading={isLoading}
        projects={projects}
        queryState={queryState}
        totalCount={totalCount}
        onCreateClick={onCreateClick}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onQueryChange={onQueryChange}
        onRetry={onRetry}
        onRowClick={onRowClick}
        onSortChange={onSortChange}
      />

      {createDialogContent}
    </div>
  );
}
