export type PlanType = "STARTER" | "TEAM" | "ORGANIZATION" | "ENTERPRISE";

export type AiBillingMode = "INCLUDED_ONLY" | "METERED";

export interface PlanModel {
  planType: PlanType;
  displayName: string;
  description: string;
  maxMembers: number;
  baseStorageBytes: number;
  extraStorageBytesPerFullSeat: number;
  allowStorageOverage: boolean;
  availableForSignup: boolean;
  availableForStarterUpgrade: boolean;
  contactRequired: boolean;
  starterMonthlyAiCredits: number;
  aiBillingMode: AiBillingMode;
  viewerMonthlyPrice: number;
  collaboratorMonthlyPrice: number;
  fullSeatMonthlyPrice: number;
  storageOveragePricePerGb: number;
}
