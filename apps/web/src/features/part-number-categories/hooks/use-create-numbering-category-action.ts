import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { numberingCategoriesKeys, numberingCategoriesMutations } from "@/features/part-number-categories/api/numbering-categories.queries";
import { extractApiError } from "@/lib/api-error";
import type { NumberingCategoryModel } from "@/features/part-number-categories/types/numbering-categories.types";

interface UseCreateNumberingCategoryActionOptions {
  onSuccess?: (category: NumberingCategoryModel) => void;
}

export function useCreateNumberingCategoryAction(options?: UseCreateNumberingCategoryActionOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    ...numberingCategoriesMutations.create(),
    onSuccess: async (category) => {
      toast.success("카테고리를 추가했습니다.");
      await queryClient.invalidateQueries({ queryKey: numberingCategoriesKeys.list() });
      options?.onSuccess?.(category);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "카테고리 추가에 실패했습니다."));
    },
  });
}
