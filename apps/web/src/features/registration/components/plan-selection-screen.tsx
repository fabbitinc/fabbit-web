import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  PlanSelectionScreen as PlanSelectionScreenView,
  type PlanSelectionScreenPlanOption,
  type PlanSeatPricing,
  type SeatDescription,
} from "@fabbit/components";
import { planQueries } from "@/features/auth/api/plan.queries";
import {
  extractCreateWorkspaceError,
  useCreateWorkspaceAction,
} from "@/features/auth/hooks/use-create-workspace-action";
import type { PlanModel } from "@/features/auth/types/plan-model";
import { useRegistrationStore } from "@/features/registration/stores/registration-store";
import type { PlanTier } from "@/features/registration/types/registration.types";

const SEAT_DESCRIPTIONS: SeatDescription[] = [
  { label: "Full 시트", description: "— 모든 기능 사용 (설계, 편집, 관리)" },
  { label: "Collaborator 시트", description: "— 댓글, 리뷰, 제한된 편집" },
  { label: "Viewer 시트", description: "— 열람 전용" },
];

const STARTER_FALLBACK: PlanSelectionScreenPlanOption[] = [
  {
    tier: "starter",
    name: "Starter",
    priceLabel: "무료",
    description: "최대 5명까지 무료로 시작하는 플랜입니다.",
    features: ["최대 5명", "스토리지 250MB", "AI 크레딧 월 100 포함"],
    badge: "추천",
  },
];

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000_000) return `${Math.round(bytes / 1_000_000_000_000)}TB`;
  if (bytes >= 1_000_000_000) return `${Math.round(bytes / 1_000_000_000)}GB`;
  return `${Math.round(bytes / 1_000_000)}MB`;
}

function formatPrice(price: number): string {
  return `₩${price.toLocaleString("ko-KR")}`;
}

function toPlanTier(planType: string): PlanTier {
  switch (planType) {
    case "STARTER":
      return "starter";
    case "TEAM":
      return "team";
    case "ORGANIZATION":
      return "organization";
    case "ENTERPRISE":
      return "enterprise";
    default:
      return "starter";
  }
}

function toSeatPricing(plan: PlanModel): PlanSeatPricing[] {
  if (plan.fullSeatMonthlyPrice === 0) return [];

  const aiDescription =
    plan.aiBillingMode === "INCLUDED_ONLY"
      ? `+ 월 ${plan.starterMonthlyAiCredits} AI 크레딧`
      : "AI 사용량 과금";

  return [
    {
      label: "Full 시트",
      price: `${formatPrice(plan.fullSeatMonthlyPrice)}/월`,
      description: aiDescription,
    },
    {
      label: "Collaborator 시트",
      price: `${formatPrice(plan.collaboratorMonthlyPrice)}/월`,
    },
    {
      label: "Viewer 시트",
      price: `${formatPrice(plan.viewerMonthlyPrice)}/월`,
    },
  ];
}

function toPlanOption(plan: PlanModel): PlanSelectionScreenPlanOption {
  const tier = toPlanTier(plan.planType);
  const isPaid = plan.fullSeatMonthlyPrice > 0;
  const features: string[] = [];

  if (plan.maxMembers > 0) {
    features.push(`최대 ${plan.maxMembers}명`);
  }

  const storageLabel = formatBytes(plan.baseStorageBytes);
  if (plan.extraStorageBytesPerFullSeat > 0) {
    features.push(`기본 스토리지 ${storageLabel}`);
    features.push(`Full 시트당 +${formatBytes(plan.extraStorageBytesPerFullSeat)}`);
  } else {
    features.push(`스토리지 ${storageLabel}`);
  }

  if (!isPaid && plan.aiBillingMode === "INCLUDED_ONLY") {
    features.push(`AI 크레딧 월 ${plan.starterMonthlyAiCredits} 포함`);
  }

  let priceLabel: string | undefined;
  if (plan.contactRequired) {
    priceLabel = "별도 문의";
  } else if (!isPaid) {
    priceLabel = "무료";
  }

  let badge: string | undefined;
  if (plan.contactRequired) {
    badge = "별도 문의";
  } else if (isPaid && plan.availableForSignup) {
    badge = "결제 필요";
  } else if (isPaid && !plan.availableForSignup) {
    badge = "준비 중";
  } else if (!isPaid) {
    badge = "추천";
  }

  return {
    tier,
    name: plan.displayName,
    priceLabel,
    description: plan.description,
    features,
    seatPricing: toSeatPricing(plan),
    badge,
    disabled: plan.contactRequired || (!plan.availableForSignup && isPaid),
    paymentRequired: isPaid && plan.availableForSignup,
  };
}

export function PlanSelectionScreen() {
  const selectedPlan = useRegistrationStore((state) => state.selectedPlan);
  const setSelectedPlan = useRegistrationStore((state) => state.setSelectedPlan);
  const signupData = useRegistrationStore((state) => state.signupData);
  const scopedToken = useRegistrationStore((state) => state.scopedToken);
  const workspaceData = useRegistrationStore((state) => state.workspaceData);
  const createWorkspaceAction = useCreateWorkspaceAction();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const plansQuery = useQuery(planQueries.list());

  const planOptions = useMemo(() => {
    if (plansQuery.data && plansQuery.data.length > 0) {
      return plansQuery.data.map(toPlanOption);
    }
    if (plansQuery.isError || (!plansQuery.isLoading && (!plansQuery.data || plansQuery.data.length === 0))) {
      return STARTER_FALLBACK;
    }
    return [];
  }, [plansQuery.data, plansQuery.isError, plansQuery.isLoading]);

  if (!scopedToken && !signupData.verificationToken) {
    return <Navigate replace to="/signup" />;
  }

  if (!workspaceData.organizationName.trim() || !workspaceData.slug.trim()) {
    return <Navigate replace to="/workspace" />;
  }

  const handleConfirm = async () => {
    setErrorMessage("");

    try {
      const result = await createWorkspaceAction.mutateAsync();
      window.location.href = result.redirectUrl;
    } catch (error) {
      setErrorMessage(extractCreateWorkspaceError(error));
    }
  };

  return (
    <PlanSelectionScreenView
      errorMessage={errorMessage}
      isConfirmOpen={confirmOpen}
      isLoading={plansQuery.isLoading}
      isSubmitting={createWorkspaceAction.isPending}
      organizationName={workspaceData.organizationName}
      planOptions={planOptions}
      seatDescriptions={SEAT_DESCRIPTIONS}
      selectedPlan={selectedPlan}
      onConfirm={() => {
        void handleConfirm();
      }}
      onOpenConfirmChange={(open) => {
        if (open) {
          setErrorMessage("");
        }

        setConfirmOpen(open);
      }}
      onSelectPlan={(plan) => {
        setErrorMessage("");
        setSelectedPlan(plan as PlanTier);
      }}
    />
  );
}
