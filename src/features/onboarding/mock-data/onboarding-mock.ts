import type {
  UploadLimits,
  ColumnMappingEntry,
  RelationMappingEntry,
  TargetPropertyOption,
  ProcessingStep,
  LogEntry,
  HealthCheckReport,
  SuggestedQuestion,
  ChatMessage,
} from "../types/onboarding.types";
import type { PlanTier } from "@/features/registration/types/registration.types";

// 온보딩 스텝 정보
export const onboardingSteps = [
  { step: 1 as const, title: "데이터 업로드", description: "데이터를 업로드합니다", path: "/onboarding/upload" },
  { step: 2 as const, title: "데이터 처리", description: "지식화를 진행합니다", path: "/onboarding/processing" },
  { step: 3 as const, title: "AI 매핑", description: "데이터를 매핑합니다", path: "/onboarding/mapping" },
  { step: 4 as const, title: "탐색", description: "데이터를 탐색합니다", path: "/onboarding/explore" },
];

// 플랜별 업로드 제한
export const uploadLimitsByPlan: Record<PlanTier, UploadLimits> = {
  starter: {
    bomFiles: 50,
    drawingFiles: 10,
    totalStorageGB: 2,
    bomLabel: "50건/월",
    drawingLabel: "10건/월",
    storageLabel: "2GB",
  },
  team: {
    bomFiles: 3000,
    drawingFiles: 300,
    totalStorageGB: 100,
    bomLabel: "3,000건/월",
    drawingLabel: "300건/월",
    storageLabel: "100GB",
  },
  enterprise: {
    bomFiles: 30000,
    drawingFiles: 3000,
    totalStorageGB: 1000,
    bomLabel: "30,000건/월",
    drawingLabel: "3,000건/월",
    storageLabel: "1TB",
  },
};

// ─── AI 매핑 Mock 데이터 (실제 API 응답 구조 기반) ───

export const mockMappingHeaders: string[] = [
  "상위품번", "상위품명", "하위품번", "하위품명", "수량", "단위", "재질", "공급업체", "비고",
];

export const mockMappingSampleRows: Record<string, string>[] = [
  { "상위품번": "ASM-001", "상위품명": "메인 프레임 조립품", "하위품번": "PRT-001", "하위품명": "브라켓", "수량": "2", "단위": "EA", "재질": "SS400", "공급업체": "한국정밀", "비고": "지지용 브라켓" },
  { "상위품번": "ASM-001", "상위품명": "메인 프레임 조립품", "하위품번": "PRT-002", "하위품명": "드라이브 샤프트", "수량": "1", "단위": "EA", "재질": "AL6061-T6", "공급업체": "삼성기계", "비고": "메인 구동축" },
  { "상위품번": "ASM-001", "상위품명": "메인 프레임 조립품", "하위품번": "PRT-003", "하위품명": "볼베어링", "수량": "4", "단위": "EA", "재질": "SUS304", "공급업체": "NSK코리아", "비고": "6205-2RS" },
  { "상위품번": "ASM-001", "상위품명": "메인 프레임 조립품", "하위품번": "PRT-004", "하위품명": "커버 플레이트", "수량": "1", "단위": "EA", "재질": "SS400", "공급업체": "한국정밀", "비고": "상부 커버" },
  { "상위품번": "PRT-001", "상위품명": "브라켓", "하위품번": "PRT-005", "하위품명": "육각볼트 M10", "수량": "4", "단위": "EA", "재질": "SCM435", "공급업체": "대한볼트", "비고": "체결용" },
];

// 컬럼 매핑 (confidence ≥ 95 → approved, is_extended로 기본/확장 구분)
export const mockColumnMappings: ColumnMappingEntry[] = [
  { id: "cm-1", source_column: "상위품번", target_property: "part_number", data_type: "string", confidence: 95, reason: "Header directly indicates parent part number (merge key).", approved: true },
  { id: "cm-2", source_column: "하위품번", target_property: "part_number", data_type: "string", confidence: 95, reason: "Header directly indicates child part number (merge key).", approved: true },
  { id: "cm-3", source_column: "상위품명", target_property: "name", data_type: "string", confidence: 90, reason: "Header corresponds to part name for the parent part.", approved: false },
  { id: "cm-4", source_column: "하위품명", target_property: "name", data_type: "string", confidence: 95, reason: "Header corresponds to part name for the child part.", approved: true },
  { id: "cm-5", source_column: "단위", target_property: "unit", data_type: "string", confidence: 90, reason: "Header matches ontology 'unit' (UOM) meaning.", approved: false },
  { id: "cm-6", source_column: "재질", target_property: "material", data_type: "string", confidence: 95, reason: "Header directly maps to material/specified substance.", approved: true },
  { id: "cm-7", source_column: "비고", target_property: "description", data_type: "string", confidence: 90, reason: "Remarks column contains descriptive notes appropriate for description.", approved: false },
  { id: "cm-8", source_column: "공급업체", target_property: "company_name", data_type: "string", confidence: 95, reason: "Header directly indicates supplier/company name (merge key).", approved: true },
];

