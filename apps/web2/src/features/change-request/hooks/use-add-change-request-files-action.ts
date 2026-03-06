import { type MutationFunctionContext, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadFiles } from "@/api/file.api";
import { changeRequestMutations } from "@/features/change-request/api/change-request.queries";
import { invalidateChangeRequestQueries } from "@/features/change-request/lib/invalidate-change-request-queries";
import { extractApiError } from "@/lib/api-error";

export function useAddChangeRequestFilesAction(changeNumber: number) {
  const queryClient = useQueryClient();
  const addFilesMutation = changeRequestMutations.addFiles(changeNumber);

  return useMutation({
    mutationKey: addFilesMutation.mutationKey,
    mutationFn: async (files: File[], context: MutationFunctionContext) => {
      const mutationFn = addFilesMutation.mutationFn;

      if (!mutationFn) {
        throw new Error("변경 요청 파일 첨부 mutationFn이 정의되지 않았습니다.");
      }

      const fileIds = await uploadFiles(files);
      return mutationFn({
        file_ids: fileIds,
      }, context);
    },
    onSuccess: async (_, files) => {
      toast.success(`${files.length}개의 파일을 첨부했습니다.`);
      await invalidateChangeRequestQueries(queryClient, changeNumber);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "파일 첨부에 실패했습니다."));
    },
  });
}
