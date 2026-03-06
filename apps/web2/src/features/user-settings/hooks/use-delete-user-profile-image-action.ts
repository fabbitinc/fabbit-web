import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { refreshAuthSession, useAuthStore } from "@/features/auth";
import { deleteUserProfileImage } from "@/features/user-settings/api/user-settings.api";
import { extractApiError } from "@/lib/api-error";

export function useDeleteUserProfileImageAction() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationKey: ["user-settings", "delete-user-profile-image-action"],
    mutationFn: deleteUserProfileImage,
    onSuccess: async () => {
      const session = await refreshAuthSession(queryClient);
      setSession(session);
      toast.success("프로필 이미지를 제거했습니다.");
    },
    onError: (error) => {
      toast.error(extractApiError(error, "프로필 이미지 제거에 실패했습니다."));
    },
  });
}
