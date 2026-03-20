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

export type PlanTier = "starter" | "team" | "organization" | "enterprise";

export type OwnerSeatType = "VIEWER" | "COLLABORATOR" | "FULL";
