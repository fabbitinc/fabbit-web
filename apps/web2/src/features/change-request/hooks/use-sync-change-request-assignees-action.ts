import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { syncChangeRequestAssignees } from "@/features/change-request/api/change-request.api";
import { invalidateChangeRequestQueries } from "@/features/change-request/lib/invalidate-change-request-queries";
import { extractApiError } from "@/lib/api-error";

export function useSyncChangeRequestAssigneesAction(changeNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["change-request", changeNumber, "sync-change-request-assignees-action"],
    mutationFn: (userIds: string[]) =>
      syncChangeRequestAssignees(changeNumber, {
        user_ids: userIds,
      }),
    onSuccess: async () => {
      toast.success("담당자를 갱신했습니다.");
      await invalidateChangeRequestQueries(queryClient, changeNumber);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "담당자 변경에 실패했습니다."));
    },
  });
}
