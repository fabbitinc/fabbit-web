import { type MutationFunctionContext, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadFiles } from "@/api/file.api";
import type { ChangeCreateFormSubmitInput } from "@/features/change-shared";
import { changeManagementKeys } from "@/features/change-management/api/change-management.queries";
import { issueMutations } from "@/features/issue/api/issue.queries";
import type { CreateIssueRequestDto } from "@/features/issue/api/issue.types";
import { extractApiError } from "@/lib/api-error";

export function useCreateIssueAction() {
  const queryClient = useQueryClient();
  const createIssueMutation = issueMutations.create();

  return useMutation({
    mutationKey: createIssueMutation.mutationKey,
    mutationFn: async (input: ChangeCreateFormSubmitInput, context: MutationFunctionContext) => {
      const mutationFn = createIssueMutation.mutationFn;

      if (!mutationFn) {
        throw new Error("이슈 생성 mutationFn이 정의되지 않았습니다.");
      }

      const fileIds = await uploadFiles(input.files);
      return mutationFn(toCreateIssueRequest(input, fileIds), context);
    },
    onSuccess: async () => {
      toast.success("이슈를 생성했습니다.");
      await queryClient.invalidateQueries({ queryKey: changeManagementKeys.issuesAll });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "이슈 생성에 실패했습니다."));
    },
  });
}

function toCreateIssueRequest(
  input: ChangeCreateFormSubmitInput,
  fileIds: string[],
): CreateIssueRequestDto {
  return {
    title: input.title,
    body: input.body ?? undefined,
    assignee_user_ids: input.assigneeIds.length > 0 ? input.assigneeIds : undefined,
    label_ids: input.labelIds.length > 0 ? input.labelIds : undefined,
    part_ids: input.partIds.length > 0 ? input.partIds : undefined,
    file_ids: fileIds.length > 0 ? fileIds : undefined,
  };
}
