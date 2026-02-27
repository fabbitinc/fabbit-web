// 변경 요청 (GitHub Issues/PR 스타일) — Mock 데이터 및 타입

export type ChangeRequestStatus = "open" | "closed" | "merged";
export type ChangeRequestType = "issue" | "pr";

export interface ChangeLabel {
  name: string;
  color: string; // tailwind bg class
}

export type TimelineEventType =
  | "comment"
  | "review_approved"
  | "review_changes_requested"
  | "status_change"
  | "label_added"
  | "label_removed"
  | "assigned"
  | "referenced";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  author: string;
  createdAt: string;
  content?: string;
  label?: string;
  assignee?: string;
  ref?: string;
}

export interface CRAttachment {
  id: string;
  name: string;
  size: string; // 표시용 (e.g. "2.4 MB")
  type: "pdf" | "step" | "dwg" | "xlsx" | "image" | "other";
  uploadedBy: string;
  uploadedAt: string;
}

export interface CRRelatedPart {
  partNumber: string;
  name: string;
  category?: string;
}

export interface ChangeRequest {
  id: string;
  number: number;
  type: ChangeRequestType;
  title: string;
  status: ChangeRequestStatus;
  author: string;
  createdAt: string;
  labels: ChangeLabel[];
  assignees: string[];
  description: string;
  timeline: TimelineEvent[];
  attachments: CRAttachment[];
  relatedParts: CRRelatedPart[];
}

