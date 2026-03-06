import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { syncIssueChanges } from "@/features/issue/api/issue.api";
import { invalidateIssueQueries } from "@/features/issue/lib/invalidate-issue-queries";
import { extractApiError } from "@/lib/api-error";

export function useSyncIssueChangesAction(issueNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["issue", issueNumber, "sync-issue-changes-action"],
    mutationFn: (changeIds: string[]) =>
      syncIssueChanges(issueNumber, {
        cr_ids: changeIds,
      }),
    onSuccess: async () => {
      toast.success("연결된 변경 요청을 갱신했습니다.");
      await invalidateIssueQueries(queryClient, issueNumber);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "변경 요청 연결에 실패했습니다."));
    },
  });
}
