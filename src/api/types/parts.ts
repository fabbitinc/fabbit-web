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
  drawings: RelatedDrawing[];
  suppliers: RelatedSupplier[];
}

export interface BomChild {
  part_number: string;
  name: string | null;
  quantity: number;
  extended_properties: Record<string, unknown>;
}

export interface BomParent {
  part_number: string;
  name: string | null;
  quantity: number;
  extended_properties: Record<string, unknown>;
}

export interface RelatedDrawing {
  drawing_number: string;
  name: string | null;
  version: string | null;
  status: string | null;
}

export interface RelatedSupplier {
  company_name: string;
  code: string | null;
  country: string | null;
  unit_cost: number | null;
}

export interface BomTreeNode {
  part_number: string;
  name: string | null;
  quantity: number;
  reference_designator: string | null;
  children: BomTreeNode[];
}

export interface BomTreeResponse {
  root: BomTreeNode;
}
