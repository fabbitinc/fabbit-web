import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createProject } from "@/features/projects-list/api/projects-list.api";
import {
  projectsListKeys,
  projectsListMutations,
} from "@/features/projects-list/api/projects-list.queries";
import { useProjectsListStore } from "@/features/projects-list/stores/projects-list-store";
import { extractApiError } from "@/lib/api-error";

interface CreateProjectActionInput {
  name: string;
  description: string;
}

interface UseCreateProjectActionOptions {
  onSuccess?: (projectId: string) => void;
}

export function useCreateProjectAction(options?: UseCreateProjectActionOptions) {
  const queryClient = useQueryClient();
  const resetCreateDraft = useProjectsListStore((state) => state.resetCreateDraft);
  const closeCreateDialog = useProjectsListStore((state) => state.closeCreateDialog);

  return useMutation({
    ...projectsListMutations.create(),
    mutationKey: ["projects-list", "create-project-action"],
    mutationFn: async ({ name, description }: CreateProjectActionInput) =>
      createProject({
        name: name.trim(),
        description: description.trim() || undefined,
      }),
    onSuccess: async (project) => {
      resetCreateDraft();
      closeCreateDialog();
      toast.success("프로젝트를 생성했습니다.");
      await queryClient.invalidateQueries({ queryKey: projectsListKeys.lists() });
      options?.onSuccess?.(project.id);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "프로젝트 생성에 실패했습니다."));
    },
  });
}
