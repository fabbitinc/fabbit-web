import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addChangeRequestFiles } from "@/features/change-request/api/change-request.api";
import { invalidateChangeRequestQueries } from "@/features/change-request/lib/invalidate-change-request-queries";
import { extractApiError } from "@/lib/api-error";

export function useAddChangeRequestFilesAction(changeNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["change-request", changeNumber, "add-change-request-files-action"],
    mutationFn: (fileIds: string[]) =>
      addChangeRequestFiles(changeNumber, {
        file_ids: fileIds,
      }),
    onSuccess: async (_, fileIds) => {
      toast.success(`${fileIds.length}개의 파일을 첨부했습니다.`);
      await invalidateChangeRequestQueries(queryClient, changeNumber);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "파일 첨부에 실패했습니다."));
    },
  });
}
