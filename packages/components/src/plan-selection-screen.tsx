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
  paymentRequired?: boolean;
}

export interface SeatTypeOption {
  value: string;
  label: string;
  price: string;
}

export interface PlanSelectionScreenProps {
  organizationName: string;
  selectedPlan: string;
  planOptions: PlanSelectionScreenPlanOption[];
  isConfirmOpen: boolean;
  isSubmitting?: boolean;
  isLoading?: boolean;
  seatTypeOptions?: SeatTypeOption[];
  selectedSeatType?: string | null;
  onConfirm: () => void;
  onOpenConfirmChange: (open: boolean) => void;
  onSelectPlan: (tier: string) => void;
  onSelectSeatType?: (seatType: string) => void;
}

export function PlanSelectionScreen({
  organizationName,
  selectedPlan,
  planOptions,
  isConfirmOpen,
  isSubmitting = false,
  isLoading = false,
  seatTypeOptions,
  selectedSeatType,
  onConfirm,
  onOpenConfirmChange,
  onSelectPlan,
  onSelectSeatType,
}: PlanSelectionScreenProps) {
  const selectedOption = planOptions.find((plan) => plan.tier === selectedPlan);
  const isPaymentRequired = Boolean(selectedOption?.paymentRequired);
  const showSeatTypeSelector = isPaymentRequired && seatTypeOptions && seatTypeOptions.length > 0;

  if (isLoading) {
    return (
      <OnboardingScreenShell
        description="플랜 정보를 불러오는 중입니다."
        eyebrow="요금제 선택"
        title="시작 플랜을 결정합니다"
      >
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </OnboardingScreenShell>
    );
  }

  return (
    <OnboardingScreenShell
      description="지금은 Starter로 시작하고, 이후에 팀 규모에 맞춰 확장할 수 있습니다."
      eyebrow="요금제 선택"
      title="시작 플랜을 결정합니다"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium",
                      plan.paymentRequired
                        ? "bg-amber-500/12 text-amber-600"
                        : "bg-primary/12 text-primary",
                    )}
                  >
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

      {showSeatTypeSelector ? (
        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium text-foreground">좌석 타입 선택</p>
          <p className="text-xs text-muted-foreground">워크스페이스 생성자의 좌석 타입을 선택합니다.</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {seatTypeOptions.map((seat) => {
              const isActive = selectedSeatType === seat.value;
              return (
                <button
                  key={seat.value}
                  className={cn(
                    "cursor-pointer rounded-lg border px-4 py-3 text-left transition-colors",
                    isActive ? "border-primary bg-primary/5" : "border-border/70 bg-card hover:border-primary/50",
                  )}
                  type="button"
                  onClick={() => onSelectSeatType?.(seat.value)}
                >
                  <p className="text-sm font-medium text-foreground">{seat.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{seat.price}</p>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {isPaymentRequired ? (
        <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-center text-sm text-amber-600">
          선택한 플랜은 결제가 필요합니다. 결제 기능은 현재 준비 중입니다.
        </div>
      ) : null}

      <Button
        className="mt-4 h-12 w-full"
        disabled={isSubmitting || isPaymentRequired}
        onClick={() => onOpenConfirmChange(true)}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            워크스페이스 생성 중...
          </>
        ) : isPaymentRequired ? (
          "결제 기능 준비 중"
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
