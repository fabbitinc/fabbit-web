import type { ItemData } from "@/features/items/types";
import type { ItemTreeDto, ItemTreeListResponse } from "../types";

/**
 * API ItemTreeDto를 UI ItemData 형식으로 변환
 *
 * API에서 제공하는 필드:
 * - id, folderId, itemNumber, name, itemType, status, items, itemCount
 *
 * TODO: API에 없어서 mock으로 처리되는 필드:
 * - material: undefined
 * - quantity: 1 (기본값, BOM에서만 의미 있음)
 * - unit: "EA" (기본값)
 * - drawingStatus: "none" (RevisionDto에서 조회 필요)
 * - drawingThumbnail: undefined
 * - aiAnalyzed: false
 * - conflicts: undefined
 */
function convertItemTreeDto(item: ItemTreeDto): ItemData {
  return {
    id: item.id,
    partNumber: item.itemNumber,
    // API에서 name 제공 (최신 리비전의 품명), 없으면 itemNumber 사용
    name: item.name ?? item.itemNumber,
    // TODO: material - API에 없음 (RevisionDto.attributes에 있을 수 있음)
    material: undefined,
    // 최상위 품목의 quantity는 1 (BOM에서만 의미 있음)
    quantity: 1,
    // TODO: unit - API에 없음 (BOM에만 있음)
    unit: "EA",
    // TODO: drawingStatus - API에 없음 (RevisionDto에서 조회 필요)
    drawingStatus: "none",
    // TODO: drawingThumbnail - API에 없음
    drawingThumbnail: undefined,
    // TODO: aiAnalyzed - API에 없음
    aiAnalyzed: false,
    // TODO: conflicts - API에 없음
    conflicts: undefined,
    // 하위 품목 (items)을 재귀적으로 변환
    children: item.items?.map(convertItemTreeDto),
  };
}

/**
 * ItemTreeListResponse를 ItemData[] 배열로 변환
 */
export function convertItemListResponse(response: ItemTreeListResponse): ItemData[] {
  return response.items.map(convertItemTreeDto);
}
