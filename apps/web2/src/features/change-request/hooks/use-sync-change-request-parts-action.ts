import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { syncChangeRequestParts } from "@/features/change-request/api/change-request.api";
import { invalidateChangeRequestQueries } from "@/features/change-request/lib/invalidate-change-request-queries";
import { extractApiError } from "@/lib/api-error";

export function useSyncChangeRequestPartsAction(changeNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["change-request", changeNumber, "sync-change-request-parts-action"],
    mutationFn: (partIds: string[]) =>
      syncChangeRequestParts(changeNumber, {
        part_ids: partIds,
      }),
    onSuccess: async () => {
      toast.success("관련 부품을 갱신했습니다.");
      await invalidateChangeRequestQueries(queryClient, changeNumber);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "부품 변경에 실패했습니다."));
    },
  });
}
