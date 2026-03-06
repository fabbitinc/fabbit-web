import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { syncIssueAssignees } from "@/features/issue/api/issue.api";
import { invalidateIssueQueries } from "@/features/issue/lib/invalidate-issue-queries";
import { extractApiError } from "@/lib/api-error";

export function useSyncIssueAssigneesAction(issueNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["issue", issueNumber, "sync-issue-assignees-action"],
    mutationFn: (userIds: string[]) =>
      syncIssueAssignees(issueNumber, {
        user_ids: userIds,
      }),
    onSuccess: async () => {
      toast.success("담당자를 갱신했습니다.");
      await invalidateIssueQueries(queryClient, issueNumber);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "담당자 변경에 실패했습니다."));
    },
  });
}
