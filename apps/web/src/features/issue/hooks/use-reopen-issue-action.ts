import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { issueMutations } from "@/features/issue/api/issue.queries";
import { invalidateIssueQueries } from "@/features/issue/lib/invalidate-issue-queries";
import { extractApiError } from "@/lib/api-error";

export function useReopenIssueAction(issueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    ...issueMutations.reopen(issueId),
    mutationKey: ["issue", issueId, "reopen-issue-action"],
    onSuccess: async () => {
      toast.success("이슈를 다시 열었습니다.");
      await invalidateIssueQueries(queryClient, issueId, { includeList: true });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "이슈 다시 열기에 실패했습니다."));
    },
  });
}
