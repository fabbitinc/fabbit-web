// --- Parts API 타입 ---

export interface PartSummary {
  id: string;
  part_number: string;
  name: string | null;
  category: string | null;
  revision: string | null;
  lifecycle_state: string | null;
  drawing_number: string | null;
  children_count: number;
}

export interface PartListResponse {
  total: number;
  offset: number;
  limit: number;
  items: PartSummary[];
}

export interface PartFilterOptions {
  categories: string[];
  lifecycle_states: string[];
}

export interface ListPartsParams {
  search?: string;
  category?: string;
  lifecycle_state?: string;
  has_drawing?: boolean;
  has_children?: boolean;
  offset?: number;
  limit?: number;
}

// --- Part 첨부 파일 ---

export interface PartFileItem {
  file_id: string;
  original_name: string;
  content_type: string;
  file_size: number;
  file_url: string | null;
  created_at: string;
}

export interface AttachFilesRequest {
  file_ids: string[];
}

// --- Part 상세 ---

export interface PartDetailResponse {
  id: string;
  part_number: string;
  name: string | null;
  revision: string | null;
  material: string | null;
  unit: string | null;
  description: string | null;
  category: string | null;
  lifecycle_state: string | null;
  is_phantom: boolean | null;
  lead_time_days: number | null;
  extended_properties: Record<string, unknown>;
  children: BomChild[];
  parents: BomParent[];
  drawing: RelatedDrawing | null;
  suppliers: RelatedSupplier[];
  files: PartFileItem[];
}

export interface BomChild {
  id: string;
  part_number: string;
  name: string | null;
  quantity: number;
  extended_properties: Record<string, unknown>;
}

export interface BomParent {
  id: string;
  part_number: string;
  name: string | null;
  quantity: number;
  extended_properties: Record<string, unknown>;
}

export interface RelatedDrawing {
  id: string;
  drawing_number: string;
  name: string | null;
  version: string | null;
  status: string | null;
  conversion_status: string | null;
  thumbnail_url: string | null;
  pdf_url: string | null;
  original_file_url: string | null;
}

export interface RelatedSupplier {
  company_name: string;
  code: string | null;
  country: string | null;
  unit_cost: number | null;
}

export interface BomTreeNode {
  id: string;
  part_number: string;
  name: string | null;
  revision: string;
  material: string | null;
  unit: string | null;
  category: string | null;
  lifecycle_state: string | null;
  quantity: number;
  children: BomTreeNode[];
}

export interface BomTreeResponse {
  root: BomTreeNode;
  direction: string;
  total_count: number;
}

// POST /api/v1/parts/{part_id}/drawings

// --- 내보내기 ---

export interface ExportPartsParams {
  search?: string;
  category?: string;
  lifecycle_state?: string;
  has_drawing?: boolean;
  has_children?: boolean;
  mapping_id?: string;
  part_ids?: string[]; // 선택 내려받기용
}

export interface ExportBomParams {
  direction?: "forward" | "reverse";
  mapping_id?: string;
}

export interface RegisterDrawingRequest {
  file_id: string;
}

export interface RegisterDrawingResponse {
  drawing_id: string;
  drawing_number: string;
  name: string;
  conversion_status: string | null;
}
