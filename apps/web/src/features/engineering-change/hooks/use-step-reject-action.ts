import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { rejectEngineeringChange } from "@/features/engineering-change/api/engineering-change.api";
import { invalidateEngineeringChangeQueries } from "@/features/engineering-change/lib/invalidate-engineering-change-queries";
import { extractApiError } from "@/lib/api-error";

export function useStepRejectAction(engineeringChangeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["engineering-change", engineeringChangeId, "step-reject"],
    mutationFn: ({ stepId, comment }: { stepId: string; comment?: string }) =>
      rejectEngineeringChange(engineeringChangeId, { step_id: stepId, comment }),
    onSuccess: async () => {
      toast.success("변경관리를 반려했습니다.");
      await invalidateEngineeringChangeQueries(queryClient, engineeringChangeId, { includeList: true });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "반려에 실패했습니다."));
    },
  });
}
