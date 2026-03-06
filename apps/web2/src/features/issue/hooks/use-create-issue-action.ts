import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createIssue } from "@/features/issue/api/issue.api";
import { extractApiError } from "@/lib/api-error";

export function useCreateIssueAction() {
  return useMutation({
    mutationKey: ["issue", "create-issue-action"],
    mutationFn: createIssue,
    onSuccess: () => {
      toast.success("이슈를 생성했습니다.");
    },
    onError: (error) => {
      toast.error(extractApiError(error, "이슈 생성에 실패했습니다."));
    },
  });
}
