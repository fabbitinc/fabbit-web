import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateIssue } from "@/features/issue/api/issue.api";
import { invalidateIssueQueries } from "@/features/issue/lib/invalidate-issue-queries";
import type { RichTextDocument } from "@/lib/rich-text";
import { extractApiError } from "@/lib/api-error";

interface UpdateIssueActionInput {
  title: string;
  body: RichTextDocument | null;
}

export function useUpdateIssueAction(issueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["issue", issueId, "update-issue-action"],
    mutationFn: ({ title, body }: UpdateIssueActionInput) =>
      updateIssue(issueId, {
        title: title.trim(),
        body,
      }),
    onSuccess: async () => {
      toast.success("이슈를 저장했습니다.");
      await invalidateIssueQueries(queryClient, issueId, { includeList: true });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "이슈 저장에 실패했습니다."));
    },
  });
}
