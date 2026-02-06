import { apiClient } from "./client";
import type { ItemDto, ItemListResponse, CreateItemRequest, MoveItemRequest } from "./types";

/**
 * 폴더 내 품목 목록 조회
 * GET /api/v1/folders/{folderId}/items
 */
export async function getItems(folderId: string): Promise<ItemListResponse> {
  const response = await apiClient.get<ItemListResponse>(
    `/api/v1/folders/${folderId}/items`
  );
  return response.data;
}

/**
 * 품목 상세 조회
 * GET /api/v1/folders/{folderId}/items/{itemId}
 */
export async function getItem(folderId: string, itemId: string): Promise<ItemDto> {
  const response = await apiClient.get<ItemDto>(
    `/api/v1/folders/${folderId}/items/${itemId}`
  );
  return response.data;
}

/**
 * 품목 생성
 * POST /api/v1/folders/{folderId}/items
 */
export async function createItem(folderId: string, request: CreateItemRequest): Promise<ItemDto> {
  const response = await apiClient.post<ItemDto>(
    `/api/v1/folders/${folderId}/items`,
    request
  );
  return response.data;
}

/**
 * 품목 이동
 * POST /api/v1/folders/{folderId}/items/{itemId}/move
 */
export async function moveItem(
  folderId: string,
  itemId: string,
  request: MoveItemRequest
): Promise<ItemDto> {
  const response = await apiClient.post<ItemDto>(
    `/api/v1/folders/${folderId}/items/${itemId}/move`,
    request
  );
  return response.data;
}

/**
 * 품목 삭제
 * DELETE /api/v1/folders/{folderId}/items/{itemId}
 */
export async function deleteItem(folderId: string, itemId: string): Promise<void> {
  await apiClient.delete(`/api/v1/folders/${folderId}/items/${itemId}`);
}
