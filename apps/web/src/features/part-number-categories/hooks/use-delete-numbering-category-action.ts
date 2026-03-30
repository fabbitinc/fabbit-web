import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { numberingCategoriesKeys, numberingCategoriesMutations } from "@/features/part-number-categories/api/numbering-categories.queries";
import { extractApiError } from "@/lib/api-error";

export function useDeleteNumberingCategoryAction(categoryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    ...numberingCategoriesMutations.delete(categoryId),
    onSuccess: async () => {
      toast.success("삭제했습니다.");
      await queryClient.invalidateQueries({ queryKey: numberingCategoriesKeys.list() });
    },
    onError: (error) => {
      toast.error(
        extractApiError(error, {
          fallback: "채번 규칙 삭제에 실패했습니다.",
          statusMessages: {
            400: "사용 중인 규칙은 삭제할 수 없습니다.",
          },
        }),
      );
    },
  });
}
