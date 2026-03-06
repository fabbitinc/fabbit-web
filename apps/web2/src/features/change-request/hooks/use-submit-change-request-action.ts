import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { submitChangeRequest } from "@/features/change-request/api/change-request.api";
import { invalidateChangeRequestQueries } from "@/features/change-request/lib/invalidate-change-request-queries";
import { extractApiError } from "@/lib/api-error";

export function useSubmitChangeRequestAction(changeNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["change-request", changeNumber, "submit-change-request-action"],
    mutationFn: () => submitChangeRequest(changeNumber),
    onSuccess: async () => {
      toast.success("변경 요청을 제출했습니다.");
      await invalidateChangeRequestQueries(queryClient, changeNumber, { includeList: true });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "변경 요청 제출에 실패했습니다."));
    },
  });
}
