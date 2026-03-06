import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteChangeRequestComment } from "@/features/change-request/api/change-request.api";
import { invalidateChangeRequestQueries } from "@/features/change-request/lib/invalidate-change-request-queries";
import { extractApiError } from "@/lib/api-error";

export function useDeleteChangeRequestCommentAction(changeNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["change-request", changeNumber, "delete-change-request-comment-action"],
    mutationFn: (commentId: string) => deleteChangeRequestComment(changeNumber, commentId),
    onSuccess: async () => {
      toast.success("댓글을 삭제했습니다.");
      await invalidateChangeRequestQueries(queryClient, changeNumber);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "댓글 삭제에 실패했습니다."));
    },
  });
}
