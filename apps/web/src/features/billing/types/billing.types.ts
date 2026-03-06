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

/** 결제 관리 서브탭 */
export type BillingSubTab = "cards" | "storage" | "ai";

/** 사용량 서브탭 */
export type UsageSubTab = "storage" | "ai";

// ── 사용량 API 타입 ──

/** 스토리지 카테고리 */
export type StorageCategory = "drawing" | "attachment" | "other";

/** 스토리지 카테고리별 항목 */
export interface StorageCategoryItem {
  category: StorageCategory;
  bytesUsed: number;
  fileCount: number;
}

/** 스토리지 사용량 응답 */
export interface StorageUsageData {
  bytesUsed: number;
  bytesLimit: number;
  bytesOverage: number;
  allowOverage: boolean;
  categories: StorageCategoryItem[];
}

/** 크레딧 카테고리별 사용량 */
export interface CreditCategoryItem {
  category: string;
  creditsUsed: number;
}

/** AI 크레딧 사용량 응답 */
export interface CreditUsageData {
  currentPeriodStart: string;
  currentPeriodEnd: string;
  totalCreditsUsed: number;
  planCreditsUsed: number;
  planCreditsLimit: number;
  planCreditsRemaining: number;
  bonusCreditsUsed: number;
  bonusCreditsRemaining: number;
  categories: CreditCategoryItem[];
}
