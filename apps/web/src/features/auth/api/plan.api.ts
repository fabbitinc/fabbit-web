import { authGetPlans as getPlansApiV1AuthPlansGet } from "@/api/generated/orval/auth/auth";
import type { PlanResponse } from "@/api/generated/orval/model/planResponse";
import type { AiBillingMode, PlanModel, PlanType } from "@/features/auth/types/plan-model";

export async function fetchPlans(): Promise<PlanModel[]> {
  const response = await getPlansApiV1AuthPlansGet();
  return response.map(toPlanModel);
}

function toPlanModel(response: PlanResponse): PlanModel {
  return {
    planType: (response.plan_type ?? "STARTER") as PlanType,
    displayName: response.display_name ?? "",
    description: response.description ?? "",
    maxMembers: response.max_members ?? -1,
    baseStorageBytes: response.base_storage_bytes ?? 0,
    extraStorageBytesPerFullSeat: response.extra_storage_bytes_per_full_seat ?? 0,
    allowStorageOverage: response.allow_storage_overage ?? false,
    availableForSignup: response.available_for_signup ?? false,
    availableForStarterUpgrade: response.available_for_starter_upgrade ?? false,
    contactRequired: response.contact_required ?? false,
    starterMonthlyAiCredits: response.starter_monthly_ai_credits ?? 0,
    aiBillingMode: (response.ai_billing_mode ?? "INCLUDED_ONLY") as AiBillingMode,
    viewerMonthlyPrice: response.viewer_monthly_price ?? 0,
    collaboratorMonthlyPrice: response.collaborator_monthly_price ?? 0,
    fullSeatMonthlyPrice: response.full_seat_monthly_price ?? 0,
    storageOveragePricePerGb: response.storage_overage_price_per_gb ?? 0,
  };
}
