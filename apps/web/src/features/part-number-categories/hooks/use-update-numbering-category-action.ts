import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { numberingCategoriesKeys, numberingCategoriesMutations } from "@/features/part-number-categories/api/numbering-categories.queries";
import { extractApiError } from "@/lib/api-error";

export function useUpdateNumberingCategoryAction(categoryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    ...numberingCategoriesMutations.update(categoryId),
    onSuccess: async () => {
      toast.success("카테고리를 수정했습니다.");
      await queryClient.invalidateQueries({ queryKey: numberingCategoriesKeys.list() });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "카테고리 수정에 실패했습니다."));
    },
  });
}
