import type { PlanOption } from "../types/registration.types";

// 플랜 옵션
export const planOptions: PlanOption[] = [
  {
    tier: "starter",
    name: "Starter",
    price: 0,
    priceLabel: "무료",

    description: "빠른 체험과 첫 도입에 적합합니다",
    features: [
      "스토리지 2GB",
      "BOM 분석 50건/월",
      "도면 분석 10건/월",
      "AI 채팅 200회/월",
    ],
    highlighted: true,
    badge: "추천",
  },
  {
    tier: "team",
    name: "Team",
    price: 249000,
    priceLabel: "₩249,000",
    description: "소규모 제조팀의 본격 운영",
    features: [
      "스토리지 100GB",
      "BOM 분석 3,000건/월",
      "도면 분석 300건/월",
      "AI 채팅 3,000회/월",
      "사용량 대시보드",
    ],
    disabled: true,
  },
  {
    tier: "enterprise",
    name: "Enterprise",
    price: 999000,
    priceLabel: "₩999,000",
    description: "대형 조직을 위한 맞춤 솔루션",
    features: [
      "스토리지 1TB",
      "BOM 분석 30,000건/월",
      "도면 분석 3,000건/월",
      "AI 채팅 30,000회/월",
      "SLA + 전담 지원",
      "보안/컴플라이언스 옵션",
    ],
    badge: "Enterprise",
    disabled: true,
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
