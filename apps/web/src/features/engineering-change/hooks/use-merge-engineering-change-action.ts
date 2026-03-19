import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  approveEngineeringChange,
  approveReviewEngineeringChange,
  releaseEngineeringChange,
} from "@/features/engineering-change/api/engineering-change.api";
import { invalidateEngineeringChangeQueries } from "@/features/engineering-change/lib/invalidate-engineering-change-queries";
import { extractApiError } from "@/lib/api-error";

export function useMergeEngineeringChangeAction(engineeringChangeId: string, state: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["engineering-change", engineeringChangeId, "merge-engineering-change-action"],
    mutationFn: async () => {
      const normalized = state?.toUpperCase() ?? "";

      if (normalized === "REVIEW_PENDING") {
        return approveReviewEngineeringChange(engineeringChangeId);
      }

      if (normalized === "APPROVAL_PENDING") {
        return approveEngineeringChange(engineeringChangeId);
      }

      return releaseEngineeringChange(engineeringChangeId);
    },
    onSuccess: async () => {
      toast.success("변경관리 단계를 진행했습니다.");
      await invalidateEngineeringChangeQueries(queryClient, engineeringChangeId, { includeList: true });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "변경관리 단계 진행에 실패했습니다."));
    },
  });
}
