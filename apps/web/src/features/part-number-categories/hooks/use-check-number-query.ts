import { useQuery, useQueryClient } from "@tanstack/react-query";
import { numberingCategoriesKeys } from "@/features/part-number-categories/api/numbering-categories.queries";
import { fetchCheckNumber } from "@/features/part-number-categories/api/numbering-categories.api";

/**
 * 품번 중복 확인 쿼리 훅.
 * enabled는 항상 false로 두고, refetch()로 수동 트리거한다 (blur 시점에 호출).
 */
export function useCheckNumberQuery(partNumber: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: numberingCategoriesKeys.checkNumber(partNumber),
    queryFn: () => fetchCheckNumber(partNumber),
    enabled: false,
    staleTime: 0,
  });

  const check = () => {
    if (!partNumber.trim()) {
      return;
    }
    queryClient.fetchQuery({
      queryKey: numberingCategoriesKeys.checkNumber(partNumber),
      queryFn: () => fetchCheckNumber(partNumber),
      staleTime: 0,
    });
  };

  return { ...query, check };
}
