import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { projectDetailMutations } from "@/features/project-detail/api/project-detail.queries";
import { projectsListKeys } from "@/features/projects-list/api/projects-list.queries";
import { extractApiError } from "@/lib/api-error";

interface UseDeleteProjectActionOptions {
  onSuccess?: () => void;
}

export function useDeleteProjectAction(projectId: string, options?: UseDeleteProjectActionOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    ...projectDetailMutations.delete(projectId),
    mutationKey: ["project-detail", projectId, "delete-project-action"],
    onSuccess: async () => {
      toast.success("프로젝트를 삭제했습니다.");
      await queryClient.invalidateQueries({ queryKey: projectsListKeys.lists() });
      options?.onSuccess?.();
    },
    onError: (error) => {
      toast.error(extractApiError(error, "프로젝트 삭제에 실패했습니다."));
    },
  });
}
