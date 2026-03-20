import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  PlanSelectionScreen as PlanSelectionScreenView,
  type PlanSelectionScreenPlanOption,
  type SeatTypeOption,
} from "@fabbit/components";
import { planQueries } from "@/features/auth/api/plan.queries";
import { useCreateWorkspaceAction } from "@/features/auth/hooks/use-create-workspace-action";
import type { PlanModel } from "@/features/auth/types/plan-model";
import { useRegistrationStore } from "@/features/registration/stores/registration-store";
import type { OwnerSeatType, PlanTier } from "@/features/registration/types/registration.types";

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

function toPlanOption(plan: PlanModel): PlanSelectionScreenPlanOption {
  const tier = toPlanTier(plan.planType);
  const isPaid = plan.fullSeatMonthlyPrice > 0;
  const features: string[] = [];

  if (plan.maxMembers > 0) {
    features.push(`최대 ${plan.maxMembers}명`);
  }

  const storageLabel = formatBytes(plan.baseStorageBytes);
  if (plan.extraStorageBytesPerFullSeat > 0) {
    features.push(`기본 스토리지 ${storageLabel} + Full 좌석당 ${formatBytes(plan.extraStorageBytesPerFullSeat)}`);
  } else {
    features.push(`스토리지 ${storageLabel}`);
  }

  if (plan.aiBillingMode === "INCLUDED_ONLY") {
    features.push(`AI 크레딧 월 ${plan.starterMonthlyAiCredits} 포함`);
  } else {
    features.push("AI 사용량 과금");
  }

  if (isPaid) {
    features.push(
      `Viewer ${formatPrice(plan.viewerMonthlyPrice)} / Collaborator ${formatPrice(plan.collaboratorMonthlyPrice)} / Full ${formatPrice(plan.fullSeatMonthlyPrice)}`,
    );
  }

  let priceLabel: string;
  if (plan.contactRequired) {
    priceLabel = "별도 문의";
  } else if (isPaid) {
    priceLabel = `${formatPrice(plan.fullSeatMonthlyPrice)}~/좌석`;
  } else {
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
    badge,
    disabled: plan.contactRequired || (!plan.availableForSignup && isPaid),
    paymentRequired: isPaid && plan.availableForSignup,
  };
}

function toSeatTypeOptions(plan: PlanModel | undefined): SeatTypeOption[] {
  if (!plan || plan.fullSeatMonthlyPrice === 0) return [];
  return [
    { value: "VIEWER", label: "Viewer", price: `${formatPrice(plan.viewerMonthlyPrice)}/월` },
    { value: "COLLABORATOR", label: "Collaborator", price: `${formatPrice(plan.collaboratorMonthlyPrice)}/월` },
    { value: "FULL", label: "Full", price: `${formatPrice(plan.fullSeatMonthlyPrice)}/월` },
  ];
}

export function PlanSelectionScreen() {
  const selectedPlan = useRegistrationStore((state) => state.selectedPlan);
  const setSelectedPlan = useRegistrationStore((state) => state.setSelectedPlan);
  const ownerSeatType = useRegistrationStore((state) => state.ownerSeatType);
  const setOwnerSeatType = useRegistrationStore((state) => state.setOwnerSeatType);
  const signupData = useRegistrationStore((state) => state.signupData);
  const scopedToken = useRegistrationStore((state) => state.scopedToken);
  const workspaceData = useRegistrationStore((state) => state.workspaceData);
  const createWorkspaceAction = useCreateWorkspaceAction();
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  const selectedPlanModel = useMemo(
    () => plansQuery.data?.find((p) => toPlanTier(p.planType) === selectedPlan),
    [plansQuery.data, selectedPlan],
  );

  const seatTypeOptions = useMemo(
    () => toSeatTypeOptions(selectedPlanModel),
    [selectedPlanModel],
  );

  if (!scopedToken && !signupData.verificationToken) {
    return <Navigate replace to="/signup" />;
  }

  if (!workspaceData.organizationName.trim() || !workspaceData.slug.trim()) {
    return <Navigate replace to="/workspace" />;
  }

  const handleConfirm = async () => {
    const result = await createWorkspaceAction.mutateAsync();
    window.location.href = result.redirectUrl;
  };

  return (
    <PlanSelectionScreenView
      isConfirmOpen={confirmOpen}
      isLoading={plansQuery.isLoading}
      isSubmitting={createWorkspaceAction.isPending}
      organizationName={workspaceData.organizationName}
      planOptions={planOptions}
      seatTypeOptions={seatTypeOptions}
      selectedPlan={selectedPlan}
      selectedSeatType={ownerSeatType}
      onConfirm={() => {
        void handleConfirm();
      }}
      onOpenConfirmChange={setConfirmOpen}
      onSelectPlan={(plan) => setSelectedPlan(plan as PlanTier)}
      onSelectSeatType={(seat) => setOwnerSeatType(seat as OwnerSeatType)}
    />
  );
}
