import { Check, Loader2 } from "lucide-react";
import { Button, ConfirmDialog, cn } from "@fabbit/ui";
import { OnboardingScreenShell } from "./onboarding-screen-shell";

export interface PlanSelectionScreenPlanOption {
  tier: string;
  name: string;
  priceLabel: string;
  description: string;
  features: string[];
  badge?: string;
  disabled?: boolean;
}

export interface PlanSelectionScreenProps {
  organizationName: string;
  selectedPlan: string;
  planOptions: PlanSelectionScreenPlanOption[];
  isConfirmOpen: boolean;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onOpenConfirmChange: (open: boolean) => void;
  onSelectPlan: (tier: string) => void;
}

export function PlanSelectionScreen({
  organizationName,
  selectedPlan,
  planOptions,
  isConfirmOpen,
  isSubmitting = false,
  onConfirm,
  onOpenConfirmChange,
  onSelectPlan,
}: PlanSelectionScreenProps) {
  return (
    <OnboardingScreenShell
      description="지금은 Starter로 시작하고, 이후에 팀 규모에 맞춰 확장할 수 있습니다."
      eyebrow="요금제 선택"
      title="시작 플랜을 결정합니다"
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {planOptions.map((plan) => {
          const isSelected = selectedPlan === plan.tier;
          const isDisabled = Boolean(plan.disabled);

          return (
            <button
              key={plan.tier}
              className={cn(
                "cursor-pointer rounded-lg border p-5 text-left transition-colors",
                isSelected ? "border-primary bg-primary/5" : "border-border/70 bg-card",
                isDisabled ? "cursor-not-allowed opacity-60" : "hover:border-primary/50",
              )}
              disabled={isDisabled}
              type="button"
              onClick={() => onSelectPlan(plan.tier)}
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

      <Button className="mt-8 h-12 w-full" disabled={isSubmitting} onClick={() => onOpenConfirmChange(true)}>
        {isSubmitting ? (
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
        confirmLabel={isSubmitting ? "생성 중..." : "생성"}
        description={`${organizationName || "새 워크스페이스"}를 생성하고 선택한 플랜으로 시작합니다.`}
        open={isConfirmOpen}
        title="워크스페이스를 생성할까요?"
        variant="default"
        onConfirm={onConfirm}
        onOpenChange={onOpenConfirmChange}
      />
    </OnboardingScreenShell>
  );
}