// 관계 매핑 (새 API 구조: target_label, node_columns, rel_columns, rel_column_types)
export const mockRelationMappings: RelationMappingEntry[] = [
  {
    id: "rm-1",
    rel_type: "CONSISTS_OF",
    target_label: "Part",
    node_columns: { part_number: "상위품번" },
    rel_columns: { "수량": "quantity" },
    rel_column_types: { quantity: "integer" },
    confidence: 90,
    reason: "BOM hierarchy detected from parent/child part number columns.",
    approved: false,
    dismissed: false,
  },
  {
    id: "rm-2",
    rel_type: "SUPPLIED_BY",
    target_label: "Supplier",
    node_columns: { company_name: "공급업체" },
    rel_columns: {},
    rel_column_types: {},
    confidence: 85,
    reason: "Supplier column mapped to SUPPLIED_BY relationship.",
    approved: false,
    dismissed: false,
  },
];

// 타겟 속성 스키마 (향후 GET /api/v1/ontology/schema 에서 로드)
export const targetPropertySchema: TargetPropertyOption[] = [
  { label: "Part", property: "part_number", description: "품번", required: true, data_type: "string" },
  { label: "Part", property: "name", description: "품명", required: true, data_type: "string" },
  { label: "Part", property: "material", description: "재질", required: false, data_type: "string" },
  { label: "Part", property: "unit", description: "단위", required: false, data_type: "string" },
  { label: "Part", property: "unit_price", description: "단가", required: false, data_type: "float" },
  { label: "Part", property: "specification", description: "규격", required: false, data_type: "string" },
  { label: "Part", property: "description", description: "설명", required: false, data_type: "string" },
  { label: "Supplier", property: "company_name", description: "공급사명", required: true, data_type: "string" },
  { label: "Supplier", property: "contact", description: "담당자", required: false, data_type: "string" },
  { label: "Supplier", property: "lead_time", description: "납기 (일)", required: false, data_type: "integer" },
  { label: "Drawing", property: "drawing_number", description: "도면번호", required: false, data_type: "string" },
  { label: "Drawing", property: "revision", description: "리비전", required: false, data_type: "string" },
];

// ─── 처리/탐색 Mock 데이터 ───

export const mockProcessingSteps: ProcessingStep[] = [
  { phase: "uploading", label: "파일 업로드 확인", status: "pending" },
  { phase: "parsing", label: "데이터 파싱", status: "pending" },
  { phase: "normalizing", label: "정규화 및 병합", status: "pending" },
  { phase: "connecting", label: "관계 연결", status: "pending" },
  { phase: "validating", label: "검증 및 최적화", status: "pending" },
];

export const mockLogMessages: LogEntry[] = [
  { id: "log-1", timestamp: "00:00", message: "데이터 파싱을 시작합니다...", type: "info" },
  { id: "log-2", timestamp: "00:02", message: "BOM_Master.xlsx: 1,247행 감지", type: "info" },
  { id: "log-3", timestamp: "00:05", message: "Part 노드 850개 생성 완료", type: "success" },
  { id: "log-4", timestamp: "00:08", message: "중복 품번 발견: ASM-001 (2건) → 병합 처리", type: "warning" },
  { id: "log-5", timestamp: "00:12", message: "정규화 처리 중... 공급사명 통합", type: "info" },
  { id: "log-6", timestamp: "00:15", message: "'삼성전자(주)' ↔ '삼성전자' 동일 공급사로 병합", type: "info" },
  { id: "log-7", timestamp: "00:18", message: "Supplier 노드 120개 생성 완료", type: "success" },
  { id: "log-8", timestamp: "00:22", message: "BOM 관계 연결 중...", type: "info" },
  { id: "log-9", timestamp: "00:28", message: "SUPPLIES 관계 350개 연결 완료", type: "success" },
  { id: "log-10", timestamp: "00:30", message: "HAS_DRAWING 관계 680개 연결 완료", type: "success" },
  { id: "log-11", timestamp: "00:33", message: "고립 노드 5개 감지 → 검토 필요", type: "warning" },
  { id: "log-12", timestamp: "00:35", message: "검증 완료: 데이터 무결성 98.5%", type: "success" },
  { id: "log-13", timestamp: "00:36", message: "지식 그래프 구축이 완료되었습니다!", type: "success" },
];

