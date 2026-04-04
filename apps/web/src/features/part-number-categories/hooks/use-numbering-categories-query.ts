import { useQuery } from "@tanstack/react-query";
import { numberingCategoriesQueries } from "@/features/part-number-categories/api/numbering-categories.queries";

export function useNumberingCategoriesQuery() {
  return useQuery(numberingCategoriesQueries.list());
}
