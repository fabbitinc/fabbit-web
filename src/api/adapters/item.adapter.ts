import type { ItemData } from "@/features/items/types";
import type { ItemDto, ItemListResponse } from "../types";

/**
 * API ItemDto를 UI ItemData 형식으로 변환
 *
 * TODO: API에 없어서 mock으로 처리되는 필드:
 * - name: itemNumber를 사용
 * - material: undefined
 * - quantity: 1 (기본값)
 * - unit: "EA" (기본값)
 * - drawingStatus: "none"
 * - drawingThumbnail: undefined
 * - aiAnalyzed: false
 * - conflicts: undefined
 * - children: undefined (BOM 조회 필요)
 */
function convertItemDto(item: ItemDto): ItemData {
  return {
    id: item.id,
    partNumber: item.itemNumber,
    // TODO: name - API ItemDto에 없음, itemNumber로 대체
    name: item.itemNumber,
    // TODO: material - API에 없음
    material: undefined,
    // TODO: quantity - API에 없음 (BOM에만 있음), 기본값 1
    quantity: 1,
    // TODO: unit - API에 없음 (BOM에만 있음), 기본값 "EA"
    unit: "EA",
    // TODO: drawingStatus - API에 없음 (RevisionDto에 있음), 기본값 "none"
    drawingStatus: "none",
    // TODO: drawingThumbnail - API에 없음 (RevisionDto에 있음)
    drawingThumbnail: undefined,
    // TODO: aiAnalyzed - API에 없음
    aiAnalyzed: false,
    // TODO: conflicts - API에 없음
    conflicts: undefined,
    // TODO: children - BOM API 조회 필요
    children: undefined,
  };
}

/**
 * ItemListResponse를 ItemData[] 배열로 변환
 */
export function convertItemListResponse(response: ItemListResponse): ItemData[] {
  return response.items.map(convertItemDto);
}
