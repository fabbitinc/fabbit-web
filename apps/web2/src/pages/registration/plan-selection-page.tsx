import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import { Button, ConfirmDialog } from "@fabbit/ui";
import { useCreateWorkspaceAction } from "@/features/auth/hooks/use-create-workspace-action";
import { planOptions } from "@/features/registration/mock-data/registration-mock";
import { useRegistrationStore } from "@/features/registration/stores/registration-store";
import { cn } from "@/lib/utils";

export function PlanSelectionPage() {
  const navigate = useNavigate();
  const selectedPlan = useRegistrationStore((state) => state.selectedPlan);
  const setSelectedPlan = useRegistrationStore((state) => state.setSelectedPlan);
  const workspaceData = useRegistrationStore((state) => state.workspaceData);
  const signupData = useRegistrationStore((state) => state.signupData);
  const scopedToken = useRegistrationStore((state) => state.scopedToken);
  const createWorkspaceAction = useCreateWorkspaceAction();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleContinue = () => {
    if (!scopedToken && !signupData.verificationToken) {
      navigate("/signup", { replace: true });
      return;
    }

    if (!workspaceData.organizationName.trim() || !workspaceData.slug.trim()) {
      navigate("/workspace", { replace: true });
      return;
    }

    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    const result = await createWorkspaceAction.mutateAsync();
    window.location.href = result.redirectUrl;
  };

  return (
    <section className="app-panel rounded-[32px] p-6 sm:p-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-muted-foreground">요금제 선택</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">시작 플랜을 결정합니다</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          지금은 Starter로 시작하고, 이후에 팀 규모에 맞춰 확장할 수 있습니다.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {planOptions.map((plan) => {
          const isSelected = selectedPlan === plan.tier;
          const isDisabled = Boolean(plan.disabled);

          return (
            <button
              key={plan.tier}
              className={cn(
                "rounded-[28px] border p-5 text-left transition-colors",
                isSelected ? "border-primary bg-primary/5" : "border-border/70 bg-card",
                isDisabled ? "opacity-60" : "hover:border-primary/50",
              )}
              disabled={isDisabled}
              type="button"
              onClick={() => setSelectedPlan(plan.tier)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-foreground">{plan.name}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{plan.priceLabel}</p>
                </div>
                {plan.badge ? (
                  <span className="rounded-full bg-primary/12 px-3 py-1 text-xs font-medium text-primary">
                    {plan.badge}
                  </span>
                ) : null}
              </div>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">{plan.description}</p>

              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <Button className="mt-8 h-12 w-full" disabled={createWorkspaceAction.isPending} onClick={handleContinue}>
        {createWorkspaceAction.isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            워크스페이스 생성 중...
          </>
        ) : (
          "워크스페이스 만들기"
        )}
      </Button>

      <ConfirmDialog
        cancelLabel="취소"
        confirmLabel={createWorkspaceAction.isPending ? "생성 중..." : "생성"}
        description={`${workspaceData.organizationName || "새 워크스페이스"}를 생성하고 선택한 플랜으로 시작합니다.`}
        open={confirmOpen}
        title="워크스페이스를 생성할까요?"
        variant="default"
        onConfirm={() => void handleConfirm()}
        onOpenChange={setConfirmOpen}
      />
    </section>
  );
}
