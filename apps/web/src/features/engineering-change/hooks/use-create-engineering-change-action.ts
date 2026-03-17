import { type MutationFunctionContext, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadFiles } from "@/api/file.api";
import type { ChangeCreateFormSubmitInput } from "@/features/change-shared";
import { changeManagementKeys } from "@/features/change-management/api/change-management.queries";
import { engineeringChangeMutations } from "@/features/engineering-change/api/engineering-change.queries";
import type { CreateEngineeringChangeDto } from "@/features/engineering-change/api/engineering-change.types";
import { extractApiError } from "@/lib/api-error";

export function useCreateEngineeringChangeAction() {
  const queryClient = useQueryClient();
  const createEngineeringChangeMutation = engineeringChangeMutations.create();

  return useMutation({
    mutationKey: createEngineeringChangeMutation.mutationKey,
    mutationFn: async (input: ChangeCreateFormSubmitInput, context: MutationFunctionContext) => {
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
  input: ChangeCreateFormSubmitInput,
  fileIds: string[],
): CreateEngineeringChangeDto {
  return {
    title: input.title,
    body: input.body ?? undefined,
    source_issue_number: input.linkedIssueNumber ?? undefined,
    reviewer_user_ids: input.reviewerIds.length > 0 ? input.reviewerIds : undefined,
    file_ids: fileIds.length > 0 ? fileIds : undefined,
  };
}
