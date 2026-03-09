import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { reopenChangeRequest } from "@/features/change-request/api/change-request.api";
import { invalidateChangeRequestQueries } from "@/features/change-request/lib/invalidate-change-request-queries";
import { extractApiError } from "@/lib/api-error";

export function useReopenChangeRequestAction(changeNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["change-request", changeNumber, "reopen-change-request-action"],
    mutationFn: () => reopenChangeRequest(changeNumber),
    onSuccess: async () => {
      toast.success("변경 요청을 다시 열었습니다.");
      await invalidateChangeRequestQueries(queryClient, changeNumber, { includeList: true });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "변경 요청 다시 열기에 실패했습니다."));
    },
  });
}
