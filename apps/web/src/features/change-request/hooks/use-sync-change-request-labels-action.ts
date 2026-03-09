import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { syncChangeRequestLabels } from "@/features/change-request/api/change-request.api";
import { invalidateChangeRequestQueries } from "@/features/change-request/lib/invalidate-change-request-queries";
import { extractApiError } from "@/lib/api-error";

export function useSyncChangeRequestLabelsAction(changeNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["change-request", changeNumber, "sync-change-request-labels-action"],
    mutationFn: (labelIds: string[]) =>
      syncChangeRequestLabels(changeNumber, {
        label_ids: labelIds,
      }),
    onSuccess: async () => {
      toast.success("라벨을 갱신했습니다.");
      await invalidateChangeRequestQueries(queryClient, changeNumber);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "라벨 변경에 실패했습니다."));
    },
  });
}
