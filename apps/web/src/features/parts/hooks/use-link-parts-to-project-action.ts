import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { linkPartsToProject } from "@/features/parts/api/parts.api";
import { partsKeys } from "@/features/parts/api/parts.queries";
import { extractApiError } from "@/lib/api-error";

interface LinkPartsToProjectActionInput {
  projectId: string;
  partIds: string[];
}

export function useLinkPartsToProjectAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["parts", "link-parts-to-project-action"],
    mutationFn: ({ projectId, partIds }: LinkPartsToProjectActionInput) =>
      linkPartsToProject(projectId, {
        part_ids: partIds,
      }),
    onSuccess: async (response) => {
      toast.success(`${response.linked_count}건의 부품을 프로젝트에 연결했습니다.`);
      await queryClient.invalidateQueries({ queryKey: partsKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "프로젝트 연결에 실패했습니다."));
    },
  });
}
