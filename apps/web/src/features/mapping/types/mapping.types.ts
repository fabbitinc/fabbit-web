// Step 1: 데이터 업로드
export type FileCategory = "bom" | "drawing";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  category: FileCategory;
  relativePath?: string;
  status: "pending" | "uploading" | "completed" | "failed";
  progress: number;
  error?: string;
  // API에서 받은 업로드 ID
  uploadId?: string;
  // 원본 File 객체 (presigned URL 업로드용)
  file?: File;
}

// Step 2: AI 매핑
export type ConfidenceLevel = "high" | "medium" | "low";

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 90) return "high";
  if (confidence >= 70) return "medium";
  return "low";
}

// 속성 매핑 (API property_mapping + 프론트 확장)
// is_extended=true이면 확장 속성, 아니면 기본 속성
export interface ColumnMappingEntry {
  id: string;
  source_column: string;
  target_property: string;
  data_type: string;
  confidence: number;
  reason: string;
  approved: boolean;
  is_extended?: boolean;
}

// 관계 매핑 (API relation_mapping + 프론트 확장)
export interface RelationMappingEntry {
  id: string;
  rel_type: string;
  target_label: string;
  node_columns: Record<string, string>;
  rel_columns: Record<string, string>;
  rel_column_types: Record<string, string>;
  confidence: number;
  reason: string;
  approved: boolean;
  dismissed: boolean;
  dismissed_reason?: string | null;
}

export interface RelationTargetInfo {
  targetLabel: string;
  targetMergeKeys: string[];
  targetColumnOptions: string[];
  targetProperties?: string[];
}

// 타겟 속성 옵션 (향후 온톨로지 API에서 로드)
export interface TargetPropertyOption {
  label: string;
  property: string;
  description: string;
  required: boolean;
  data_type: string;
  is_merge_key?: boolean;
}
