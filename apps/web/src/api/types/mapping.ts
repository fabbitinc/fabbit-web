// ─── Mapping ───

export interface PropertyMappingDTO {
  source_column: string;
  target_property: string;
  data_type: string;
  confidence: number;
  reason: string;
  is_extended?: boolean;
}

export interface RelationMappingDTO {
  rel_type: string;
  target_label: string;
  node_columns: Record<string, string>;
  rel_columns: Record<string, string>;
  rel_column_types: Record<string, string>;
  confidence: number;
  reason: string;
}

export interface MappingResultDTO {
  property_mappings: PropertyMappingDTO[];
  relation_mappings: RelationMappingDTO[];
}

export interface MappingPreviewRequest {
  file_id: string;
  sheet_name?: string | null;
}

export interface SheetPreviewDTO {
  sheet_name: string;
  headers: string[];
  sample_rows: Record<string, string>[];
  mapping: MappingResultDTO;
}

export interface SkippedSheetDTO {
  sheet_name: string;
  reason: string;
}

export interface RelationCatalogItemDTO {
  rel_type: string;
  from_label: string;
  to_label: string;
  description: string;
}

export interface RelationPropertyCatalogItemDTO {
  rel_type: string;
  property: string;
  data_type: string;
  required: boolean;
  description: string;
}

export interface EditableConstraintsDTO {
  allowed_part_properties: string[];
  merge_keys_by_label: Record<string, string[]>;
  relation_catalog: RelationCatalogItemDTO[];
  relation_property_catalog: RelationPropertyCatalogItemDTO[];
}

export interface MappingPreviewResponse {
  headers: string[];
  sample_rows: Record<string, string>[];
  mapping: MappingResultDTO;
  sheets: SheetPreviewDTO[];
  skipped_sheets: SkippedSheetDTO[];
  editable_constraints?: EditableConstraintsDTO;
}

export interface MappingConfirmRequest {
  file_id: string;
  name: string;
  sheet_name?: string | null;
  mapping: MappingResultDTO;
}

export interface MappingResponse {
  id: string;
  file_id: string;
  name: string;
  sheet_name?: string | null;
  original_headers: string[];
  mapped_headers: string[];
  mapping: MappingResultDTO;
  scope: string;
  is_active: boolean;
  usage_count: number;
  version: number;
  created_at: string;
}

export interface MappingListResponse {
  items: MappingResponse[];
}

export interface MappingUpdateRequest {
  file_id: string;
  sheet_name?: string | null;
  mapping: MappingResultDTO;
  name?: string | null;
}

export interface MappingValidateRequest {
  file_id: string;
  sheet_name?: string | null;
  mapping: MappingResultDTO;
}

export interface MappingImpactSummary {
  disabled_column_count?: number;
}

export interface ValidationIssue {
  code: string;
  severity: "error" | "warning";
  message: string;
  path?: string;
  dismissed_reason?: string | null;
}

export interface MappingValidateResponse {
  normalized_mapping: MappingResultDTO;
  errors?: ValidationIssue[];
  warnings?: ValidationIssue[];
  impact_summary?: MappingImpactSummary;
}
