import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteIssueFile } from "@/features/issue/api/issue.api";
import { invalidateIssueQueries } from "@/features/issue/lib/invalidate-issue-queries";
import { extractApiError } from "@/lib/api-error";

export function useDeleteIssueFileAction(issueNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["issue", issueNumber, "delete-issue-file-action"],
    mutationFn: (fileId: string) => deleteIssueFile(issueNumber, fileId),
    onSuccess: async () => {
      toast.success("첨부파일을 삭제했습니다.");
      await invalidateIssueQueries(queryClient, issueNumber);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "첨부파일 삭제에 실패했습니다."));
    },
  });
}
