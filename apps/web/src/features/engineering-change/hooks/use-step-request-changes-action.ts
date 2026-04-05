import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { requestChangesEngineeringChange } from "@/features/engineering-change/api/engineering-change.api";
import { invalidateEngineeringChangeQueries } from "@/features/engineering-change/lib/invalidate-engineering-change-queries";
import { extractApiError } from "@/lib/api-error";

export function useStepRequestChangesAction(engineeringChangeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["engineering-change", engineeringChangeId, "step-request-changes"],
    mutationFn: ({ stepId, comment }: { stepId: string; comment?: string }) =>
      requestChangesEngineeringChange(engineeringChangeId, stepId, { step_id: stepId, comment }),
    onSuccess: async () => {
      toast.success("수정을 요청했습니다.");
      await invalidateEngineeringChangeQueries(queryClient, engineeringChangeId);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "수정 요청에 실패했습니다."));
    },
  });
}
