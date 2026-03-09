import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { syncChangeRequestReviewers } from "@/features/change-request/api/change-request.api";
import { invalidateChangeRequestQueries } from "@/features/change-request/lib/invalidate-change-request-queries";
import { extractApiError } from "@/lib/api-error";

export function useSyncChangeRequestReviewersAction(changeNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["change-request", changeNumber, "sync-change-request-reviewers-action"],
    mutationFn: (userIds: string[]) =>
      syncChangeRequestReviewers(changeNumber, {
        user_ids: userIds,
      }),
    onSuccess: async () => {
      toast.success("검토자를 갱신했습니다.");
      await invalidateChangeRequestQueries(queryClient, changeNumber);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "검토자 변경에 실패했습니다."));
    },
  });
}
