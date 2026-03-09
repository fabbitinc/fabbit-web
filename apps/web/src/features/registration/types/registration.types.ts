export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  turnstileToken: string;
  verificationToken: string;
  code: string;
}

export interface WorkspaceFormData {
  organizationName: string;
  slug: string;
  industry: string;
  teamSize: string;
  role: string;
}

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
