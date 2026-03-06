import { useMutation } from "@tanstack/react-query";
import { authMutations } from "@/features/auth/api/auth.queries";

export function useVerifyEmailAction() {
  return useMutation(authMutations.verifyEmail());
}
