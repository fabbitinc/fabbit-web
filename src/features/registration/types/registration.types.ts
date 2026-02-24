// 계정 생성 (Step 1)
export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  turnstileToken: string;
}

// 워크스페이스 설정 (Step 2)
export interface WorkspaceFormData {
  organizationName: string;
  slug: string;
  industry: string;
  teamSize: string;
  role: string;
}

// 플랜 선택 (Step 3)
export type PlanTier = "starter" | "team" | "enterprise";

export interface PlanOption {
  tier: PlanTier;
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  disabled?: boolean;
}
