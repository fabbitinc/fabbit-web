import { type MutationFunctionContext, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadSingleFile } from "@/api/file.api";
import { partsKeys, partsMutations } from "@/features/parts/api/parts.queries";
import { invalidatePartsQueries } from "@/features/parts/lib/invalidate-parts-queries";
import { extractApiError } from "@/lib/api-error";

export function useUploadPartPreviewFileAction(partId: string, revisionId: string) {
  const queryClient = useQueryClient();
  const mutation = partsMutations.uploadPreviewFile(partId, revisionId);

  return useMutation({
    mutationKey: mutation.mutationKey,
    mutationFn: async (file: File, context: MutationFunctionContext) => {
      const mutationFn = mutation.mutationFn;

      if (!mutationFn) {
        throw new Error("대표 미리보기 파일 등록 mutationFn이 정의되지 않았습니다.");
      }

      const fileId = await uploadSingleFile(file);
      return mutationFn({ file_id: fileId }, context);
    },
    onSuccess: async () => {
      toast.success("미리보기 파일을 등록했습니다.");
      await Promise.all([
        invalidatePartsQueries(queryClient, partId, revisionId),
        queryClient.invalidateQueries({ queryKey: partsKeys.drawingProcessing(partId, revisionId) }),
      ]);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "미리보기 파일 등록에 실패했습니다."));
    },
  });
}
