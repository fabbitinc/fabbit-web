import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateIssueComment } from "@/features/issue/api/issue.api";
import { invalidateIssueQueries } from "@/features/issue/lib/invalidate-issue-queries";
import type { RichTextDocument } from "@/lib/rich-text";
import { extractApiError } from "@/lib/api-error";

interface UpdateIssueCommentActionInput {
  commentId: string;
  body: RichTextDocument;
}

export function useUpdateIssueCommentAction(issueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["issue", issueId, "update-issue-comment-action"],
    mutationFn: ({ commentId, body }: UpdateIssueCommentActionInput) =>
      updateIssueComment(issueId, commentId, { body }),
    onSuccess: async () => {
      toast.success("댓글을 수정했습니다.");
      await invalidateIssueQueries(queryClient, issueId);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "댓글 수정에 실패했습니다."));
    },
  });
}
