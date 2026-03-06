import { useMutation } from "@tanstack/react-query";
import {
  createOrganization,
  registerUser,
} from "@/features/auth/api/auth.api";
import { useRegistrationStore } from "@/features/registration/stores/registration-store";
import type { PlanTier } from "@/features/registration/types/registration.types";
import { setAuthCookies } from "@/lib/auth-cookies";

const APP_DOMAIN = import.meta.env.VITE_APP_DOMAIN;

interface CreateWorkspaceActionResult {
  redirectUrl: string;
}

function toApiPlanType(planTier: PlanTier) {
  return planTier.toUpperCase();
}

function buildSubdomainUrl(slug: string, path: string) {
  return `${window.location.protocol}//${slug}.${APP_DOMAIN}${path}`;
}

export function useCreateWorkspaceAction() {
  const signupData = useRegistrationStore((state) => state.signupData);
  const workspaceData = useRegistrationStore((state) => state.workspaceData);
  const selectedPlan = useRegistrationStore((state) => state.selectedPlan);
  const scopedToken = useRegistrationStore((state) => state.scopedToken);
  const clearScopedTokenState = useRegistrationStore((state) => state.clearScopedToken);
  const resetRegistration = useRegistrationStore((state) => state.reset);

  return useMutation({
    mutationKey: ["registration", "create-workspace"],
    mutationFn: async (): Promise<CreateWorkspaceActionResult> => {
      if (scopedToken) {
        const response = await createOrganization(
          {
            org_name: workspaceData.organizationName,
            slug: workspaceData.slug || null,
            industry: workspaceData.industry || null,
            team_size: workspaceData.teamSize || null,
            plan_type: toApiPlanType(selectedPlan),
          },
          scopedToken,
        );

        clearScopedTokenState();
        resetRegistration();
        setAuthCookies(response.tokens.access_token, response.tokens.refresh_token);

        return {
          redirectUrl: buildSubdomainUrl(response.organization.slug, "/"),
        };
      }

      const response = await registerUser({
        verification_token: signupData.verificationToken,
        code: signupData.code,
        password: signupData.password,
        full_name: signupData.name,
        org_name: workspaceData.organizationName,
        slug: workspaceData.slug || null,
        industry: workspaceData.industry || null,
        team_size: workspaceData.teamSize || null,
        job_role: workspaceData.role || null,
        plan_type: toApiPlanType(selectedPlan),
        turnstile_token: null,
      });

      resetRegistration();
      setAuthCookies(response.tokens.access_token, response.tokens.refresh_token);

      return {
        redirectUrl: buildSubdomainUrl(response.organization.slug, "/"),
      };
    },
  });
}
