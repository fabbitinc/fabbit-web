import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateChangeRequestComment } from "@/features/change-request/api/change-request.api";
import { invalidateChangeRequestQueries } from "@/features/change-request/lib/invalidate-change-request-queries";
import type { RichTextDocument } from "@/lib/rich-text";
import { extractApiError } from "@/lib/api-error";

interface UpdateChangeRequestCommentActionInput {
  commentId: string;
  body: RichTextDocument;
}

export function useUpdateChangeRequestCommentAction(changeNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["change-request", changeNumber, "update-change-request-comment-action"],
    mutationFn: ({ commentId, body }: UpdateChangeRequestCommentActionInput) =>
      updateChangeRequestComment(changeNumber, commentId, { body }),
    onSuccess: async () => {
      toast.success("댓글을 수정했습니다.");
      await invalidateChangeRequestQueries(queryClient, changeNumber);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "댓글 수정에 실패했습니다."));
    },
  });
}
