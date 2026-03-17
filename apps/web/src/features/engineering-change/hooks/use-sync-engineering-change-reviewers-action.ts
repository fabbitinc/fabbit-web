import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { syncEngineeringChangeReviewers } from "@/features/engineering-change/api/engineering-change.api";
import { invalidateEngineeringChangeQueries } from "@/features/engineering-change/lib/invalidate-engineering-change-queries";
import { extractApiError } from "@/lib/api-error";

export function useSyncEngineeringChangeReviewersAction(changeNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["engineering-change", changeNumber, "sync-engineering-change-reviewers-action"],
    mutationFn: (userIds: string[]) =>
      syncEngineeringChangeReviewers(changeNumber, {
        user_ids: userIds,
      }),
    onSuccess: async () => {
      toast.success("검토자를 갱신했습니다.");
      await invalidateEngineeringChangeQueries(queryClient, changeNumber);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "검토자 변경에 실패했습니다."));
    },
  });
}