const CHANGE_LABELS: Record<string, ChangeLabel> = {
  설계변경: { name: "설계변경", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  BOM변경: { name: "BOM변경", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  재질변경: { name: "재질변경", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  긴급: { name: "긴급", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  리뷰필요: { name: "리뷰필요", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  공정변경: { name: "공정변경", color: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300" },
};

export const MOCK_CHANGE_REQUESTS: ChangeRequest[] = [
  {
    id: "cr1",
    number: 4,
    type: "pr",
    title: "모터 하우징 Rev.C 양산 도면 반영",
    status: "open",
    author: "김설계",
    createdAt: "2025-02-25T09:30:00",
    labels: [CHANGE_LABELS["설계변경"], CHANGE_LABELS["리뷰필요"]],
    assignees: ["이엔지", "박관리"],
    description: "HSG-002 Rev.C 변경사항을 양산 도면에 반영합니다.\n\n### 변경 내용\n- 체결부 공차: ±0.05 → ±0.03\n- 방열핀 추가 (4ea)\n- 표면처리 변경: 아노다이징 → 니켈도금",
    attachments: [
      { id: "a1", name: "HSG-002_RevC_도면.pdf", size: "2.4 MB", type: "pdf", uploadedBy: "김설계", uploadedAt: "2025-02-25T09:30:00" },
      { id: "a2", name: "HSG-002_RevC.step", size: "18.7 MB", type: "step", uploadedBy: "김설계", uploadedAt: "2025-02-25T09:30:00" },
      { id: "a3", name: "방열핀_간섭검토.xlsx", size: "340 KB", type: "xlsx", uploadedBy: "이엔지", uploadedAt: "2025-02-25T14:15:00" },
    ],
    relatedParts: [
      { partNumber: "HSG-002", name: "모터 하우징", category: "하우징" },
      { partNumber: "FIN-010", name: "방열핀", category: "방열" },
      { partNumber: "MTR-100", name: "BLDC 모터 400W", category: "모터" },
    ],
    timeline: [
      { id: "t1", type: "comment", author: "김설계", createdAt: "2025-02-25T09:30:00", content: "Rev.C 도면 검토 요청드립니다. 체결부 공차 변경 및 방열핀 추가가 핵심입니다." },
      { id: "t2", type: "assigned", author: "김설계", createdAt: "2025-02-25T09:31:00", assignee: "이엔지" },
      { id: "t3", type: "assigned", author: "김설계", createdAt: "2025-02-25T09:31:00", assignee: "박관리" },
      { id: "t4", type: "label_added", author: "김설계", createdAt: "2025-02-25T09:32:00", label: "설계변경" },
      { id: "t5", type: "label_added", author: "김설계", createdAt: "2025-02-25T09:32:00", label: "리뷰필요" },
      { id: "t6", type: "comment", author: "이엔지", createdAt: "2025-02-25T14:15:00", content: "공차 변경은 확인했습니다. 방열핀 위치가 기존 지그와 간섭이 있을 수 있으니 3D 검증 결과 첨부 부탁드립니다." },
      { id: "t7", type: "review_changes_requested", author: "이엔지", createdAt: "2025-02-25T14:20:00", content: "방열핀 간섭 검증 필요" },
    ],
  },
  {
    id: "cr2",
    number: 3,
    type: "pr",
    title: "프레임 조립체 BOM 구조 변경 — 가스켓 추가",
    status: "merged",
    author: "이엔지",
    createdAt: "2025-02-18T10:00:00",
    labels: [CHANGE_LABELS["BOM변경"]],
    assignees: ["김설계"],
    description: "FRAME-ASM 하위 BOM에 실리콘 가스켓(GKT-010)을 추가합니다.\n\n방수 등급 IP67 대응을 위한 필수 부품 추가.",
    attachments: [
      { id: "a4", name: "FRAME-ASM_BOM_변경안.xlsx", size: "128 KB", type: "xlsx", uploadedBy: "이엔지", uploadedAt: "2025-02-18T10:00:00" },
    ],
    relatedParts: [
      { partNumber: "FRAME-ASM", name: "프레임 조립체", category: "조립체" },
      { partNumber: "GKT-010", name: "실리콘 가스켓", category: "씰링" },
    ],
    timeline: [
      { id: "t8", type: "comment", author: "이엔지", createdAt: "2025-02-18T10:00:00", content: "IP67 대응을 위해 가스켓 추가가 필요합니다. 기존 조립 공정에 영향 없는 위치입니다." },
      { id: "t9", type: "label_added", author: "이엔지", createdAt: "2025-02-18T10:01:00", label: "BOM변경" },
      { id: "t10", type: "assigned", author: "이엔지", createdAt: "2025-02-18T10:01:00", assignee: "김설계" },
      { id: "t11", type: "review_approved", author: "김설계", createdAt: "2025-02-19T09:30:00", content: "BOM 추가 확인. 조립 순서 변경 없음." },
      { id: "t12", type: "review_approved", author: "박관리", createdAt: "2025-02-20T15:00:00", content: "승인합니다." },
      { id: "t13", type: "status_change", author: "박관리", createdAt: "2025-02-20T15:01:00", content: "merged" },
    ],
  },
  {
    id: "cr3",
    number: 2,
    type: "issue",
    title: "드라이브 샤프트 재질 변경 검토 요청",
    status: "closed",
    author: "박관리",
    createdAt: "2025-02-10T11:00:00",
    labels: [CHANGE_LABELS["재질변경"]],
    assignees: ["이엔지", "김설계"],
    description: "SFT-200 재질을 S45C에서 SCM440으로 변경하면 원가 절감이 가능한지 검토 요청.\n\n예상 원가 절감: 부품당 약 ₩2,300",
    attachments: [
      { id: "a5", name: "SFT-200_강도해석_보고서.pdf", size: "5.1 MB", type: "pdf", uploadedBy: "이엔지", uploadedAt: "2025-02-12T16:30:00" },
    ],
    relatedParts: [
      { partNumber: "SFT-200", name: "드라이브 샤프트", category: "축" },
    ],
    timeline: [
      { id: "t14", type: "comment", author: "박관리", createdAt: "2025-02-10T11:00:00", content: "원가 절감을 위해 재질 변경을 검토해주세요. SCM440이 현재 단가가 더 낮습니다." },
      { id: "t15", type: "label_added", author: "박관리", createdAt: "2025-02-10T11:01:00", label: "재질변경" },
      { id: "t16", type: "comment", author: "이엔지", createdAt: "2025-02-12T16:30:00", content: "강도 시뮬레이션 결과, SCM440은 반복 하중 조건에서 안전율이 1.2로 기준(1.5) 미달입니다." },
      { id: "t17", type: "referenced", author: "이엔지", createdAt: "2025-02-12T16:31:00", ref: "SFT-200 강도 해석 보고서" },
      { id: "t18", type: "comment", author: "김설계", createdAt: "2025-02-13T09:00:00", content: "안전율 미달로 재질 변경은 불가합니다. 이슈를 닫겠습니다." },
      { id: "t19", type: "status_change", author: "김설계", createdAt: "2025-02-13T09:01:00", content: "closed" },
    ],
  },
  {
    id: "cr4",
    number: 1,
    type: "issue",
    title: "초기 설계 리뷰 — 주요 부품 선정 및 레이아웃",
    status: "closed",
    author: "김설계",
    createdAt: "2025-01-20T10:00:00",
    labels: [CHANGE_LABELS["설계변경"]],
    assignees: ["이엔지", "박관리"],
    description: "Drive Unit Gen4 초기 설계안 리뷰.\n\n### 주요 결정 사항\n- 모터: BLDC 400W\n- 감속기: 하모닉 50:1\n- 하우징: 알루미늄 다이캐스팅",
    attachments: [],
    relatedParts: [
      { partNumber: "MTR-100", name: "BLDC 모터 400W", category: "모터" },
      { partNumber: "GRD-050", name: "하모닉 감속기 50:1", category: "감속기" },
      { partNumber: "HSG-002", name: "모터 하우징", category: "하우징" },
    ],
    timeline: [
      { id: "t20", type: "comment", author: "김설계", createdAt: "2025-01-20T10:00:00", content: "Gen4 초기 설계안입니다. 주요 부품 선정 및 레이아웃에 대해 리뷰 부탁드립니다." },
      { id: "t21", type: "comment", author: "이엔지", createdAt: "2025-01-22T14:00:00", content: "모터 선정 및 레이아웃 적합합니다. 냉각 구조만 추가 검토 필요할 것 같습니다." },
      { id: "t22", type: "comment", author: "박관리", createdAt: "2025-01-23T10:00:00", content: "승인합니다. 냉각 구조는 별도 이슈로 관리하겠습니다." },
      { id: "t23", type: "status_change", author: "박관리", createdAt: "2025-01-23T10:01:00", content: "closed" },
    ],
  },
];

export const MOCK_ISSUES = MOCK_CHANGE_REQUESTS.filter((c) => c.type === "issue");
export const MOCK_PRS = MOCK_CHANGE_REQUESTS.filter((c) => c.type === "pr");
