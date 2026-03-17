import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { submitEngineeringChange } from "@/features/engineering-change/api/engineering-change.api";
import { invalidateEngineeringChangeQueries } from "@/features/engineering-change/lib/invalidate-engineering-change-queries";
import { extractApiError } from "@/lib/api-error";

export function useSubmitEngineeringChangeAction(changeNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["engineering-change", changeNumber, "submit-engineering-change-action"],
    mutationFn: () => submitEngineeringChange(changeNumber),
    onSuccess: async () => {
      toast.success("변경관리를 제출했습니다.");
      await invalidateEngineeringChangeQueries(queryClient, changeNumber, { includeList: true });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "변경관리 제출에 실패했습니다."));
    },
  });
}
