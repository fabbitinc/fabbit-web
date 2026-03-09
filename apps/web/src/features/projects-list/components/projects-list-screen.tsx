import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ProjectListScreen as ProjectListScreenView } from "@fabbit/components";
import { CreateProjectDialog } from "@/features/projects-list/components/create-project-dialog";
import { useCreateProjectAction } from "@/features/projects-list/hooks/use-create-project-action";
import { useProjectListQuery } from "@/features/projects-list/hooks/use-project-list-query";
import { useProjectsListStore } from "@/features/projects-list/stores/projects-list-store";
import type { ProjectListQueryState, ProjectListSortKey } from "@/features/projects-list/types/project-list-model";

interface ProjectsListScreenProps {
  queryState: ProjectListQueryState;
  onQueryChange: (query: string) => void;
  onSortChange: (sortKey: ProjectListSortKey) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}
export function ProjectsListScreen({
  queryState,
  onQueryChange,
  onSortChange,
  onPageChange,
  onPageSizeChange,
}: ProjectsListScreenProps) {
  const navigate = useNavigate();
  const openCreateDialog = useProjectsListStore((state) => state.openCreateDialog);
  const projectsQuery = useProjectListQuery({
    search: queryState.query || undefined,
    offset: (queryState.page - 1) * queryState.pageSize,
    limit: queryState.pageSize,
  });
  const createProjectAction = useCreateProjectAction();

  const normalizedProjects = useMemo(() => {
    const projects = projectsQuery.data?.items ?? [];
    const totalCount = projectsQuery.data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / queryState.pageSize));

    return {
      projects,
      totalCount,
      totalPages,
    };
  }, [projectsQuery.data, queryState.pageSize]);

  const safePage = Math.min(queryState.page, normalizedProjects.totalPages);

  useEffect(() => {
    if (!projectsQuery.isSuccess) {
      return;
    }

    if (queryState.page > normalizedProjects.totalPages) {
      onPageChange(normalizedProjects.totalPages);
    }
  }, [normalizedProjects.totalPages, onPageChange, projectsQuery.isSuccess, queryState.page]);

  return (
    <ProjectListScreenView
      createDialogContent={(
        <CreateProjectDialog
          isPending={createProjectAction.isPending}
          onSubmit={(input) => createProjectAction.mutate(input)}
        />
      )}
      isError={projectsQuery.isError}
      isLoading={projectsQuery.isLoading}
      projects={normalizedProjects.projects}
        queryState={{
          ...queryState,
        page: safePage,
      }}
      totalCount={normalizedProjects.totalCount}
      onCreateClick={openCreateDialog}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onQueryChange={onQueryChange}
      onRetry={() => {
        void projectsQuery.refetch();
      }}
      onRowClick={(projectId) => navigate(`/projects/${projectId}`)}
      onSortChange={onSortChange}
    />
  );
}
