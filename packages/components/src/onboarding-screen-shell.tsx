import type { ReactNode } from "react";
import { cn } from "@fabbit/ui";

interface OnboardingScreenShellProps {
  eyebrow: string;
  title: string;
  description: ReactNode;
  children: ReactNode;
  errorMessage?: string;
  footer?: ReactNode;
  className?: string;
}

export function OnboardingScreenShell({
  eyebrow,
  title,
  description,
  children,
  errorMessage,
  footer,
  className,
}: OnboardingScreenShellProps) {
  return (
    <section className={cn("app-panel rounded-[32px] p-6 sm:p-8", className)}>
      <div className="mb-8">
        <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{title}</h2>
        <div className="mt-3 text-sm leading-6 text-muted-foreground">{description}</div>
      </div>

      {errorMessage ? (
        <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      {children}

      {footer ? <div className="mt-8">{footer}</div> : null}
    </section>
  );
}
