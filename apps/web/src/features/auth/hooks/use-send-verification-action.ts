import { useMutation } from "@tanstack/react-query";
import { authMutations } from "@/features/auth/api/auth.queries";

export function useSendVerificationAction() {
  return useMutation(authMutations.sendVerification());
}
