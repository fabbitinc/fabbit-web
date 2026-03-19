import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { issueMutations } from "@/features/issue/api/issue.queries";
import { invalidateIssueQueries } from "@/features/issue/lib/invalidate-issue-queries";
import { extractApiError } from "@/lib/api-error";

export function useCloseIssueAction(issueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    ...issueMutations.close(issueId),
    mutationKey: ["issue", issueId, "close-issue-action"],
    onSuccess: async () => {
      toast.success("이슈를 닫았습니다.");
      await invalidateIssueQueries(queryClient, issueId, { includeList: true });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "이슈 닫기에 실패했습니다."));
    },
  });
}
