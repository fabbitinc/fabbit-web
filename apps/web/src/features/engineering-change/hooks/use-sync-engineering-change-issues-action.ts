import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { syncEngineeringChangeIssues } from "@/features/engineering-change/api/engineering-change.api";
import { invalidateEngineeringChangeQueries } from "@/features/engineering-change/lib/invalidate-engineering-change-queries";
import { extractApiError } from "@/lib/api-error";

export function useSyncEngineeringChangeIssuesAction(engineeringChangeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["engineering-change", engineeringChangeId, "sync-engineering-change-issues-action"],
    mutationFn: (issueIds: string[]) =>
      syncEngineeringChangeIssues(engineeringChangeId, {
        issue_ids: issueIds,
      }),
    onSuccess: async () => {
      toast.success("연결된 이슈를 갱신했습니다.");
      await invalidateEngineeringChangeQueries(queryClient, engineeringChangeId);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "이슈 연결에 실패했습니다."));
    },
  });
}
