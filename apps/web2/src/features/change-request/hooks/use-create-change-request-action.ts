import { type MutationFunctionContext, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadFiles } from "@/api/file.api";
import type { ChangeCreateFormSubmitInput } from "@/features/change-shared";
import { changeManagementKeys } from "@/features/change-management/api/change-management.queries";
import { changeRequestMutations } from "@/features/change-request/api/change-request.queries";
import type { CreateChangeRequestDto } from "@/features/change-request/api/change-request.types";
import { extractApiError } from "@/lib/api-error";

export function useCreateChangeRequestAction() {
  const queryClient = useQueryClient();
  const createChangeRequestMutation = changeRequestMutations.create();

  return useMutation({
    mutationKey: createChangeRequestMutation.mutationKey,
    mutationFn: async (input: ChangeCreateFormSubmitInput, context: MutationFunctionContext) => {
      const mutationFn = createChangeRequestMutation.mutationFn;

      if (!mutationFn) {
        throw new Error("변경 요청 생성 mutationFn이 정의되지 않았습니다.");
      }

      const fileIds = await uploadFiles(input.files);
      return mutationFn(toCreateChangeRequestRequest(input, fileIds), context);
    },
    onSuccess: async () => {
      toast.success("변경 요청을 생성했습니다.");
      await queryClient.invalidateQueries({ queryKey: changeManagementKeys.requestsAll });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "변경 요청 생성에 실패했습니다."));
    },
  });
}

function toCreateChangeRequestRequest(
  input: ChangeCreateFormSubmitInput,
  fileIds: string[],
): CreateChangeRequestDto {
  return {
    title: input.title,
    body: input.body ?? undefined,
    issue_number: input.linkedIssueNumber ?? undefined,
    assignee_user_ids: input.assigneeIds.length > 0 ? input.assigneeIds : undefined,
    reviewer_user_ids: input.reviewerIds.length > 0 ? input.reviewerIds : undefined,
    label_ids: input.labelIds.length > 0 ? input.labelIds : undefined,
    part_ids: input.partIds.length > 0 ? input.partIds : undefined,
    file_ids: fileIds.length > 0 ? fileIds : undefined,
  };
}
