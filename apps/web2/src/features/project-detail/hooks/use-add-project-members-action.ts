import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addProjectMembers } from "@/features/project-detail/api/project-detail.api";
import {
  projectDetailKeys,
} from "@/features/project-detail/api/project-detail.queries";
import { useProjectDetailStore } from "@/features/project-detail/stores/project-detail-store";
import type { ProjectRole } from "@/features/project-detail/types/project-detail-model";
import { extractApiError } from "@/lib/api-error";

interface AddProjectMembersActionInput {
  userIds: string[];
  role: ProjectRole;
}

export function useAddProjectMembersAction(projectId: string) {
  const queryClient = useQueryClient();
  const resetMemberDialog = useProjectDetailStore((state) => state.resetMemberDialog);

  return useMutation({
    mutationKey: ["project-detail", projectId, "add-project-members-action"],
    mutationFn: async ({ userIds, role }: AddProjectMembersActionInput) =>
      addProjectMembers(projectId, {
        user_ids: userIds,
        role,
      }),
    onSuccess: async (response) => {
      resetMemberDialog();
      toast.success(`${response.count}명을 프로젝트에 추가했습니다.`);
      await queryClient.invalidateQueries({ queryKey: projectDetailKeys.members(projectId) });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "프로젝트 멤버 추가에 실패했습니다."));
    },
  });
}
