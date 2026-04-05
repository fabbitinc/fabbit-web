import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  approveEngineeringChange,
  approveReviewEngineeringChange,
  releaseEngineeringChange,
} from "@/features/engineering-change/api/engineering-change.api";
import { invalidateEngineeringChangeQueries } from "@/features/engineering-change/lib/invalidate-engineering-change-queries";
import { extractApiError } from "@/lib/api-error";

export function useStepApproveAction(engineeringChangeId: string, ecState: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["engineering-change", engineeringChangeId, "step-approve"],
    mutationFn: async ({ stepId, comment }: { stepId: string; comment?: string }) => {
      const normalized = ecState?.toUpperCase() ?? "";
      const stepAction = { step_id: stepId, comment };

      if (normalized === "REVIEW_PENDING") {
        return approveReviewEngineeringChange(engineeringChangeId, stepAction);
      }

      if (normalized === "APPROVAL_PENDING") {
        return approveEngineeringChange(engineeringChangeId, stepAction);
      }

      return releaseEngineeringChange(engineeringChangeId, stepAction);
    },
    onSuccess: async () => {
      toast.success("단계를 승인했습니다.");
      await invalidateEngineeringChangeQueries(queryClient, engineeringChangeId, { includeList: true });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "단계 승인에 실패했습니다."));
    },
  });
}
