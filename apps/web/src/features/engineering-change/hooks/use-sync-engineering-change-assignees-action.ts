import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { syncEngineeringChangeAssignees } from "@/features/engineering-change/api/engineering-change.api";
import { invalidateEngineeringChangeQueries } from "@/features/engineering-change/lib/invalidate-engineering-change-queries";
import { extractApiError } from "@/lib/api-error";

export function useSyncEngineeringChangeAssigneesAction(changeNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["engineering-change", changeNumber, "sync-engineering-change-assignees-action"],
    mutationFn: (userIds: string[]) =>
      syncEngineeringChangeAssignees(changeNumber, {
        user_ids: userIds,
      }),
    onSuccess: async () => {
      toast.success("담당자를 갱신했습니다.");
      await invalidateEngineeringChangeQueries(queryClient, changeNumber);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "담당자 변경에 실패했습니다."));
    },
  });
}
