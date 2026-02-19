// ─── Upload ───

export interface CreateUploadRequest {
  original_name: string;
  content_type: string;
  file_size: number;
  owner_type?: string;
  owner_id?: string;
}

export interface CreateUploadResponse {
  upload_id: string;
  upload_url: string;
  file_key: string;
}

export interface BatchCreateUploadRequest {
  items: CreateUploadRequest[];
}

export interface BatchCreateUploadResponse {
  items: CreateUploadResponse[];
}

export interface BatchCompleteRequest {
  upload_ids: string[];
}

export interface UploadCompleteResponse {
  upload_id: string;
  status: string;
  original_name: string;
  file_key: string;
  file_size: number;
  content_type: string;
  created_at: string;
}

export interface BatchCompleteFailure {
  upload_id: string;
  reason: string;
}

export interface BatchCompleteResponse {
  items: UploadCompleteResponse[];
  failed: BatchCompleteFailure[];
}

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
  upload_id: string;
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
  upload_id: string;
  name: string;
  sheet_name?: string | null;
  mapping: MappingResultDTO;
}

export interface MappingResponse {
  id: string;
  upload_id: string;
  name: string;
  sheet_name?: string | null;
  original_headers: string[];
  mapping: MappingResultDTO;
  usage_count: number;
  version: number;
  created_at: string;
  is_active?: boolean;
}

export interface MappingListResponse {
  items: MappingResponse[];
}

export interface MappingUpdateRequest {
  upload_id: string;
  sheet_name?: string | null;
  mapping: MappingResultDTO;
  name?: string | null;
}

export interface MappingValidateRequest {
  upload_id: string;
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

// ─── Synthesis ───

export interface SynthesisStartRequest {
  upload_id: string;
  mapping_id?: string | null;
}

export interface SynthesisJobResponse {
  id: string;
  mapping_id: string;
  upload_id: string;
  status: string;
  total_rows: number;
  processed_rows: number;
  nodes_created: number;
  relationships_created: number;
  errors: string[];
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface SynthesisListResponse {
  items: SynthesisJobResponse[];
}

// ─── Ontology ───

export interface PropertySchemaDTO {
  name: string;
  description: string;
  data_type: string;
  required: boolean;
  is_merge_key: boolean;
}

export interface NodeLabelSchemaDTO {
  label: string;
  description: string;
  properties: PropertySchemaDTO[];
  merge_keys: string[];
}

export interface RelationshipTypeSchemaDTO {
  rel_type: string;
  description: string;
  from_label: string;
  to_label: string;
  properties: PropertySchemaDTO[];
}

export interface OntologySchemaResponse {
  name: string;
  description: string;
  node_labels: NodeLabelSchemaDTO[];
  relationship_types: RelationshipTypeSchemaDTO[];
}

// ─── Activation ───

export interface HealthCheckIssueDTO {
  category: string;
  severity: string;
  message: string;
  count: number;
}

export interface HealthCheckResponse {
  total_nodes: number;
  total_relationships: number;
  node_counts: Record<string, number>;
  relationship_counts: Record<string, number>;
  issues: HealthCheckIssueDTO[];
}

export interface QueryRequest {
  question: string;
}

export interface QueryResponse {
  cypher_query: string;
  results: Record<string, unknown>[];
  answer: string;
}

export interface StarterQuestionDTO {
  question: string;
  description: string;
}

export interface StartersResponse {
  starters: StarterQuestionDTO[];
}
