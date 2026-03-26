import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { syncAffectedItems } from "@/features/engineering-change/api/engineering-change.api";
import type { SyncAffectedItemsRequestDto } from "@/features/engineering-change/api/engineering-change.types";
import { invalidateEngineeringChangeQueries } from "@/features/engineering-change/lib/invalidate-engineering-change-queries";
import { extractApiError } from "@/lib/api-error";

export function useSyncAffectedItemsAction(engineeringChangeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["engineering-change", engineeringChangeId, "sync-affected-items-action"],
    mutationFn: (request: SyncAffectedItemsRequestDto) =>
      syncAffectedItems(engineeringChangeId, request),
    onSuccess: async () => {
      toast.success("영향 항목을 갱신했습니다.");
      await invalidateEngineeringChangeQueries(queryClient, engineeringChangeId);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "영향 항목 갱신에 실패했습니다."));
    },
  });
}
