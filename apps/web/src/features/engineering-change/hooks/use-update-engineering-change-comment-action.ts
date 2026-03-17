import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateEngineeringChangeComment } from "@/features/engineering-change/api/engineering-change.api";
import { invalidateEngineeringChangeQueries } from "@/features/engineering-change/lib/invalidate-engineering-change-queries";
import type { RichTextDocument } from "@/lib/rich-text";
import { extractApiError } from "@/lib/api-error";

interface UpdateEngineeringChangeCommentActionInput {
  commentId: string;
  body: RichTextDocument;
}

export function useUpdateEngineeringChangeCommentAction(changeNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["engineering-change", changeNumber, "update-engineering-change-comment-action"],
    mutationFn: ({ commentId, body }: UpdateEngineeringChangeCommentActionInput) =>
      updateEngineeringChangeComment(changeNumber, commentId, { body }),
    onSuccess: async () => {
      toast.success("댓글을 수정했습니다.");
      await invalidateEngineeringChangeQueries(queryClient, changeNumber);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "댓글 수정에 실패했습니다."));
    },
  });
}
