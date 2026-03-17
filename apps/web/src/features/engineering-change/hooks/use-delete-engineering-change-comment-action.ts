import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteEngineeringChangeComment } from "@/features/engineering-change/api/engineering-change.api";
import { invalidateEngineeringChangeQueries } from "@/features/engineering-change/lib/invalidate-engineering-change-queries";
import { extractApiError } from "@/lib/api-error";

export function useDeleteEngineeringChangeCommentAction(changeNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["engineering-change", changeNumber, "delete-engineering-change-comment-action"],
    mutationFn: (commentId: string) => deleteEngineeringChangeComment(changeNumber, commentId),
    onSuccess: async () => {
      toast.success("댓글을 삭제했습니다.");
      await invalidateEngineeringChangeQueries(queryClient, changeNumber);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "댓글 삭제에 실패했습니다."));
    },
  });
}
