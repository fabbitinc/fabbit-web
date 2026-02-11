import type {
  UploadLimits,
  SourceColumn,
  TargetProperty,
  MappingConnection,
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
  { step: 2 as const, title: "AI 매핑", description: "데이터를 매핑합니다", path: "/onboarding/mapping" },
  { step: 3 as const, title: "데이터 처리", description: "지식화를 진행합니다", path: "/onboarding/processing" },
  { step: 4 as const, title: "탐색", description: "데이터를 탐색합니다", path: "/onboarding/explore" },
];

// 플랜별 업로드 제한
export const uploadLimitsByPlan: Record<PlanTier, UploadLimits> = {
  free: {
    bomFiles: 10,
    drawingFiles: 50,
    totalStorageGB: 1,
    bomLabel: "최대 10건",
    drawingLabel: "최대 50장",
    storageLabel: "1GB",
  },
  pro: {
    bomFiles: null,
    drawingFiles: 500,
    totalStorageGB: 50,
    bomLabel: "무제한",
    drawingLabel: "월 500장",
    storageLabel: "50GB",
  },
  elite: {
    bomFiles: null,
    drawingFiles: null,
    totalStorageGB: 500,
    bomLabel: "무제한",
    drawingLabel: "무제한",
    storageLabel: "500GB",
  },
};

// Step 1: 원본 컬럼 (Source Data)
export const mockSourceColumns: SourceColumn[] = [
  { id: "src-1", name: "Part No.", sampleData: ["ASM-001", "PCB-102", "M-BOLT-03"] },
  { id: "src-2", name: "품명", sampleData: ["메인 프레임", "제어 보드", "고정 볼트"] },
  { id: "src-3", name: "재질", sampleData: ["SUS304", "FR-4", "SCM435"] },
  { id: "src-4", name: "수량", sampleData: ["1", "2", "48"] },
  { id: "src-5", name: "단가 (원)", sampleData: ["125,000", "45,000", "350"] },
  { id: "src-6", name: "공급처", sampleData: ["삼성전자(주)", "대한부품", "볼트코리아"] },
  { id: "src-7", name: "납기(일)", sampleData: ["14", "21", "7"] },
  { id: "src-8", name: "도면번호", sampleData: ["DWG-001-R3", "DWG-102-R1", ""] },
  { id: "src-9", name: "비고", sampleData: ["핵심 부품", "", "표준품"] },
  { id: "src-10", name: "열처리 규격", sampleData: ["HRC 45-50", "", "HRC 38-42"] },
];

// Step 1: 표준 속성 (Target Ontology)
export const mockTargetProperties: TargetProperty[] = [
  { id: "tgt-1", name: "part_number", label: "Part", category: "Part", required: true, description: "품번" },
  { id: "tgt-2", name: "name", label: "Part", category: "Part", required: true, description: "품명" },
  { id: "tgt-3", name: "material", label: "Part", category: "Part", required: false, description: "재질" },
  { id: "tgt-4", name: "unit_price", label: "Part", category: "Part", required: false, description: "단가" },
  { id: "tgt-5", name: "quantity", label: "BOM", category: "BOM", required: true, description: "수량" },
  { id: "tgt-6", name: "supplier_name", label: "Supplier", category: "Supplier", required: true, description: "공급사명" },
  { id: "tgt-7", name: "lead_time", label: "Supplier", category: "Supplier", required: false, description: "납기 (일)" },
  { id: "tgt-8", name: "drawing_number", label: "Drawing", category: "Drawing", required: false, description: "도면 번호" },
  { id: "tgt-9", name: "_ext_remark", label: "Part", category: "확장 속성", required: false, description: "비고 (확장)" },
  { id: "tgt-10", name: "_ext_heat_treatment", label: "Part", category: "확장 속성", required: false, description: "열처리 규격 (확장)" },
];

