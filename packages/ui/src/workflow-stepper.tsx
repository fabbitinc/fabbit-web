import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "./lib/cn";

export type WorkflowStepStatus = "completed" | "active" | "pending";

export interface WorkflowStep {
  id: string;
  label: string;
  status: WorkflowStepStatus;
  children?: ReactNode;
}

export interface WorkflowStepperProps {
  className?: string;
  steps: WorkflowStep[];
}

function StepIndicator({ status }: { status: WorkflowStepStatus }) {
  if (status === "completed") {
    return (
      <div
        data-slot="step-indicator"
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
      >
        <Check className="h-3 w-3" />
      </div>
    );
  }

  if (status === "active") {
    return (
      <div
        data-slot="step-indicator"
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background"
      >
        <div className="h-2 w-2 rounded-full bg-primary" />
      </div>
    );
  }

  return (
    <div
      data-slot="step-indicator"
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-border bg-background"
    />
  );
}

export function WorkflowStepper({ className, steps }: WorkflowStepperProps) {
  return (
    <div data-slot="workflow-stepper" className={cn("space-y-0", className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="relative flex gap-3">
            {/* 세로선 + 인디케이터 */}
            <div className="flex flex-col items-center">
              <StepIndicator status={step.status} />
              {!isLast ? (
                <div className={cn(
                  "w-px flex-1 min-h-4",
                  step.status === "completed" ? "bg-primary" : "bg-border",
                )} />
              ) : null}
            </div>

            {/* 콘텐츠 */}
            <div className={cn("pb-4", isLast && "pb-0")}>
              <p className={cn(
                "text-sm font-medium leading-5",
                step.status === "active" && "text-primary",
                step.status === "completed" && "text-foreground",
                step.status === "pending" && "text-muted-foreground",
              )}>
                {step.label}
              </p>
              {step.children ? (
                <div className="mt-1.5">{step.children}</div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
