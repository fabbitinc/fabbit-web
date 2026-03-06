import { apiClient } from "@/api/client";
import type { CreditUsageResponseDto, StorageUsageResponseDto } from "@/features/billing/api/usage.types";
import type { CreditUsageModel, StorageUsageModel } from "@/features/billing/types/billing-model";

export async function fetchStorageUsage() {
  const response = await apiClient.get<StorageUsageResponseDto>("/api/v1/usage/storage");
  return toStorageUsageModel(response.data);
}

export async function fetchCreditUsage() {
  const response = await apiClient.get<CreditUsageResponseDto>("/api/v1/usage/credits");
  return toCreditUsageModel(response.data);
}

function toStorageUsageModel(response: StorageUsageResponseDto): StorageUsageModel {
  return {
    bytesUsed: response.bytes_used,
    bytesLimit: response.bytes_limit,
    bytesOverage: response.bytes_overage,
    allowOverage: response.allow_overage,
    categories: response.categories.map((category) => ({
      category: category.category,
      bytesUsed: category.bytes_used,
      fileCount: category.file_count,
    })),
  };
}

function toCreditUsageModel(response: CreditUsageResponseDto): CreditUsageModel {
  return {
    currentPeriodStart: response.current_period_start,
    currentPeriodEnd: response.current_period_end,
    totalCreditsUsed: response.total_credits_used,
    planCreditsUsed: response.plan_credits_used,
    planCreditsLimit: response.plan_credits_limit,
    planCreditsRemaining: response.plan_credits_remaining,
    bonusCreditsUsed: response.bonus_credits_used,
    bonusCreditsRemaining: response.bonus_credits_remaining,
    categories: response.categories.map((category) => ({
      category: category.category,
      creditsUsed: category.credits_used,
      usageCount: category.usage_count,
    })),
  };
}
