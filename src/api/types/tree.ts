import type { ItemTreeDto } from "./item";

// GET /api/v1/projects/tree

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
