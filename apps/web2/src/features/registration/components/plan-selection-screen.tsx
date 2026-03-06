import { useState } from "react";
import { Navigate } from "react-router-dom";
import { PlanSelectionScreen as PlanSelectionScreenView } from "@fabbit/components";
import { useCreateWorkspaceAction } from "@/features/auth/hooks/use-create-workspace-action";
import { planOptions } from "@/features/registration/mock-data/registration-mock";
import { useRegistrationStore } from "@/features/registration/stores/registration-store";
import type { PlanTier } from "@/features/registration/types/registration.types";

export function PlanSelectionScreen() {
  const selectedPlan = useRegistrationStore((state) => state.selectedPlan);
  const setSelectedPlan = useRegistrationStore((state) => state.setSelectedPlan);
  const signupData = useRegistrationStore((state) => state.signupData);
  const scopedToken = useRegistrationStore((state) => state.scopedToken);
  const workspaceData = useRegistrationStore((state) => state.workspaceData);
  const createWorkspaceAction = useCreateWorkspaceAction();
  const [confirmOpen, setConfirmOpen] = useState(false);

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
      isSubmitting={createWorkspaceAction.isPending}
      organizationName={workspaceData.organizationName}
      planOptions={planOptions}
      selectedPlan={selectedPlan}
      onConfirm={() => {
        void handleConfirm();
      }}
      onOpenConfirmChange={setConfirmOpen}
      onSelectPlan={(plan) => setSelectedPlan(plan as PlanTier)}
    />
  );
}
