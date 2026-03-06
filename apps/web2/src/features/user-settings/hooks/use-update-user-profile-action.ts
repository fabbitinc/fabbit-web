import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { refreshAuthSession, useAuthStore } from "@/features/auth";
import { updateUserProfile } from "@/features/user-settings/api/user-settings.api";
import { extractApiError } from "@/lib/api-error";

interface UpdateUserProfileActionInput {
  name: string;
  phone: string;
}

export function useUpdateUserProfileAction() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationKey: ["user-settings", "update-user-profile-action"],
    mutationFn: async ({ name, phone }: UpdateUserProfileActionInput) =>
      updateUserProfile({
        full_name: name || null,
        phone: phone || null,
      }),
    onSuccess: async () => {
      const session = await refreshAuthSession(queryClient);
      setSession(session);
      toast.success("프로필을 저장했습니다.");
    },
    onError: (error) => {
      toast.error(extractApiError(error, "프로필 저장에 실패했습니다."));
    },
  });
}
