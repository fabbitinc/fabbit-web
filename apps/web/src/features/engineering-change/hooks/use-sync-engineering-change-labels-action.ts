import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { syncEngineeringChangeLabels } from "@/features/engineering-change/api/engineering-change.api";
import { invalidateEngineeringChangeQueries } from "@/features/engineering-change/lib/invalidate-engineering-change-queries";
import { extractApiError } from "@/lib/api-error";

export function useSyncEngineeringChangeLabelsAction(changeNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["engineering-change", changeNumber, "sync-engineering-change-labels-action"],
    mutationFn: (labelIds: string[]) =>
      syncEngineeringChangeLabels(changeNumber, {
        label_ids: labelIds,
      }),
    onSuccess: async () => {
      toast.success("라벨을 갱신했습니다.");
      await invalidateEngineeringChangeQueries(queryClient, changeNumber);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "라벨 변경에 실패했습니다."));
    },
  });
}
