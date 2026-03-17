import { type MutationFunctionContext, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadFiles } from "@/api/file.api";
import { partsMutations } from "@/features/parts/api/parts.queries";
import { invalidatePartsQueries } from "@/features/parts/lib/invalidate-parts-queries";
import { extractApiError } from "@/lib/api-error";

interface UploadPartDrawingActionInput {
  files: File[];
  skipSuccessToast?: boolean;
}

export function useUploadPartDrawingAction(partId: string) {
  const queryClient = useQueryClient();
  const registerDrawingMutation = partsMutations.registerDrawing(partId);

  return useMutation({
    mutationKey: registerDrawingMutation.mutationKey,
    mutationFn: async (
      { files }: UploadPartDrawingActionInput,
      context: MutationFunctionContext,
    ) => {
      const mutationFn = registerDrawingMutation.mutationFn;

      if (!mutationFn) {
        throw new Error("부품 도면 등록 mutationFn이 정의되지 않았습니다.");
      }

      const fileIds = await uploadFiles(files);

      return Promise.all(
        fileIds.map((fileId) => mutationFn({ file_id: fileId }, context)),
      );
    },
    onSuccess: (drawings, { skipSuccessToast }) => {
      if (skipSuccessToast) {
        return;
      }

      toast.success(
        drawings.length > 1
          ? `${drawings.length}개의 도면을 등록했습니다.`
          : "도면을 등록했습니다.",
      );
    },
    onSettled: async () => {
      await invalidatePartsQueries(queryClient, partId, { includeList: true });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "도면 등록에 실패했습니다."));
    },
  });
}
