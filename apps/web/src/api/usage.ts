import { apiClient } from "./client";
import type {
  StorageUsageData,
  CreditUsageData,
} from "@/features/billing/types/billing.types";

// --- 내부 API 응답 타입 (snake_case) ---

interface ApiStorageCategoryItem {
  category: string;
  bytes_used: number;
  file_count: number;
}

interface ApiStorageUsageResponse {
  bytes_used: number;
  bytes_limit: number;
  bytes_overage: number;
  allow_overage: boolean;
  categories: ApiStorageCategoryItem[];
}

interface ApiCreditCategoryItem {
  category: string;
  credits_used: number;
}

interface ApiCreditUsageResponse {
  current_period_start: string;
  current_period_end: string;
  total_credits_used: number;
  plan_credits_used: number;
  plan_credits_limit: number;
  plan_credits_remaining: number;
  bonus_credits_used: number;
  bonus_credits_remaining: number;
  categories: ApiCreditCategoryItem[];
}

// --- API 함수 ---

/** 스토리지 사용량 조회 */
export async function getStorageUsage(): Promise<StorageUsageData> {
  const response = await apiClient.get<ApiStorageUsageResponse>("/api/v1/usage/storage");
  const d = response.data;
  return {
    bytesUsed: d.bytes_used,
    bytesLimit: d.bytes_limit,
    bytesOverage: d.bytes_overage,
    allowOverage: d.allow_overage,
    categories: d.categories.map((c) => ({
      category: c.category as StorageUsageData["categories"][number]["category"],
      bytesUsed: c.bytes_used,
      fileCount: c.file_count,
    })),
  };
}

/** AI 크레딧 사용량 조회 */
export async function getCreditUsage(): Promise<CreditUsageData> {
  const response = await apiClient.get<ApiCreditUsageResponse>("/api/v1/usage/credits");
  const d = response.data;
  return {
    currentPeriodStart: d.current_period_start,
    currentPeriodEnd: d.current_period_end,
    totalCreditsUsed: d.total_credits_used,
    planCreditsUsed: d.plan_credits_used,
    planCreditsLimit: d.plan_credits_limit,
    planCreditsRemaining: d.plan_credits_remaining,
    bonusCreditsUsed: d.bonus_credits_used,
    bonusCreditsRemaining: d.bonus_credits_remaining,
    categories: d.categories.map((c) => ({
      category: c.category,
      creditsUsed: c.credits_used,
    })),
  };
}
