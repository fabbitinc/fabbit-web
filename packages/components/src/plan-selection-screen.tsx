import { Check, Loader2 } from "lucide-react";
import { Button, ConfirmDialog, cn } from "@fabbit/ui";
import { OnboardingScreenShell } from "./onboarding-screen-shell";

export interface PlanSeatPricing {
  label: string;
  price: string;
  description?: string;
}

export interface PlanSelectionScreenPlanOption {
  tier: string;
  name: string;
  priceLabel?: string;
  description: string;
  features: string[];
  seatPricing?: PlanSeatPricing[];
  badge?: string;
  disabled?: boolean;
  paymentRequired?: boolean;
}

export interface SeatDescription {
  label: string;
  description: string;
}

export interface PlanSelectionScreenProps {
  organizationName: string;
  selectedPlan: string;
  planOptions: PlanSelectionScreenPlanOption[];
  seatDescriptions?: SeatDescription[];
  isConfirmOpen: boolean;
  isSubmitting?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onOpenConfirmChange: (open: boolean) => void;
  onSelectPlan: (tier: string) => void;
}

function PlanCard({
  plan,
  isSelected,
  onSelect,
}: {
  plan: PlanSelectionScreenPlanOption;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isDisabled = Boolean(plan.disabled);
  const hasSeatPricing = plan.seatPricing && plan.seatPricing.length > 0;

  return (
    <button
      className={cn(
        "relative flex cursor-pointer flex-col rounded-xl border p-6 text-left transition-all",
        isSelected
          ? "border-primary ring-2 ring-primary/20 bg-primary/5"
          : "border-border/70 bg-card",
        isDisabled
          ? "cursor-not-allowed opacity-60"
          : "hover:border-primary/50 hover:shadow-md",
      )}
      disabled={isDisabled}
      type="button"
      onClick={onSelect}
    >
      {plan.badge ? (
        <span
          className={cn(
            "absolute -top-2.5 right-4 rounded-full px-3 py-0.5 text-xs font-medium",
            plan.paymentRequired
              ? "bg-amber-100 text-amber-600"
              : plan.disabled
                ? "bg-muted text-muted-foreground"
                : "bg-blue-100 text-primary",
          )}
        >
          {plan.badge}
        </span>
      ) : null}

      <p className="text-base font-semibold text-foreground">{plan.name}</p>

      {plan.priceLabel ? (
        <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{plan.priceLabel}</p>
      ) : null}

      <p className={cn("text-sm leading-relaxed text-muted-foreground", plan.priceLabel ? "mt-3" : "mt-2")}>{plan.description}</p>

      {hasSeatPricing ? (
        <div className="mt-5 flex-1 space-y-0 divide-y divide-border/60">
          {plan.seatPricing!.map((seat) => (
            <div key={seat.label} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-foreground">{seat.label}</span>
                <span className="shrink-0 text-sm font-semibold text-foreground">{seat.price}</span>
              </div>
              {seat.description ? (
                <p className="mt-1 text-xs text-muted-foreground">{seat.description}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {plan.features.length > 0 ? (
        <ul className={cn("space-y-2.5 text-sm text-muted-foreground", hasSeatPricing ? "mt-4 border-t border-border/60 pt-4" : "mt-5 flex-1")}>
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </button>
  );
}

export function PlanSelectionScreen({
  organizationName,
  selectedPlan,
  planOptions,
  seatDescriptions,
  isConfirmOpen,
  isSubmitting = false,
  isLoading = false,
  onConfirm,
  onOpenConfirmChange,
  onSelectPlan,
}: PlanSelectionScreenProps) {
  const selectedOption = planOptions.find((plan) => plan.tier === selectedPlan);
  const isPaymentRequired = Boolean(selectedOption?.paymentRequired);

  if (isLoading) {
    return (
      <OnboardingScreenShell
        wide
        description="플랜 정보를 불러오는 중입니다."
        eyebrow="요금제 선택"
        title="플랜을 선택해 주세요"
      >
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </OnboardingScreenShell>
    );
  }

  return (
    <OnboardingScreenShell
      wide
      description="지금은 Starter로 시작하고, 이후에 팀 규모에 맞춰 확장할 수 있습니다."
      eyebrow="요금제 선택"
      title="플랜을 선택해 주세요"
    >
      {seatDescriptions && seatDescriptions.length > 0 ? (
        <div className="mb-6 flex flex-wrap gap-x-6 gap-y-2 rounded-lg border border-border/60 bg-muted/30 px-5 py-3.5">
          {seatDescriptions.map((seat) => (
            <div key={seat.label} className="flex items-baseline gap-1.5 text-sm">
              <span className="font-medium text-foreground">{seat.label}</span>
              <span className="text-muted-foreground">{seat.description}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {planOptions.map((plan) => (
          <PlanCard
            key={plan.tier}
            isSelected={selectedPlan === plan.tier}
            plan={plan}
            onSelect={() => onSelectPlan(plan.tier)}
          />
        ))}
      </div>

      {isPaymentRequired ? (
        <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-center text-sm text-amber-600">
          선택한 플랜은 결제가 필요합니다. 결제 기능은 현재 준비 중입니다.
        </div>
      ) : null}

      <Button
        className="mt-6 h-12 w-full"
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
