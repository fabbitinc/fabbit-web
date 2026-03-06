import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createChangeRequestComment } from "@/features/change-request/api/change-request.api";
import { invalidateChangeRequestQueries } from "@/features/change-request/lib/invalidate-change-request-queries";
import type { RichTextDocument } from "@/lib/rich-text";
import { extractApiError } from "@/lib/api-error";

export function useCreateChangeRequestCommentAction(changeNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["change-request", changeNumber, "create-change-request-comment-action"],
    mutationFn: (body: RichTextDocument) =>
      createChangeRequestComment(changeNumber, {
        body,
      }),
    onSuccess: async () => {
      toast.success("댓글을 등록했습니다.");
      await invalidateChangeRequestQueries(queryClient, changeNumber);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "댓글 등록에 실패했습니다."));
    },
  });
}
