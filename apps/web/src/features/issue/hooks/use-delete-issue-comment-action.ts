import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteIssueComment } from "@/features/issue/api/issue.api";
import { invalidateIssueQueries } from "@/features/issue/lib/invalidate-issue-queries";
import { extractApiError } from "@/lib/api-error";

export function useDeleteIssueCommentAction(issueNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["issue", issueNumber, "delete-issue-comment-action"],
    mutationFn: (commentId: string) => deleteIssueComment(issueNumber, commentId),
    onSuccess: async () => {
      toast.success("댓글을 삭제했습니다.");
      await invalidateIssueQueries(queryClient, issueNumber);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "댓글 삭제에 실패했습니다."));
    },
  });
}
