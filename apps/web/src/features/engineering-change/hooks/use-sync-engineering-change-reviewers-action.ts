import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { replaceEngineeringChangeSteps } from "@/features/engineering-change/api/engineering-change.api";
import { invalidateEngineeringChangeQueries } from "@/features/engineering-change/lib/invalidate-engineering-change-queries";
import { AssigneeRequestAssigneeType } from "@/api/generated/orval/model/assigneeRequestAssigneeType";
import { EngineeringChangeStepRequestStepType } from "@/api/generated/orval/model/engineeringChangeStepRequestStepType";
import { extractApiError } from "@/lib/api-error";

export function useSyncEngineeringChangeReviewersAction(engineeringChangeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["engineering-change", engineeringChangeId, "sync-engineering-change-reviewers-action"],
    mutationFn: (userIds: string[]) =>
      replaceEngineeringChangeSteps(engineeringChangeId, {
        steps: userIds.length > 0
          ? [{
              step_type: EngineeringChangeStepRequestStepType.REVIEW,
              sequence: 1,
              completion_policy: "ALL_MUST_APPROVE" as const,
              assignees: userIds.map((userId) => ({
                assignee_type: AssigneeRequestAssigneeType.USER,
                assignee_id: userId,
              })),
            }]
          : [],
      }),
    onSuccess: async () => {
      toast.success("검토자를 갱신했습니다.");
      await invalidateEngineeringChangeQueries(queryClient, engineeringChangeId);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "검토자 변경에 실패했습니다."));
    },
  });
}
