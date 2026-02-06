import type { ItemType, ItemStatus } from "./common";

// GET /api/v1/projects/{projectId}/folders/{folderId}/items
// POST /api/v1/projects/{projectId}/folders/{folderId}/items

export interface ItemDto {
  id: string;
  folderId: string;
  itemNumber: string;
  itemType: ItemType;
  status: ItemStatus;
}

export interface ItemListResponse {
  items: ItemDto[];
}

export interface CreateItemRequest {
  itemNumber: string;
  itemType: ItemType;
}

// POST /api/v1/projects/{projectId}/folders/{folderId}/items/{itemId}/move
export interface MoveItemRequest {
  newFolderId: string;
}
