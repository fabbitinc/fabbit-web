import { useQuery } from "@tanstack/react-query";
import {
  getPartFilterOptions,
  listParts,
  getPartDetail,
  getPartBomTree,
} from "../parts";
import type { ListPartsParams } from "../types/parts";

export const PART_FILTER_OPTIONS_QUERY_KEY = ["partFilterOptions"] as const;
export const PARTS_QUERY_KEY = ["parts"] as const;
export const PART_DETAIL_QUERY_KEY = ["partDetail"] as const;
export const PART_BOM_TREE_QUERY_KEY = ["partBomTree"] as const;

/** Part 필터 옵션 조회 훅 */
export function usePartFilterOptions() {
  return useQuery({
    queryKey: PART_FILTER_OPTIONS_QUERY_KEY,
    queryFn: getPartFilterOptions,
  });
}

/** Part 목록 조회 훅 */
export function useParts(params: ListPartsParams) {
  return useQuery({
    queryKey: [...PARTS_QUERY_KEY, params],
    queryFn: () => listParts(params),
  });
}

/** Part 상세 조회 훅 */
export function usePartDetail(partId: string | undefined) {
  return useQuery({
    queryKey: [...PART_DETAIL_QUERY_KEY, partId],
    queryFn: () => getPartDetail(partId!),
    enabled: !!partId,
  });
}

/** Part BOM 트리 조회 훅 */
export function usePartBomTree(partId: string | undefined) {
  return useQuery({
    queryKey: [...PART_BOM_TREE_QUERY_KEY, partId],
    queryFn: () => getPartBomTree(partId!),
    enabled: !!partId,
  });
}
