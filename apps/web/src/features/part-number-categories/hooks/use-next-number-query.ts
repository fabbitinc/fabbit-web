import { useQuery } from "@tanstack/react-query";
import { numberingCategoriesQueries } from "@/features/part-number-categories/api/numbering-categories.queries";

export function useNextNumberQuery(categoryId: string | undefined) {
  return useQuery({
    ...numberingCategoriesQueries.nextNumber(categoryId ?? ""),
    enabled: !!categoryId,
  });
}
