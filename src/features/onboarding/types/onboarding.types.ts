// 온보딩 스텝 정의 (4단계: 업로드, 매핑, 처리, 탐색)
export type OnboardingStep = 1 | 2 | 3 | 4;

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

export interface UploadLimits {
  bomFiles: number | null;
  drawingFiles: number | null;
  totalStorageGB: number;
  bomLabel: string;
  drawingLabel: string;
  storageLabel: string;
}

// Step 2: AI 매핑
export type ConfidenceLevel = "high" | "medium" | "low";

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 90) return "high";
  if (confidence >= 70) return "medium";
  return "low";
}

// 컬럼 매핑 (API column_mapping + 프론트 확장)
export interface ColumnMappingEntry {
  id: string;
  source_column: string;
  target_label: string;
  target_property: string;
  data_type: string;
  confidence: number;
  reason: string;
  approved: boolean;
}

// 관계 매핑 (API relation_mapping + 프론트 확장)
export interface RelationMappingEntry {
  id: string;
  from_label: string;
  to_label: string;
  rel_type: string;
  from_columns: Record<string, string>;
  to_columns: Record<string, string>;
  properties: Record<string, string>;
  property_types: Record<string, string>;
  approved: boolean;
  dismissed: boolean;
  dismissed_reason?: string | null;
}

// 타겟 속성 옵션 (향후 온톨로지 API에서 로드)
export interface TargetPropertyOption {
  label: string;
  property: string;
  description: string;
  required: boolean;
  data_type: string;
}

// Step 3: 데이터 처리
export type ProcessingPhase = "parsing" | "normalizing" | "connecting" | "validating";

export interface ProcessingStep {
  phase: ProcessingPhase;
  label: string;
  status: "pending" | "in_progress" | "completed";
}

export interface ProcessingStats {
  nodesCreated: number;
  relationsCreated: number;
  totalNodes: number;
  totalRelations: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

// Step 4: 탐색
export interface HealthCheckItem {
  category: string;
  label: string;
  count: number;
  severity: "info" | "warning" | "error";
  description: string;
}

export interface HealthCheckReport {
  score: number;
  totalNodes: number;
  totalRelations: number;
  items: HealthCheckItem[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface SuggestedQuestion {
  id: string;
  question: string;
  category: string;
}
