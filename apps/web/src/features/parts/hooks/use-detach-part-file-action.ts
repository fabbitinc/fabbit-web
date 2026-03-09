import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { detachPartFile } from "@/features/parts/api/parts.api";
import { invalidatePartsQueries } from "@/features/parts/lib/invalidate-parts-queries";
import { extractApiError } from "@/lib/api-error";

export function useDetachPartFileAction(partId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["parts", partId, "detach-part-file-action"],
    mutationFn: (fileId: string) => detachPartFile(partId, fileId),
    onSuccess: async () => {
      toast.success("파일 연결을 해제했습니다.");
      await invalidatePartsQueries(queryClient, partId);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "파일 제거에 실패했습니다."));
    },
  });
}
