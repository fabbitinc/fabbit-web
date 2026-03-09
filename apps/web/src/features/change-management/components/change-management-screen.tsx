import { useNavigate } from "react-router-dom";
import { ChangeManagementScreen as ChangeManagementScreenView } from "@fabbit/components";
import { useChangeRequestListQuery } from "@/features/change-management/hooks/use-change-request-list-query";
import { useIssueListQuery } from "@/features/change-management/hooks/use-issue-list-query";
import type { ChangeManagementQueryState, ChangeManagementState, ChangeManagementView } from "@/features/change-management/types/change-management-model";

interface ChangeManagementScreenProps {
  queryState: ChangeManagementQueryState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onQueryChange: (query: string) => void;
  onStateChange: (state: ChangeManagementState) => void;
  onViewChange: (view: ChangeManagementView) => void;
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

  return (
    <ChangeManagementScreenView
      isError={activeQuery.isError}
      isLoading={activeQuery.isLoading}
      listData={activeQuery.data}
      queryState={queryState}
      onCreateClick={() => {
        navigate(queryState.view === "issues" ? "/changes/issues/new" : "/changes/requests/new");
      }}
      onItemClick={(item) => {
        navigate(item.kind === "issues" ? `/changes/issues/${item.number}` : `/changes/requests/${item.number}`);
      }}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onQueryChange={onQueryChange}
      onRetry={() => {
        void activeQuery.refetch();
      }}
      onStateChange={onStateChange}
      onViewChange={onViewChange}
    />
  );
}
