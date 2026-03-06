import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createIssueComment } from "@/features/issue/api/issue.api";
import { invalidateIssueQueries } from "@/features/issue/lib/invalidate-issue-queries";
import type { RichTextDocument } from "@/lib/rich-text";
import { extractApiError } from "@/lib/api-error";

export function useCreateIssueCommentAction(issueNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["issue", issueNumber, "create-issue-comment-action"],
    mutationFn: (body: RichTextDocument) =>
      createIssueComment(issueNumber, {
        body,
      }),
    onSuccess: async () => {
      toast.success("댓글을 등록했습니다.");
      await invalidateIssueQueries(queryClient, issueNumber);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "댓글 등록에 실패했습니다."));
    },
  });
}
