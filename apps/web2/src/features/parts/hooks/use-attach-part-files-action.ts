import { type MutationFunctionContext, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadFiles } from "@/api/file.api";
import { partsMutations } from "@/features/parts/api/parts.queries";
import { invalidatePartsQueries } from "@/features/parts/lib/invalidate-parts-queries";
import { extractApiError } from "@/lib/api-error";

export function useAttachPartFilesAction(partId: string) {
  const queryClient = useQueryClient();
  const attachFilesMutation = partsMutations.attachFiles(partId);

  return useMutation({
    mutationKey: attachFilesMutation.mutationKey,
    mutationFn: async (files: File[], context: MutationFunctionContext) => {
      const mutationFn = attachFilesMutation.mutationFn;

      if (!mutationFn) {
        throw new Error("부품 파일 연결 mutationFn이 정의되지 않았습니다.");
      }

      const fileIds = await uploadFiles(files);
      return mutationFn({ file_ids: fileIds }, context);
    },
    onSuccess: async (_, files) => {
      toast.success(`${files.length}개의 파일을 연결했습니다.`);
      await invalidatePartsQueries(queryClient, partId);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "파일 연결에 실패했습니다."));
    },
  });
}
