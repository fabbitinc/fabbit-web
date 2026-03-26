import { useEffect, useRef } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ChangeManagementScreen as ChangeManagementScreenView } from "@fabbit/components";
import { useEngineeringChangeListQuery } from "@/features/change-management/hooks/use-engineering-change-list-query";
import { useIssueListQuery } from "@/features/change-management/hooks/use-issue-list-query";
import { settingsQueries } from "@/features/settings";
import type { ChangeManagementQueryState, ChangeManagementState, ChangeManagementView } from "@/features/change-management/types/change-management-model";

interface ChangeManagementScreenProps {
  queryState: ChangeManagementQueryState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onQueryChange: (query: string) => void;
  onStateChange: (state: ChangeManagementState) => void;
  onViewChange: (view: ChangeManagementView) => void;
}

const PART_WORKFLOW_POLICY_FORBIDDEN = "PART_WORKFLOW_POLICY_FORBIDDEN";

export function ChangeManagementScreen({
  queryState,
  onPageChange,
  onPageSizeChange,
  onQueryChange,
  onStateChange,
  onViewChange,
}: ChangeManagementScreenProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const handledForbiddenRef = useRef(false);
  // 이슈 API는 OPEN/CLOSED만 지원, done → CLOSED로 변환
  const issueState = queryState.state === "done" ? "CLOSED" : queryState.state.toUpperCase();
  const issuesQuery = useIssueListQuery(
    {
      search: queryState.query || undefined,
      state: issueState,
      offset: (queryState.page - 1) * queryState.pageSize,
      limit: queryState.pageSize,
    },
    queryState.view === "issues",
  );
  const requestsQuery = useEngineeringChangeListQuery(
    {
      search: queryState.query || undefined,
      state: queryState.state.toUpperCase(),
      offset: (queryState.page - 1) * queryState.pageSize,
      limit: queryState.pageSize,
    },
    queryState.view === "engineering-changes",
  );

  const activeQuery = queryState.view === "issues" ? issuesQuery : requestsQuery;

  useEffect(() => {
    if (!activeQuery.error) {
      handledForbiddenRef.current = false;
      return;
    }

    if (handledForbiddenRef.current) {
      return;
    }

    if (!axios.isAxiosError(activeQuery.error) || activeQuery.error.response?.status !== 403) {
      return;
    }

    handledForbiddenRef.current = true;

    const errorCode =
      activeQuery.error.response?.data &&
      typeof activeQuery.error.response.data === "object" &&
      "code" in activeQuery.error.response.data &&
      typeof activeQuery.error.response.data.code === "string"
        ? activeQuery.error.response.data.code
        : null;

    if (errorCode !== PART_WORKFLOW_POLICY_FORBIDDEN) {
      toast.error("변경 관리 화면에 접근할 권한이 없습니다.");
      return;
    }

    void queryClient
      .fetchQuery({
        ...settingsQueries.detail(),
        staleTime: 0,
      })
      .then((settings) => {
        if (settings.partWorkflowMode !== "DIRECT") {
          return;
        }

        toast.info("조직 설정이 변경되어 부품 관리 화면으로 이동했습니다.");
        navigate("/parts", { replace: true });
      });
  }, [activeQuery.error, navigate, queryClient]);

  return (
    <ChangeManagementScreenView
      isError={activeQuery.isError}
      isLoading={activeQuery.isLoading}
      listData={activeQuery.data}
      queryState={queryState}
      onCreateClick={() => {
        navigate(queryState.view === "issues" ? "/changes/issues/new" : "/changes/engineering-changes/new");
      }}
      onItemClick={(item) => {
        navigate(item.kind === "issues" ? `/changes/issues/${item.id}` : `/changes/engineering-changes/${item.id}`);
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
