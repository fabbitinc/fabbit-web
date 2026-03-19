import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { syncIssueParts } from "@/features/issue/api/issue.api";
import { invalidateIssueQueries } from "@/features/issue/lib/invalidate-issue-queries";
import { extractApiError } from "@/lib/api-error";

export function useSyncIssuePartsAction(issueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["issue", issueId, "sync-issue-parts-action"],
    mutationFn: (partIds: string[]) =>
      syncIssueParts(issueId, {
        part_ids: partIds,
      }),
    onSuccess: async () => {
      toast.success("관련 부품을 갱신했습니다.");
      await invalidateIssueQueries(queryClient, issueId);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "부품 변경에 실패했습니다."));
    },
  });
}
