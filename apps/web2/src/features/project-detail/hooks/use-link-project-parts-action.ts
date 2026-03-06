import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { linkProjectParts } from "@/features/project-detail/api/project-detail.api";
import {
  projectDetailKeys,
} from "@/features/project-detail/api/project-detail.queries";
import { useProjectDetailStore } from "@/features/project-detail/stores/project-detail-store";
import { extractApiError } from "@/lib/api-error";

export function useLinkProjectPartsAction(projectId: string) {
  const queryClient = useQueryClient();
  const resetPartDialog = useProjectDetailStore((state) => state.resetPartDialog);

  return useMutation({
    mutationKey: ["project-detail", projectId, "link-project-parts-action"],
    mutationFn: async (partIds: string[]) =>
      linkProjectParts(projectId, {
        part_ids: partIds,
      }),
    onSuccess: async (response) => {
      resetPartDialog();
      toast.success(`${response.linked_count}개의 부품을 프로젝트에 연결했습니다.`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["project-detail", projectId, "parts"] }),
        queryClient.invalidateQueries({ queryKey: projectDetailKeys.detail(projectId) }),
      ]);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "부품 연결에 실패했습니다."));
    },
  });
}
