import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteChangeRequestFile } from "@/features/change-request/api/change-request.api";
import { invalidateChangeRequestQueries } from "@/features/change-request/lib/invalidate-change-request-queries";
import { extractApiError } from "@/lib/api-error";

export function useDeleteChangeRequestFileAction(changeNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["change-request", changeNumber, "delete-change-request-file-action"],
    mutationFn: (fileId: string) => deleteChangeRequestFile(changeNumber, fileId),
    onSuccess: async () => {
      toast.success("첨부파일을 삭제했습니다.");
      await invalidateChangeRequestQueries(queryClient, changeNumber);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "첨부파일 삭제에 실패했습니다."));
    },
  });
}
