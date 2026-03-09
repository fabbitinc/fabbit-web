import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { mergeChangeRequest } from "@/features/change-request/api/change-request.api";
import { invalidateChangeRequestQueries } from "@/features/change-request/lib/invalidate-change-request-queries";
import { extractApiError } from "@/lib/api-error";

export function useMergeChangeRequestAction(changeNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["change-request", changeNumber, "merge-change-request-action"],
    mutationFn: () => mergeChangeRequest(changeNumber),
    onSuccess: async () => {
      toast.success("변경 요청을 반영했습니다.");
      await invalidateChangeRequestQueries(queryClient, changeNumber, { includeList: true });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "변경 요청 반영에 실패했습니다."));
    },
  });
}
