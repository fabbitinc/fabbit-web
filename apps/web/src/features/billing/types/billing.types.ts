// 결제 관련 타입 정의

/** 카드 브랜드 */
export type CardBrand = "VISA" | "MASTERCARD" | "AMEX" | "JCB" | "UNIONPAY";

/** 등록된 결제 카드 */
export interface PaymentCard {
  id: string;
  brand: CardBrand;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
  isDefault: boolean;
}

/** 플랜 상태 */
export type PlanStatus = "active" | "trial" | "overdue" | "cancelled";

/** 구독 플랜 정보 */
export interface SubscriptionPlan {
  name: string;
  monthlyPrice: number;
  status: PlanStatus;
  nextBillingDate: string;
  trialEndsAt?: string;
}

/** 결제 이력 상태 */
export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";

/** 결제 이력 항목 */
export interface PaymentHistory {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: PaymentStatus;
  receiptUrl?: string;
}

/** 스토리지 카테고리 */
export interface StorageCategory {
  key: string;
  label: string;
  usedGB: number;
  color: string;
}

/** 스토리지 사용량 정보 */
export interface StorageUsage {
  usedGB: number;
  limitGB: number;
  categories: StorageCategory[];
}

/** 초과 정책 */
export type OveragePolicy = "block" | "pay_per_use";

/** 스토리지 초과 설정 */
export interface StorageOverageSettings {
  policy: OveragePolicy;
  pricePerGB: number; // 추가 GB당 월 단가 (₩)
  monthlyCapAmount: number; // 종량제 월 한도 (₩), 0이면 무제한
}

/** AI 기능 종류 */
export type AIFeatureKey = "bom_analysis" | "drawing_analysis" | "ai_chat";

/** AI 기능별 사용량 */
export interface AIFeatureUsage {
  key: AIFeatureKey;
  label: string;
  icon: string;
  used: number;
  limit: number;
  unit: string;
}

/** AI 사용량 일별 추이 */
export interface AIUsageTrend {
  date: string;
  bom_analysis: number;
  drawing_analysis: number;
  ai_chat: number;
}

/** AI 크레딧 패키지 */
export interface AICreditPackage {
  featureKey: AIFeatureKey;
  label: string;
  quantity: number;
  price: number;
  unit: string;
}

/** 결제 관리 서브탭 */
export type BillingSubTab = "cards" | "storage" | "ai";
