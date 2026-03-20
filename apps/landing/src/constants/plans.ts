/** docs SSOT 기준 플랜 데이터 — pricing-section, pricing-page 공유 */

export interface Plan {
  name: string;
  price: string;
  priceUnit: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
  badge?: string;
  disabled?: boolean;
}

export interface SeatPrice {
  viewer: number;
  collaborator: number;
  full: number;
}

export interface PlanSpec {
  name: string;
  seatPrice: SeatPrice | null;
  maxMembers: string;
  baseStorage: string;
  storagePerFull: string;
  aiPolicy: string;
  active: boolean;
}

export const plans: Plan[] = [
  {
    name: "Starter",
    price: "무료",
    priceUnit: "",
    description: "도입 검토 및 소규모 팀을 위한 상시 무료 플랜",
    features: [
      "최대 5명",
      "스토리지 250MB",
      "AI 크레딧 월 100회 포함",
      "기본 도면·BOM 관리",
      "이메일 지원",
    ],
    cta: "무료로 시작",
  },
  {
    name: "Team",
    price: "좌석별 과금",
    priceUnit: "",
    description: "10~49명 규모 제조팀의 실무 운영",
    features: [
      "Viewer 5,000원 / Collaborator 15,000원 / Full 29,000원",
      "멤버 수 제한 없음",
      "기본 10GB + Full당 10GB",
      "AI 사용량 기반 과금",
      "변경 이력·도면-BOM 연결",
      "우선 지원",
    ],
    highlighted: true,
    cta: "가입",
    badge: "추천",
  },
  {
    name: "Organization",
    price: "좌석별 과금",
    priceUnit: "",
    description: "부서 간 협업이 필요한 운영팀",
    features: [
      "Viewer 5,000원 / Collaborator 25,000원 / Full 59,000원",
      "멤버 수 제한 없음",
      "기본 100GB + Full당 50GB",
      "AI 사용량 기반 과금",
      "Team 플랜의 모든 기능",
      "전담 매니저",
    ],
    cta: "준비 중",
    disabled: true,
  },
  {
    name: "Enterprise",
    price: "별도",
    priceUnit: "상담",
    description: "맞춤 구축 및 대용량 운영",
    features: [
      "Organization 플랜의 모든 기능",
      "온프레미스 / 하이브리드",
      "ERP 연동",
      "커스텀 매핑 템플릿",
      "SLA 보장",
      "전용 인프라",
    ],
    cta: "문의 예정",
    disabled: true,
  },
];

export const planSpecs: PlanSpec[] = [
  {
    name: "Starter",
    seatPrice: null,
    maxMembers: "최대 5명",
    baseStorage: "250MB",
    storagePerFull: "—",
    aiPolicy: "월 100 크레딧 포함",
    active: true,
  },
  {
    name: "Team",
    seatPrice: { viewer: 5_000, collaborator: 15_000, full: 29_000 },
    maxMembers: "제한 없음",
    baseStorage: "10GB",
    storagePerFull: "Full당 10GB",
    aiPolicy: "사용량 기반 과금",
    active: true,
  },
  {
    name: "Organization",
    seatPrice: { viewer: 5_000, collaborator: 25_000, full: 59_000 },
    maxMembers: "제한 없음",
    baseStorage: "100GB",
    storagePerFull: "Full당 50GB",
    aiPolicy: "사용량 기반 과금",
    active: false,
  },
  {
    name: "Enterprise",
    seatPrice: { viewer: 5_000, collaborator: 25_000, full: 59_000 },
    maxMembers: "제한 없음",
    baseStorage: "100GB",
    storagePerFull: "Full당 50GB",
    aiPolicy: "사용량 기반 과금",
    active: false,
  },
];

export const STORAGE_OVERAGE_PER_GB = 200;
