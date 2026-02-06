import type { ItemType } from "./common";

// GET /api/v1/projects/tree

export interface ItemTreeDto {
  id: string;
  itemNumber: string;
  name?: string; // 최신 리비전 기준 (optional로 처리)
  itemType: ItemType;
  items?: ItemTreeDto[]; // 하위 아이템 목록 (ASSEMBLY인 경우)
  itemCount: number; // 하위 아이템 개수
}

export interface FolderTreeDto {
  id: string;
  name: string;
  folders: FolderTreeDto[];
  items: ItemTreeDto[];
  itemCount: number; // 아이템 개수
}

export interface ProjectTreeDto {
  id: string;
  name: string;
  folders: FolderTreeDto[];
}

export interface ProjectTreeResponse {
  projects: ProjectTreeDto[];
}
