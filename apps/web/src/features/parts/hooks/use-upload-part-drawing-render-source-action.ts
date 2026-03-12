import { type MutationFunctionContext, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadSingleFile } from "@/api/file.api";
import { partsKeys, partsMutations } from "@/features/parts/api/parts.queries";
import { invalidatePartsQueries } from "@/features/parts/lib/invalidate-parts-queries";
import type { PartDetailModel } from "@/features/parts/types/parts-model";
import { extractApiError } from "@/lib/api-error";

interface UseUploadPartDrawingRenderSourceActionParams {
  drawingId: string | null;
  partId: string;
}

export function useUploadPartDrawingRenderSourceAction({
  drawingId,
  partId,
}: UseUploadPartDrawingRenderSourceActionParams) {
  const queryClient = useQueryClient();
  const registerRenderSourceMutation = partsMutations.registerDrawingRenderSource(
    drawingId ?? "__empty__",
  );

  return useMutation({
    mutationKey: registerRenderSourceMutation.mutationKey,
    mutationFn: async (file: File, context: MutationFunctionContext) => {
      const mutationFn = registerRenderSourceMutation.mutationFn;

      if (!mutationFn || !drawingId) {
        throw new Error("도면 render source 등록 대상이 정의되지 않았습니다.");
      }

      const fileId = await uploadSingleFile(file);
      return mutationFn({ file_id: fileId }, context);
    },
    onSuccess: async (conversionStatus) => {
      queryClient.setQueryData<PartDetailModel | undefined>(
        partsKeys.detail(partId),
        (current) => {
          if (!current?.drawing || current.drawing.id !== drawingId) {
            return current;
          }

          return {
            ...current,
            drawing: {
              ...current.drawing,
              conversionStatus: conversionStatus ?? current.drawing.conversionStatus,
              failureCode: null,
              failureMessage: null,
              webViewRequirement: null,
            },
          };
        },
      );

      toast.success("웹 보기용 파일을 등록했습니다.");

      await Promise.all([
        invalidatePartsQueries(queryClient, partId),
        queryClient.invalidateQueries({
          queryKey: partsKeys.drawingProcessing(drawingId),
        }),
      ]);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "웹 보기용 파일 등록에 실패했습니다."));
    },
  });
}
