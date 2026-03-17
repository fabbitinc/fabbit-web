import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { closeEngineeringChange } from "@/features/engineering-change/api/engineering-change.api";
import { invalidateEngineeringChangeQueries } from "@/features/engineering-change/lib/invalidate-engineering-change-queries";
import { extractApiError } from "@/lib/api-error";

export function useCloseEngineeringChangeAction(changeNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["engineering-change", changeNumber, "close-engineering-change-action"],
    mutationFn: () => closeEngineeringChange(changeNumber),
    onSuccess: async () => {
      toast.success("변경관리를 닫았습니다.");
      await invalidateEngineeringChangeQueries(queryClient, changeNumber, { includeList: true });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "변경관리 닫기에 실패했습니다."));
    },
  });
}
