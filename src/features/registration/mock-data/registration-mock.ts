import type { PlanOption } from "../types/registration.types";

// 플랜 옵션
export const planOptions: PlanOption[] = [
  {
    tier: "free",
    name: "Free",
    price: 0,
    priceLabel: "무료",
    description: "소규모 팀의 첫 시작에 적합합니다",
    features: [
      "최대 3명 사용자",
      "1GB 스토리지",
      "BOM 100건",
      "기본 AI 매핑",
      "이메일 지원",
    ],
  },
  {
    tier: "pro",
    name: "Pro",
    price: 49000,
    priceLabel: "₩49,000/월",
    description: "성장하는 팀을 위한 전문 PLM",
    features: [
      "최대 20명 사용자",
      "50GB 스토리지",
      "BOM 무제한",
      "고급 AI 매핑 + 자동 분류",
      "도면 AI 파싱 (월 500건)",
      "우선 기술 지원",
    ],
    highlighted: true,
    badge: "추천",
  },
  {
    tier: "elite",
    name: "Elite",
    price: 149000,
    priceLabel: "₩149,000/월",
    description: "대규모 조직을 위한 엔터프라이즈급",
    features: [
      "사용자 무제한",
      "500GB 스토리지",
      "BOM 무제한",
      "AI 매핑 + 자동 분류 + 이상 탐지",
      "도면 AI 파싱 무제한",
      "전담 매니저 + SLA 보장",
      "SSO / SAML 인증",
      "온프레미스 배포 옵션",
    ],
    badge: "Enterprise",
  },
];

// 산업 분야 옵션
export const industryOptions = [
  { value: "manufacturing", label: "제조업" },
  { value: "automotive", label: "자동차" },
  { value: "electronics", label: "전자/반도체" },
  { value: "aerospace", label: "항공/우주" },
  { value: "shipbuilding", label: "조선/해양" },
  { value: "construction", label: "건설/플랜트" },
  { value: "custom", label: "직접입력" },
];

// 팀 규모 옵션
export const teamSizeOptions = [
  { value: "1-10", label: "1~10명" },
  { value: "11-50", label: "11~50명" },
  { value: "51-200", label: "51~200명" },
  { value: "201+", label: "200명 이상" },
];

// 직무 옵션
export const roleOptions = [
  { value: "engineer", label: "설계 엔지니어" },
  { value: "manager", label: "프로젝트 관리자" },
  { value: "quality", label: "품질 관리" },
  { value: "procurement", label: "구매/조달" },
  { value: "executive", label: "경영진" },
  { value: "custom", label: "직접입력" },
];
