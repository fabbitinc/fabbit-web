import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { syncEngineeringChangeParts } from "@/features/engineering-change/api/engineering-change.api";
import { invalidateEngineeringChangeQueries } from "@/features/engineering-change/lib/invalidate-engineering-change-queries";
import { extractApiError } from "@/lib/api-error";

export function useSyncEngineeringChangePartsAction(changeNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["engineering-change", changeNumber, "sync-engineering-change-parts-action"],
    mutationFn: (partIds: string[]) =>
      syncEngineeringChangeParts(changeNumber, {
        part_ids: partIds,
      }),
    onSuccess: async () => {
      toast.success("관련 부품을 갱신했습니다.");
      await invalidateEngineeringChangeQueries(queryClient, changeNumber);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "부품 변경에 실패했습니다."));
    },
  });
}
