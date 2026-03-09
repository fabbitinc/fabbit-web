import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateChangeRequest } from "@/features/change-request/api/change-request.api";
import { invalidateChangeRequestQueries } from "@/features/change-request/lib/invalidate-change-request-queries";
import type { RichTextDocument } from "@/lib/rich-text";
import { extractApiError } from "@/lib/api-error";

interface UpdateChangeRequestActionInput {
  title: string;
  body: RichTextDocument | null;
}

export function useUpdateChangeRequestAction(changeNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["change-request", changeNumber, "update-change-request-action"],
    mutationFn: ({ title, body }: UpdateChangeRequestActionInput) =>
      updateChangeRequest(changeNumber, {
        title: title.trim(),
        body,
      }),
    onSuccess: async () => {
      toast.success("변경 요청을 저장했습니다.");
      await invalidateChangeRequestQueries(queryClient, changeNumber, { includeList: true });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "변경 요청 저장에 실패했습니다."));
    },
  });
}
