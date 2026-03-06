import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateProject } from "@/features/project-detail/api/project-detail.api";
import {
  projectDetailKeys,
} from "@/features/project-detail/api/project-detail.queries";
import { projectsListKeys } from "@/features/projects-list/api/projects-list.queries";
import { extractApiError } from "@/lib/api-error";

interface UpdateProjectActionInput {
  projectId: string;
  name: string;
  description: string;
}

export function useUpdateProjectAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["project-detail", "update-project-action"],
    mutationFn: async ({ projectId, name, description }: UpdateProjectActionInput) =>
      updateProject(projectId, {
        name: name.trim(),
        description: description.trim() || null,
      }),
    onSuccess: async (project) => {
      toast.success("프로젝트 정보를 저장했습니다.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: projectDetailKeys.detail(project.id) }),
        queryClient.invalidateQueries({ queryKey: projectsListKeys.lists() }),
      ]);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "프로젝트 저장에 실패했습니다."));
    },
  });
}
