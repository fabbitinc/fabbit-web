import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { resubmitEngineeringChangeStep } from "@/features/engineering-change/api/engineering-change.api";
import { invalidateEngineeringChangeQueries } from "@/features/engineering-change/lib/invalidate-engineering-change-queries";
import { extractApiError } from "@/lib/api-error";

export function useStepResubmitAction(engineeringChangeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["engineering-change", engineeringChangeId, "step-resubmit"],
    mutationFn: ({ stepId }: { stepId: string }) =>
      resubmitEngineeringChangeStep(engineeringChangeId, stepId),
    onSuccess: async () => {
      toast.success("재제출했습니다.");
      await invalidateEngineeringChangeQueries(queryClient, engineeringChangeId);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "재제출에 실패했습니다."));
    },
  });
}
