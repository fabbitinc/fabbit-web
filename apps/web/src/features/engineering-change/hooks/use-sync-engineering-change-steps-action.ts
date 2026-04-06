import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { replaceEngineeringChangeSteps } from "@/features/engineering-change/api/engineering-change.api";
import { invalidateEngineeringChangeQueries } from "@/features/engineering-change/lib/invalidate-engineering-change-queries";
import { AssigneeRequestAssigneeType } from "@/api/generated/orval/model/assigneeRequestAssigneeType";
import type { EngineeringChangeStepRequestStepType } from "@/api/generated/orval/model/engineeringChangeStepRequestStepType";
import { extractApiError } from "@/lib/api-error";
import type { EngineeringChangeWorkflowModel } from "@/features/engineering-change/types/engineering-change-model";

interface SyncStepsParams {
  stageType: EngineeringChangeStepRequestStepType;
  userIds: string[];
  currentWorkflow: EngineeringChangeWorkflowModel;
}

const STAGE_LABEL: Record<string, string> = {
  REVIEW: "검토자",
  APPROVAL: "승인자",
  RELEASE: "배포자",
};

export function useSyncEngineeringChangeStepsAction(engineeringChangeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["engineering-change", engineeringChangeId, "sync-steps"],
    mutationFn: ({ stageType, userIds, currentWorkflow }: SyncStepsParams) => {
      // 다른 단계의 기존 step은 유지
      const otherSteps = currentWorkflow.stages
        .filter((stage) => stage.type !== stageType)
        .flatMap((stage) =>
          stage.assignees.map((assignee, index) => ({
            assignee_id: assignee.assigneeId,
            assignee_type: assignee.type as AssigneeRequestAssigneeType,
            sequence: index + 1,
            step_type: stage.type as EngineeringChangeStepRequestStepType,
          })),
        );

      // 대상 단계의 새 step 생성
      const newSteps = userIds.map((userId, index) => ({
        assignee_id: userId,
        assignee_type: AssigneeRequestAssigneeType.USER,
        sequence: index + 1,
        step_type: stageType,
      }));

      return replaceEngineeringChangeSteps(engineeringChangeId, {
        steps: [...otherSteps, ...newSteps],
      });
    },
    onSuccess: async (_data, { stageType }) => {
      toast.success(`${STAGE_LABEL[stageType] ?? "담당자"}를 갱신했습니다.`);
      await invalidateEngineeringChangeQueries(queryClient, engineeringChangeId);
    },
    onError: (error, { stageType }) => {
      toast.error(extractApiError(error, `${STAGE_LABEL[stageType] ?? "담당자"} 변경에 실패했습니다.`));
    },
  });
}
