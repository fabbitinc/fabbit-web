// GET /api/v1/projects/tree
// openapi.json 원문(snake_case) 기준 타입

export interface ProjectTreeMetaDto {
  project_count: number;
  folder_count: number;
}

export interface FolderStatsDto {
  drawing_count?: number;
}

export interface ProjectStatsDto {
  upload_count?: number;
  drawing_count?: number;
  folder_count?: number;
}

export interface TreeItemNodeDto {
  id?: string;
  name?: string | null;
  item_number?: string;
  item_type?: "PART" | "ASSEMBLY";
  item_count?: number;
  items?: TreeItemNodeDto[];
  status?: string;
  has_drawing?: boolean;
}

export interface FolderTreeDto {
  id: string;
  name: string;
  parent_id?: string | null;
  project_id?: string | null;
  created_at: string;
  stats?: FolderStatsDto;
  folders?: FolderTreeDto[];
  items?: TreeItemNodeDto[];
  item_count?: number;
}

export interface ProjectTreeDto {
  id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  stats?: ProjectStatsDto;
  folders?: FolderTreeDto[];
}

export interface ProjectTreeResponse {
  projects?: ProjectTreeDto[];
  orphans?: FolderTreeDto[];
  meta: ProjectTreeMetaDto;
}
