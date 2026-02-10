import { Check } from "lucide-react";
import { onboardingSteps } from "../mock-data/onboarding-mock";
import type { OnboardingStep } from "../types/onboarding.types";
import { cn } from "@/lib/utils";

interface OnboardingStepBarProps {
  currentStep: OnboardingStep;
}

export function OnboardingStepBar({ currentStep }: OnboardingStepBarProps) {
  const steps = onboardingSteps;

  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.step;
        const isCurrent = currentStep === step.step;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.step} className="flex items-center">
            {/* 스텝 원형 + 라벨 */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all",
                  isCompleted && "bg-[#3b82f6] text-white",
                  isCurrent && "bg-[#3b82f6] text-white ring-4 ring-[#3b82f6]/20",
                  !isCompleted && !isCurrent && "bg-[#e2e8f0] text-[#94a3b8]"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : step.step}
              </div>
              <span
                className={cn(
                  "text-xs whitespace-nowrap",
                  isCurrent ? "font-semibold text-[#0f172a]" : "text-[#94a3b8]"
                )}
              >
                {step.title}
              </span>
            </div>

            {/* 연결선 */}
            {!isLast && (
              <div
                className={cn(
                  "h-[2px] w-8 mx-1.5 mt-[-18px] transition-colors",
                  isCompleted ? "bg-[#3b82f6]" : "bg-[#e2e8f0]"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
