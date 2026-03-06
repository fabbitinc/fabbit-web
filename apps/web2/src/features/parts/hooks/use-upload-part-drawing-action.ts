import { type MutationFunctionContext, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadSingleFile } from "@/api/file.api";
import { partsMutations } from "@/features/parts/api/parts.queries";
import { invalidatePartsQueries } from "@/features/parts/lib/invalidate-parts-queries";
import { extractApiError } from "@/lib/api-error";

export function useUploadPartDrawingAction(partId: string) {
  const queryClient = useQueryClient();
  const registerDrawingMutation = partsMutations.registerDrawing(partId);

  return useMutation({
    mutationKey: registerDrawingMutation.mutationKey,
    mutationFn: async (file: File, context: MutationFunctionContext) => {
      const mutationFn = registerDrawingMutation.mutationFn;

      if (!mutationFn) {
        throw new Error("부품 도면 등록 mutationFn이 정의되지 않았습니다.");
      }

      const fileId = await uploadSingleFile(file);
      return mutationFn({ file_id: fileId }, context);
    },
    onSuccess: async () => {
      toast.success("도면을 등록했습니다.");
      await invalidatePartsQueries(queryClient, partId, { includeList: true });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "도면 등록에 실패했습니다."));
    },
  });
}
