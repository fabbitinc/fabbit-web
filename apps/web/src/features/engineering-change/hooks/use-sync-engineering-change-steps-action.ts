import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { replaceEngineeringChangeSteps } from "@/features/engineering-change/api/engineering-change.api";
import { invalidateEngineeringChangeQueries } from "@/features/engineering-change/lib/invalidate-engineering-change-queries";
import { AssigneeRequestAssigneeType } from "@/api/generated/orval/model/assigneeRequestAssigneeType";
import type { EngineeringChangeStepRequestStepType } from "@/api/generated/orval/model/engineeringChangeStepRequestStepType";
import type { EngineeringChangeCompletionPolicy } from "@/features/engineering-change/types/engineering-change-model";
import { extractApiError } from "@/lib/api-error";
import type { EngineeringChangeWorkflowModel } from "@/features/engineering-change/types/engineering-change-model";

export interface SyncStepsStageInput {
  stageType: EngineeringChangeStepRequestStepType;
  stageId?: string | null;
  completionPolicy: EngineeringChangeCompletionPolicy;
  minApprovals?: number | null;
  deadline?: string | null;
  assignees: { id: string; type: "USER" | "TEAM" }[];
}

interface SyncStepsParams {
  stages: SyncStepsStageInput[];
}

export function useSyncEngineeringChangeStepsAction(engineeringChangeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["engineering-change", engineeringChangeId, "sync-steps"],
    mutationFn: ({ stages }: SyncStepsParams) => {
      const steps = stages
        .filter((stage) => stage.assignees.length > 0)
        .map((stage, index) => ({
          step_stage_id: stage.stageId ?? undefined,
          step_type: stage.stageType,
          sequence: index + 1,
          completion_policy: stage.completionPolicy,
          min_approvals: stage.completionPolicy === "MIN_N_APPROVES" ? (stage.minApprovals ?? undefined) : undefined,
          deadline: stage.deadline ?? undefined,
          assignees: stage.assignees.map((assignee) => ({
            assignee_type: assignee.type as AssigneeRequestAssigneeType,
            assignee_id: assignee.id,
          })),
        }));

      return replaceEngineeringChangeSteps(engineeringChangeId, { steps });
    },
    onSuccess: async () => {
      toast.success("워크플로우를 갱신했습니다.");
      await invalidateEngineeringChangeQueries(queryClient, engineeringChangeId);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "워크플로우 변경에 실패했습니다."));
    },
  });
}

// 기존 workflow를 기반으로 특정 stage만 변경한 SyncStepsParams를 만드는 헬퍼
export function buildSyncStagesFromWorkflow(
  currentWorkflow: EngineeringChangeWorkflowModel,
  overrideStageType?: string,
  overrideStage?: Partial<SyncStepsStageInput>,
): SyncStepsStageInput[] {
  return currentWorkflow.stages.map((stage) => {
    const base: SyncStepsStageInput = {
      stageType: stage.type as EngineeringChangeStepRequestStepType,
      stageId: stage.stageId,
      completionPolicy: stage.completionPolicy,
      minApprovals: stage.minApprovals,
      deadline: stage.deadline,
      assignees: stage.assignees.map((a) => ({ id: a.assigneeId, type: a.type })),
    };

    if (stage.type === overrideStageType && overrideStage) {
      return { ...base, ...overrideStage };
    }

    return base;
  });
}
