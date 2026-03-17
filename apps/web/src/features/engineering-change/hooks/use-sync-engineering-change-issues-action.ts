import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { syncEngineeringChangeIssues } from "@/features/engineering-change/api/engineering-change.api";
import { invalidateEngineeringChangeQueries } from "@/features/engineering-change/lib/invalidate-engineering-change-queries";
import { extractApiError } from "@/lib/api-error";

export function useSyncEngineeringChangeIssuesAction(changeNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["engineering-change", changeNumber, "sync-engineering-change-issues-action"],
    mutationFn: (issueIds: string[]) =>
      syncEngineeringChangeIssues(changeNumber, {
        issue_ids: issueIds,
      }),
    onSuccess: async () => {
      toast.success("연결된 이슈를 갱신했습니다.");
      await invalidateEngineeringChangeQueries(queryClient, changeNumber);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "이슈 연결에 실패했습니다."));
    },
  });
}
