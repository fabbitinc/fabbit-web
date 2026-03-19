import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { rejectEngineeringChange } from "@/features/engineering-change/api/engineering-change.api";
import { invalidateEngineeringChangeQueries } from "@/features/engineering-change/lib/invalidate-engineering-change-queries";
import { extractApiError } from "@/lib/api-error";

export function useReopenEngineeringChangeAction(engineeringChangeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["engineering-change", engineeringChangeId, "reopen-engineering-change-action"],
    mutationFn: () => rejectEngineeringChange(engineeringChangeId),
    onSuccess: async () => {
      toast.success("변경관리를 초안으로 되돌렸습니다.");
      await invalidateEngineeringChangeQueries(queryClient, engineeringChangeId, { includeList: true });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "변경관리 반려에 실패했습니다."));
    },
  });
}
