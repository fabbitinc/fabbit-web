import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createEngineeringChangeComment } from "@/features/engineering-change/api/engineering-change.api";
import { invalidateEngineeringChangeQueries } from "@/features/engineering-change/lib/invalidate-engineering-change-queries";
import type { RichTextDocument } from "@/lib/rich-text";
import { extractApiError } from "@/lib/api-error";

export function useCreateEngineeringChangeCommentAction(changeNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["engineering-change", changeNumber, "create-engineering-change-comment-action"],
    mutationFn: (body: RichTextDocument) =>
      createEngineeringChangeComment(changeNumber, {
        body,
      }),
    onSuccess: async () => {
      toast.success("댓글을 등록했습니다.");
      await invalidateEngineeringChangeQueries(queryClient, changeNumber);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "댓글 등록에 실패했습니다."));
    },
  });
}
