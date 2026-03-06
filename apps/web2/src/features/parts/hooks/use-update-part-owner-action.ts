import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updatePartOwner } from "@/features/parts/api/parts.api";
import { invalidatePartsQueries } from "@/features/parts/lib/invalidate-parts-queries";
import { extractApiError } from "@/lib/api-error";

interface UpdatePartOwnerActionInput {
  ownerId?: string | null;
  ownerTeamId?: string | null;
}

export function useUpdatePartOwnerAction(partId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePartOwnerActionInput) =>
      updatePartOwner(partId, {
        owner_id: input.ownerId,
        owner_team_id: input.ownerTeamId,
      }),
    onSuccess: async () => {
      toast.success("담당자 설정을 저장했습니다.");
      await invalidatePartsQueries(queryClient, partId);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "담당자 설정 저장에 실패했습니다."));
    },
  });
}
