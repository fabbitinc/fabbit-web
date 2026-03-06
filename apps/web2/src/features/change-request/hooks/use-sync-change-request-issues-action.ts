import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { syncChangeRequestIssues } from "@/features/change-request/api/change-request.api";
import { invalidateChangeRequestQueries } from "@/features/change-request/lib/invalidate-change-request-queries";
import { extractApiError } from "@/lib/api-error";

export function useSyncChangeRequestIssuesAction(changeNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["change-request", changeNumber, "sync-change-request-issues-action"],
    mutationFn: (issueIds: string[]) =>
      syncChangeRequestIssues(changeNumber, {
        issue_ids: issueIds,
      }),
    onSuccess: async () => {
      toast.success("연결된 이슈를 갱신했습니다.");
      await invalidateChangeRequestQueries(queryClient, changeNumber);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "이슈 연결에 실패했습니다."));
    },
  });
}
