import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { syncIssueChanges } from "@/features/issue/api/issue.api";
import { invalidateIssueQueries } from "@/features/issue/lib/invalidate-issue-queries";
import { extractApiError } from "@/lib/api-error";

export function useSyncIssueChangesAction(issueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["issue", issueId, "sync-issue-changes-action"],
    mutationFn: (changeIds: string[]) =>
      syncIssueChanges(issueId, {
        engineering_change_ids: changeIds,
      }),
    onSuccess: async () => {
      toast.success("연결된 변경관리를 갱신했습니다.");
      await invalidateIssueQueries(queryClient, issueId);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "변경관리 연결에 실패했습니다."));
    },
  });
}
