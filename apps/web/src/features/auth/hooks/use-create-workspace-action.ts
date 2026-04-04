import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createOrganization,
  registerUser,
} from "@/features/auth/api/auth.api";
import { useRegistrationStore } from "@/features/registration/stores/registration-store";
import type { OwnerSeatType, PlanTier } from "@/features/registration/types/registration.types";
import { setAuthCookies } from "@/lib/auth-cookies";
import { extractApiError } from "@/lib/api-error";

const APP_DOMAIN = import.meta.env.VITE_APP_DOMAIN;

interface CreateWorkspaceActionResult {
  redirectUrl: string;
}

const CREATE_WORKSPACE_ERROR_MESSAGE =
  "워크스페이스를 준비하는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요. 문제가 계속되면 고객지원에 문의해 주세요.";

function toApiPlanType(planTier: PlanTier): "STARTER" | "TEAM" {
  switch (planTier) {
    case "starter":
      return "STARTER";
    case "team":
      return "TEAM";
    case "organization":
    case "enterprise":
      throw new Error("현재 가입 플로우에서는 Starter와 Team 플랜만 선택할 수 있습니다.");
  }
}

function toApiOwnerSeatType(seatType: OwnerSeatType | null) {
  if (!seatType) return undefined;
  return seatType;
}

function buildSubdomainUrl(slug: string, path: string) {
  return `${window.location.protocol}//${slug}.${APP_DOMAIN}${path}`;
}

export function extractCreateWorkspaceError(error: unknown) {
  return extractApiError(error, {
    fallback: "워크스페이스 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    codeMessages: {
      INTERNAL_SERVER_ERROR: CREATE_WORKSPACE_ERROR_MESSAGE,
    },
    statusMessages: {
      500: CREATE_WORKSPACE_ERROR_MESSAGE,
    },
  });
}

export function useCreateWorkspaceAction() {
  const signupData = useRegistrationStore((state) => state.signupData);
  const workspaceData = useRegistrationStore((state) => state.workspaceData);
  const selectedPlan = useRegistrationStore((state) => state.selectedPlan);
  const ownerSeatType = useRegistrationStore((state) => state.ownerSeatType);
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
            slug: workspaceData.slug || undefined,
            industry: workspaceData.industry || undefined,
            team_size: workspaceData.teamSize || undefined,
            plan_type: toApiPlanType(selectedPlan),
            owner_seat_type: toApiOwnerSeatType(ownerSeatType),
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
        slug: workspaceData.slug || undefined,
        industry: workspaceData.industry || undefined,
        team_size: workspaceData.teamSize || undefined,
        plan_type: toApiPlanType(selectedPlan),
        owner_seat_type: toApiOwnerSeatType(ownerSeatType),
        turnstile_token: undefined,
      });

      resetRegistration();
      setAuthCookies(response.tokens.access_token, response.tokens.refresh_token);

      return {
        redirectUrl: buildSubdomainUrl(response.organization.slug, "/"),
      };
    },
    onError: (error) => {
      toast.error(extractCreateWorkspaceError(error));
    },
  });
}