export const mockHealthCheckReport: HealthCheckReport = {
  score: 85,
  totalNodes: 3450,
  totalRelations: 8920,
  items: [
    { category: "누락", label: "도면 미연결 품목", count: 15, severity: "warning", description: "BOM에 등록되었으나 도면 파일이 연결되지 않은 부품입니다." },
    { category: "누락", label: "공급사 미지정 품목", count: 3, severity: "error", description: "핵심 품목이지만 공급사 정보가 없습니다." },
    { category: "고립", label: "고립 노드", count: 5, severity: "warning", description: "어떤 프로젝트나 조립체에도 속하지 않은 부품입니다." },
    { category: "품질", label: "중복 의심 품번", count: 8, severity: "info", description: "유사한 품번이 발견되어 병합을 검토해야 합니다." },
    { category: "품질", label: "단가 이상치", count: 2, severity: "warning", description: "동일 품목의 단가가 크게 차이나는 건이 있습니다." },
  ],
};

export const mockSuggestedQuestions: SuggestedQuestion[] = [
  { id: "q-1", question: "단가가 가장 높은 상위 5개 품목을 보여주세요", category: "비용 분석" },
  { id: "q-2", question: "공급사가 1곳뿐인 핵심 부품은 몇 개인가요?", category: "리스크 분석" },
  { id: "q-3", question: "SUS304 재질을 사용하는 모든 부품을 알려주세요", category: "재질 탐색" },
  { id: "q-4", question: "납기가 20일 이상인 공급사 목록을 보여주세요", category: "납기 관리" },
  { id: "q-5", question: "도면이 없는 부품 중 가장 비싼 것은?", category: "데이터 품질" },
  { id: "q-6", question: "A 공급사가 공급 중단되면 영향받는 프로젝트는?", category: "영향도 분석" },
];

export const mockInitialChatMessages: ChatMessage[] = [
  {
    id: "chat-1",
    role: "assistant",
    content: "안녕하세요! 지식 그래프 구축이 완료되었습니다. 3,450개의 노드와 8,920개의 관계가 생성되었어요. 궁금한 점을 자유롭게 물어보세요!",
    timestamp: new Date().toISOString(),
  },
];

export const mockAIResponses: Record<string, string> = {
  "단가가 가장 높은 상위 5개 품목을 보여주세요":
    "단가 기준 상위 5개 품목입니다:\n\n| 순위 | 품번 | 품명 | 단가 |\n|------|------|------|------|\n| 1 | ASM-001 | 메인 프레임 | ₩125,000 |\n| 2 | MOT-205 | 서보 모터 | ₩98,000 |\n| 3 | PCB-102 | 제어 보드 | ₩45,000 |\n| 4 | GER-008 | 감속기 어셈블리 | ₩38,500 |\n| 5 | SNS-041 | 정밀 센서 모듈 | ₩32,000 |\n\n메인 프레임(ASM-001)이 가장 높은 단가를 보이며, 전체 BOM 비용의 약 15%를 차지합니다.",
  "공급사가 1곳뿐인 핵심 부품은 몇 개인가요?":
    "단일 공급사에 의존하는 핵심 부품이 **7개** 발견되었습니다.\n\n주요 리스크 품목:\n- **ASM-001** (메인 프레임) - 삼성전자(주) 단독 공급\n- **MOT-205** (서보 모터) - 모터테크 단독 공급\n- **SNS-041** (정밀 센서) - 센서월드 단독 공급\n\n이 부품들은 공급 중단 시 프로젝트 전체에 영향을 줄 수 있어 대체 공급사 확보를 권장합니다.",
};
