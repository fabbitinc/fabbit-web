import { Check } from "lucide-react";

export interface StepItem {
  /** 고유 키 */
  id: string;
  /** 단계 라벨 (예: "수입 검사") */
  label: string;
  /** 단계 설명 */
  description?: string;
}

export interface StepIndicatorProps {
  steps: StepItem[];
  /** 현재 활성 단계의 id */
  currentStepId: string;
  className?: string;
}

export function StepIndicator({
  steps,
  currentStepId,
  className,
}: StepIndicatorProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStepId);

  return (
    <nav className={`flex items-center ${className ?? ""}`}>
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step.id} className="flex items-center">
            {/* 스텝 */}
            <div className="flex items-center gap-2">
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors ${
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCurrent
                      ? "border-primary bg-background text-primary"
                      : "border-muted-foreground/30 bg-background text-muted-foreground"
                }`}
              >
                {isCompleted ? <Check className="size-4" /> : index + 1}
              </div>
              <div className="hidden sm:block">
                <p
                  className={`text-sm font-medium ${
                    isCurrent
                      ? "text-foreground"
                      : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {/* 연결선 */}
            {index < steps.length - 1 && (
              <div
                className={`mx-3 h-px w-8 sm:w-12 ${
                  isCompleted ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
