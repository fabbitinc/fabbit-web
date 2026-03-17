import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateEngineeringChange } from "@/features/engineering-change/api/engineering-change.api";
import { invalidateEngineeringChangeQueries } from "@/features/engineering-change/lib/invalidate-engineering-change-queries";
import type { RichTextDocument } from "@/lib/rich-text";
import { extractApiError } from "@/lib/api-error";

interface UpdateEngineeringChangeActionInput {
  title: string;
  body: RichTextDocument | null;
}

export function useUpdateEngineeringChangeAction(changeNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["engineering-change", changeNumber, "update-engineering-change-action"],
    mutationFn: ({ title, body }: UpdateEngineeringChangeActionInput) =>
      updateEngineeringChange(changeNumber, {
        title: title.trim(),
        body,
      }),
    onSuccess: async () => {
      toast.success("변경관리를 저장했습니다.");
      await invalidateEngineeringChangeQueries(queryClient, changeNumber, { includeList: true });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "변경관리 저장에 실패했습니다."));
    },
  });
}
