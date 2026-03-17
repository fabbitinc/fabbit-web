import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteEngineeringChangeFile } from "@/features/engineering-change/api/engineering-change.api";
import { invalidateEngineeringChangeQueries } from "@/features/engineering-change/lib/invalidate-engineering-change-queries";
import { extractApiError } from "@/lib/api-error";

export function useDeleteEngineeringChangeFileAction(changeNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["engineering-change", changeNumber, "delete-engineering-change-file-action"],
    mutationFn: (fileId: string) => deleteEngineeringChangeFile(changeNumber, fileId),
    onSuccess: async () => {
      toast.success("첨부파일을 삭제했습니다.");
      await invalidateEngineeringChangeQueries(queryClient, changeNumber);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "첨부파일 삭제에 실패했습니다."));
    },
  });
}
