import type { ReactNode } from "react";
import { ProjectListScreen, type ProjectListScreenProps } from "./project-list-screen";

export interface ProjectsListScreenProps {
  createDialogContent?: ReactNode;
  isError: boolean;
  isLoading: boolean;
  pageSizeOptions?: readonly number[];
  projects: ProjectListScreenProps["projects"];
  queryState: ProjectListScreenProps["queryState"];
  totalCount: number;
  onCreateClick: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onQueryChange: (query: string) => void;
  onRetry: () => void;
  onRowClick: (projectId: string) => void;
  onSortChange: ProjectListScreenProps["onSortChange"];
}

export function ProjectsListScreen({
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
}: ProjectsListScreenProps) {
  return (
    <ProjectListScreen
      createDialogContent={createDialogContent ?? null}
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
  );
}
