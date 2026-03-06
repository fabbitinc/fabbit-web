import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createChangeRequest } from "@/features/change-request/api/change-request.api";
import { extractApiError } from "@/lib/api-error";

export function useCreateChangeRequestAction() {
  return useMutation({
    mutationKey: ["change-request", "create-change-request-action"],
    mutationFn: createChangeRequest,
    onSuccess: () => {
      toast.success("변경 요청을 생성했습니다.");
    },
    onError: (error) => {
      toast.error(extractApiError(error, "변경 요청 생성에 실패했습니다."));
    },
  });
}