// Step 1: AI 매핑 연결
export const mockMappingConnections: MappingConnection[] = [
  { id: "conn-1", sourceId: "src-1", targetId: "tgt-1", confidence: 98, confidenceLevel: "high", approved: true },
  { id: "conn-2", sourceId: "src-2", targetId: "tgt-2", confidence: 95, confidenceLevel: "high", approved: true },
  { id: "conn-3", sourceId: "src-3", targetId: "tgt-3", confidence: 92, confidenceLevel: "high", approved: true },
  { id: "conn-4", sourceId: "src-4", targetId: "tgt-5", confidence: 88, confidenceLevel: "medium", approved: false },
  { id: "conn-5", sourceId: "src-5", targetId: "tgt-4", confidence: 85, confidenceLevel: "medium", approved: false },
  { id: "conn-6", sourceId: "src-6", targetId: "tgt-6", confidence: 78, confidenceLevel: "medium", approved: false },
  { id: "conn-7", sourceId: "src-7", targetId: "tgt-7", confidence: 72, confidenceLevel: "medium", approved: false },
  { id: "conn-8", sourceId: "src-8", targetId: "tgt-8", confidence: 96, confidenceLevel: "high", approved: true },
  { id: "conn-9", sourceId: "src-9", targetId: "tgt-9", confidence: 65, confidenceLevel: "medium", approved: false },
  { id: "conn-10", sourceId: "src-10", targetId: "tgt-10", confidence: 60, confidenceLevel: "medium", approved: false },
];

// Step 2: 처리 단계
export const mockProcessingSteps: ProcessingStep[] = [
  { phase: "parsing", label: "데이터 파싱", status: "pending" },
  { phase: "normalizing", label: "정규화 및 병합", status: "pending" },
  { phase: "connecting", label: "관계 연결", status: "pending" },
  { phase: "validating", label: "검증 및 최적화", status: "pending" },
];

// Step 2: 로그 메시지
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

// Step 3: 헬스 체크 리포트
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

// Step 3: 추천 질문
export const mockSuggestedQuestions: SuggestedQuestion[] = [
  { id: "q-1", question: "단가가 가장 높은 상위 5개 품목을 보여주세요", category: "비용 분석" },
  { id: "q-2", question: "공급사가 1곳뿐인 핵심 부품은 몇 개인가요?", category: "리스크 분석" },
  { id: "q-3", question: "SUS304 재질을 사용하는 모든 부품을 알려주세요", category: "재질 탐색" },
  { id: "q-4", question: "납기가 20일 이상인 공급사 목록을 보여주세요", category: "납기 관리" },
  { id: "q-5", question: "도면이 없는 부품 중 가장 비싼 것은?", category: "데이터 품질" },
  { id: "q-6", question: "A 공급사가 공급 중단되면 영향받는 프로젝트는?", category: "영향도 분석" },
];

// Step 3: AI 채팅 초기 메시지
export const mockInitialChatMessages: ChatMessage[] = [
  {
    id: "chat-1",
    role: "assistant",
    content: "안녕하세요! 지식 그래프 구축이 완료되었습니다. 3,450개의 노드와 8,920개의 관계가 생성되었어요. 궁금한 점을 자유롭게 물어보세요!",
    timestamp: new Date().toISOString(),
  },
];

// AI 응답 시뮬레이션
export const mockAIResponses: Record<string, string> = {
  "단가가 가장 높은 상위 5개 품목을 보여주세요":
    "단가 기준 상위 5개 품목입니다:\n\n| 순위 | 품번 | 품명 | 단가 |\n|------|------|------|------|\n| 1 | ASM-001 | 메인 프레임 | ₩125,000 |\n| 2 | MOT-205 | 서보 모터 | ₩98,000 |\n| 3 | PCB-102 | 제어 보드 | ₩45,000 |\n| 4 | GER-008 | 감속기 어셈블리 | ₩38,500 |\n| 5 | SNS-041 | 정밀 센서 모듈 | ₩32,000 |\n\n메인 프레임(ASM-001)이 가장 높은 단가를 보이며, 전체 BOM 비용의 약 15%를 차지합니다.",
  "공급사가 1곳뿐인 핵심 부품은 몇 개인가요?":
    "단일 공급사에 의존하는 핵심 부품이 **7개** 발견되었습니다.\n\n주요 리스크 품목:\n- **ASM-001** (메인 프레임) - 삼성전자(주) 단독 공급\n- **MOT-205** (서보 모터) - 모터테크 단독 공급\n- **SNS-041** (정밀 센서) - 센서월드 단독 공급\n\n이 부품들은 공급 중단 시 프로젝트 전체에 영향을 줄 수 있어 대체 공급사 확보를 권장합니다.",
};
