import { useQuery } from "@tanstack/react-query";
import { numberingCategoriesKeys } from "@/features/part-number-categories/api/numbering-categories.queries";
import { fetchCheckNumber } from "@/features/part-number-categories/api/numbering-categories.api";

/**
 * 품번 중복 확인 쿼리 훅.
 * partNumber가 비어 있지 않을 때만 자동 실행된다.
 */
export function useCheckNumberQuery(partNumber: string) {
  return useQuery({
    queryKey: numberingCategoriesKeys.checkNumber(partNumber),
    queryFn: () => fetchCheckNumber(partNumber),
    enabled: partNumber.trim().length > 0,
    staleTime: 0,
  });
}
