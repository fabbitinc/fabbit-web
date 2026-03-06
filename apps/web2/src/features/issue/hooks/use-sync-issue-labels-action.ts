import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { syncIssueLabels } from "@/features/issue/api/issue.api";
import { invalidateIssueQueries } from "@/features/issue/lib/invalidate-issue-queries";
import { extractApiError } from "@/lib/api-error";

export function useSyncIssueLabelsAction(issueNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["issue", issueNumber, "sync-issue-labels-action"],
    mutationFn: (labelIds: string[]) =>
      syncIssueLabels(issueNumber, {
        label_ids: labelIds,
      }),
    onSuccess: async () => {
      toast.success("라벨을 갱신했습니다.");
      await invalidateIssueQueries(queryClient, issueNumber);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "라벨 변경에 실패했습니다."));
    },
  });
}
