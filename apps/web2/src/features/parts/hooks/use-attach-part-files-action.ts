import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { partsMutations } from "@/features/parts/api/parts.queries";
import { invalidatePartsQueries } from "@/features/parts/lib/invalidate-parts-queries";
import { extractApiError } from "@/lib/api-error";

export function useAttachPartFilesAction(partId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    ...partsMutations.attachFiles(partId),
    onSuccess: async (_, request) => {
      toast.success(`${request.file_ids.length}개의 파일을 연결했습니다.`);
      await invalidatePartsQueries(queryClient, partId);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "파일 연결에 실패했습니다."));
    },
  });
}
