import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { populateWhereUsed } from "@/features/engineering-change/api/engineering-change.api";
import { invalidateEngineeringChangeQueries } from "@/features/engineering-change/lib/invalidate-engineering-change-queries";
import { extractApiError } from "@/lib/api-error";

export function usePopulateWhereUsedAction(engineeringChangeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["engineering-change", engineeringChangeId, "populate-where-used"],
    mutationFn: () => populateWhereUsed(engineeringChangeId),
    onSuccess: async () => {
      toast.success("영향 받는 상위 부품을 갱신했습니다.");
      await invalidateEngineeringChangeQueries(queryClient, engineeringChangeId);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "영향 받는 상위 부품 갱신에 실패했습니다."));
    },
  });
}
