import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cancelEngineeringChange } from "@/features/engineering-change/api/engineering-change.api";
import { invalidateEngineeringChangeQueries } from "@/features/engineering-change/lib/invalidate-engineering-change-queries";
import { extractApiError } from "@/lib/api-error";

export function useCloseEngineeringChangeAction(engineeringChangeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["engineering-change", engineeringChangeId, "close-engineering-change-action"],
    mutationFn: () => cancelEngineeringChange(engineeringChangeId),
    onSuccess: async () => {
      toast.success("변경관리를 폐기했습니다.");
      await invalidateEngineeringChangeQueries(queryClient, engineeringChangeId, { includeList: true });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "변경관리 폐기에 실패했습니다."));
    },
  });
}
