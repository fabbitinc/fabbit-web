import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { refreshAuthSession, useAuthStore } from "@/features/auth";
import { deleteOrganizationProfileImage } from "@/features/organization-settings/api/organization-settings.api";
import { extractApiError } from "@/lib/api-error";

export function useDeleteOrganizationProfileImageAction() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationKey: ["organization-settings", "delete-organization-profile-image-action"],
    mutationFn: deleteOrganizationProfileImage,
    onSuccess: async () => {
      const session = await refreshAuthSession(queryClient);
      setSession(session);
      toast.success("조직 프로필 이미지를 제거했습니다.");
    },
    onError: (error) => {
      toast.error(extractApiError(error, "조직 이미지 제거에 실패했습니다."));
    },
  });
}
