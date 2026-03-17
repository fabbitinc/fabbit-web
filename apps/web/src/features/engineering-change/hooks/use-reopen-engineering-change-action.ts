import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { reopenEngineeringChange } from "@/features/engineering-change/api/engineering-change.api";
import { invalidateEngineeringChangeQueries } from "@/features/engineering-change/lib/invalidate-engineering-change-queries";
import { extractApiError } from "@/lib/api-error";

export function useReopenEngineeringChangeAction(changeNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["engineering-change", changeNumber, "reopen-engineering-change-action"],
    mutationFn: () => reopenEngineeringChange(changeNumber),
    onSuccess: async () => {
      toast.success("변경관리를 다시 열었습니다.");
      await invalidateEngineeringChangeQueries(queryClient, changeNumber, { includeList: true });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "변경관리 다시 열기에 실패했습니다."));
    },
  });
}
