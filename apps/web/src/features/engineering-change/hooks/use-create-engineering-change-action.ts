import { type MutationFunctionContext, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { TiptapEditorProps } from "@fabbit/ui";
import { uploadFiles } from "@/api/file.api";
import { changeManagementKeys } from "@/features/change-management/api/change-management.queries";
import { engineeringChangeMutations } from "@/features/engineering-change/api/engineering-change.queries";
import type { CreateEngineeringChangeDto } from "@/features/engineering-change/api/engineering-change.types";
import { AssigneeRequestAssigneeType } from "@/api/generated/orval/model/assigneeRequestAssigneeType";
import type { EngineeringChangeStepRequestStepType } from "@/api/generated/orval/model/engineeringChangeStepRequestStepType";
import { extractApiError } from "@/lib/api-error";
import { normalizeRichTextDocument } from "@/lib/rich-text";

export interface EcCreateActionInput {
  title: string;
  body: TiptapEditorProps["content"] | null;
  labelIds: string[];
  linkedIssueIds: string[];
  files: File[];
  stages: {
    stageType: "REVIEW" | "APPROVAL" | "RELEASE";
    completionPolicy: string;
    minApprovals?: number | null;
    assigneeIds: string[];
  }[];
  affectedItems: {
    targetId: string;
    itemType: string;
  }[];
}

export function useCreateEngineeringChangeAction() {
  const queryClient = useQueryClient();
  const createEngineeringChangeMutation = engineeringChangeMutations.create();

  return useMutation({
    mutationKey: createEngineeringChangeMutation.mutationKey,
    mutationFn: async (input: EcCreateActionInput, context: MutationFunctionContext) => {
      const mutationFn = createEngineeringChangeMutation.mutationFn;

      if (!mutationFn) {
        throw new Error("변경관리 생성 mutationFn이 정의되지 않았습니다.");
      }

      const fileIds = await uploadFiles(input.files);
      return mutationFn(toCreateEngineeringChangeRequest(input, fileIds), context);
    },
    onSuccess: async () => {
      toast.success("변경관리를 생성했습니다.");
      await queryClient.invalidateQueries({ queryKey: changeManagementKeys.engineeringChangesAll });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "변경관리 생성에 실패했습니다."));
    },
  });
}

function toCreateEngineeringChangeRequest(
  input: EcCreateActionInput,
  fileIds: string[],
): CreateEngineeringChangeDto {
  const steps: CreateEngineeringChangeDto["steps"] = [];

  for (const [index, stage] of input.stages.entries()) {
    if (stage.assigneeIds.length === 0) continue;
    steps.push({
      step_type: stage.stageType as EngineeringChangeStepRequestStepType,
      sequence: index + 1,
      completion_policy: stage.completionPolicy as "ALL_MUST_APPROVE" | "ANY_ONE_APPROVES" | "MIN_N_APPROVES",
      min_approvals: stage.completionPolicy === "MIN_N_APPROVES" ? (stage.minApprovals ?? 1) : undefined,
      assignees: stage.assigneeIds.map((id) => ({
        assignee_type: AssigneeRequestAssigneeType.USER,
        assignee_id: id,
      })),
    });
  }

  const affectedItems = input.affectedItems.length > 0
    ? input.affectedItems.map((item) => ({
        item_type: item.itemType as "REVISION_RELEASE" | "LIFECYCLE_CHANGE",
        target_id: item.targetId,
      }))
    : undefined;

  return {
    title: input.title,
    body: normalizeRichTextDocument(input.body) ?? undefined,
    label_ids: input.labelIds.length > 0 ? input.labelIds : undefined,
    linked_issue_ids: input.linkedIssueIds.length > 0 ? input.linkedIssueIds : undefined,
    file_ids: fileIds.length > 0 ? fileIds : undefined,
    steps: steps.length > 0 ? steps : undefined,
    affected_items: affectedItems,
  };
}
