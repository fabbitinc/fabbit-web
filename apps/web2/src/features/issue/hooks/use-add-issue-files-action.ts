import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addIssueFiles } from "@/features/issue/api/issue.api";
import { invalidateIssueQueries } from "@/features/issue/lib/invalidate-issue-queries";
import { extractApiError } from "@/lib/api-error";

export function useAddIssueFilesAction(issueNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["issue", issueNumber, "add-issue-files-action"],
    mutationFn: (fileIds: string[]) =>
      addIssueFiles(issueNumber, {
        file_ids: fileIds,
      }),
    onSuccess: async (_, fileIds) => {
      toast.success(`${fileIds.length}개의 파일을 첨부했습니다.`);
      await invalidateIssueQueries(queryClient, issueNumber);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "파일 첨부에 실패했습니다."));
    },
  });
}
