import type { ItemType, ItemStatus } from "./common";

// GET /api/v1/items/{itemId}
// 품목 상세 조회용 (기본 정보만)
export interface ItemDto {
  id: string;
  folderId: string;
  itemNumber: string;
  itemType: ItemType;
  status: ItemStatus;
}

// GET /api/v1/folders/{folderId}/items
// 품목 트리 조회용 (하위 품목 포함)
export interface ItemTreeDto {
  id: string;
  folderId: string;
  itemNumber: string;
  /** 품명 (최신 리비전 기준) */
  name?: string;
  itemType: ItemType;
  status: ItemStatus;
  /** 하위 품목 목록 (ASSEMBLY인 경우) */
  items?: ItemTreeDto[];
  /** 하위 품목 개수 */
  itemCount: number;
}

export interface ItemTreeListResponse {
  items: ItemTreeDto[];
}

export interface CreateItemRequest {
  itemNumber: string;
  itemType: ItemType;
}

// POST /api/v1/projects/{projectId}/folders/{folderId}/items/{itemId}/move
export interface MoveItemRequest {
  newFolderId: string;
}
