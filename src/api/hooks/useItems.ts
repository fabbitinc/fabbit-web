import { useQuery } from "@tanstack/react-query";
import { getItems } from "../item";
import { convertItemListResponse } from "../adapters";
import { mockItems } from "@/features/items/mock-data";

export const ITEMS_QUERY_KEY = ["items"] as const;

/**
 * 폴더 내 품목 목록 조회 훅
 *
 * @param folderId 폴더 ID
 * @returns ItemData[] 형식의 품목 목록
 *
 * TODO: API에 없어서 mock으로 처리되는 필드:
 * - name, material, quantity, unit, drawingStatus, drawingThumbnail, aiAnalyzed, conflicts, children
 *
 * [Mock 데이터]
 * mock- 으로 시작하는 folderId는 mockItems에서 데이터를 반환
 */
export function useItems(folderId: string | null) {
  return useQuery({
    queryKey: [...ITEMS_QUERY_KEY, folderId],
    queryFn: async () => {
      if (!folderId) return [];
      // Mock 폴더인 경우 mock 데이터 반환
      if (folderId.startsWith("mock-")) {
        return mockItems[folderId] ?? [];
      }
      const response = await getItems(folderId);
      return convertItemListResponse(response);
    },
    enabled: !!folderId,
  });
}
