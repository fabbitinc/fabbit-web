import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { changeUserPassword } from "@/features/user-settings/api/user-settings.api";
import { extractApiError } from "@/lib/api-error";

interface ChangePasswordActionInput {
  currentPassword: string;
  newPassword: string;
}

export function useChangePasswordAction() {
  return useMutation({
    mutationKey: ["user-settings", "change-password-action"],
    mutationFn: ({ currentPassword, newPassword }: ChangePasswordActionInput) =>
      changeUserPassword({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    onSuccess: () => {
      toast.success("비밀번호를 변경했습니다.");
    },
    onError: (error) => {
      toast.error(extractApiError(error, "비밀번호 변경에 실패했습니다."));
    },
  });
}
