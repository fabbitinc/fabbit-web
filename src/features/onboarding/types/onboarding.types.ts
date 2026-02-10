// 온보딩 스텝 정의
export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// Step 3: 플랜 선택
export type PlanTier = "free" | "pro" | "elite";

export interface PlanOption {
  tier: PlanTier;
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

export interface OnboardingStepInfo {
  step: OnboardingStep;
  title: string;
  description: string;
  path: string;
}

// Step 2: 워크스페이스 설정
export interface WorkspaceFormData {
  organizationName: string;
  slug: string;
  industry: string;
  teamSize: string;
  role: string;
}

// Step 1: 계정 생성
export interface SignupFormData {
  name: string;
  email: string;
  password: string;
}

// Step 4: 데이터 업로드
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
}

export interface UploadLimits {
  bomFiles: number | null;
  drawingFiles: number | null;
  totalStorageGB: number;
  bomLabel: string;
  drawingLabel: string;
  storageLabel: string;
}

// Step 4: AI 매핑
export type ConfidenceLevel = "high" | "medium" | "low";

export interface SourceColumn {
  id: string;
  name: string;
  sampleData: string[];
  mappedTo?: string;
}

export interface TargetProperty {
  id: string;
  name: string;
  label: string;
  category: string;
  required: boolean;
  description: string;
  mappedFrom?: string;
}

export interface MappingConnection {
  id: string;
  sourceId: string;
  targetId: string;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  approved: boolean;
}

// Step 5: 데이터 처리
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

// Step 6: 탐색
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
