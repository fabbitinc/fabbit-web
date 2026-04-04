export type CardBrand = "VISA" | "MASTERCARD" | "AMEX" | "JCB" | "UNIONPAY";

export interface PaymentCardModel {
  id: string;
  brand: CardBrand;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
  isDefault: boolean;
}

export type PlanStatus = "active" | "trial" | "overdue" | "cancelled";

export interface SubscriptionPlanModel {
  name: string;
  monthlyPrice: number;
  status: PlanStatus;
  nextBillingDate: string;
  trialEndsAt?: string;
}

export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";

export interface PaymentHistoryModel {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: PaymentStatus;
  receiptUrl?: string;
}

export interface StorageCategoryItemModel {
  category: "drawing" | "attachment" | "other";
  bytesUsed: number;
  fileCount: number;
}

export interface StorageUsageModel {
  bytesUsed: number;
  bytesLimit: number;
  bytesOverage: number;
  allowOverage: boolean;
  categories: StorageCategoryItemModel[];
}

export interface CreditCategoryItemModel {
  category: string;
  creditsUsed: number;
  usageCount: number;
}

export interface CreditUsageModel {
  currentPeriodStart: string;
  currentPeriodEnd: string;
  totalCreditsUsed: number;
  planCreditsUsed: number;
  planCreditsLimit: number;
  planCreditsRemaining: number;
  bonusCreditsUsed?: number | null;
  bonusCreditsRemaining?: number | null;
  categories: CreditCategoryItemModel[];
}
