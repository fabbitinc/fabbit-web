import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { removeProjectMembers } from "@/features/project-detail/api/project-detail.api";
import {
  projectDetailKeys,
} from "@/features/project-detail/api/project-detail.queries";
import { extractApiError } from "@/lib/api-error";

export function useRemoveProjectMembersAction(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["project-detail", projectId, "remove-project-members-action"],
    mutationFn: async (userIds: string[]) =>
      removeProjectMembers(projectId, {
        user_ids: userIds,
      }),
    onSuccess: async () => {
      toast.success("프로젝트 멤버를 제거했습니다.");
      await queryClient.invalidateQueries({ queryKey: projectDetailKeys.members(projectId) });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "프로젝트 멤버 제거에 실패했습니다."));
    },
  });
}
