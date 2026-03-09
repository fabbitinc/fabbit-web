import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { unlinkProjectParts } from "@/features/project-detail/api/project-detail.api";
import {
  projectDetailKeys,
} from "@/features/project-detail/api/project-detail.queries";
import { extractApiError } from "@/lib/api-error";

export function useUnlinkProjectPartsAction(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["project-detail", projectId, "unlink-project-parts-action"],
    mutationFn: async (partIds: string[]) =>
      unlinkProjectParts(projectId, {
        part_ids: partIds,
      }),
    onSuccess: async () => {
      toast.success("부품 연결을 해제했습니다.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["project-detail", projectId, "parts"] }),
        queryClient.invalidateQueries({ queryKey: projectDetailKeys.detail(projectId) }),
      ]);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "부품 연결 해제에 실패했습니다."));
    },
  });
}
