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
    <section
      className={cn(
        "flex w-full max-w-[1000px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/5 md:grid md:grid-cols-2",
        className,
      )}
    >
      <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 p-10 text-white md:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700" />
        <div className="absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full bg-blue-500/30 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-[300px] w-[300px] rounded-full bg-indigo-500/30 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm">
              <span className="text-lg font-semibold">F</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Fabbit</span>
          </div>

          <p className="text-sm font-medium text-blue-100/80">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight">{title}</h2>
          <div className="mt-4 text-sm leading-7 text-blue-100/90">{description}</div>
        </div>

        <div className="relative z-10 space-y-2 text-sm text-blue-100/80">
          <p>빠른 이메일 인증으로 바로 시작할 수 있습니다.</p>
          <p>워크스페이스별로 독립된 환경을 안전하게 운영합니다.</p>
          <p>가입 후에도 주요 설정은 언제든 다시 변경할 수 있습니다.</p>
        </div>
      </div>

      <div className="flex flex-col justify-center bg-card p-8 md:p-12">
        <div className="mb-6 md:hidden">
          <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-bold text-foreground">{title}</h2>
          <div className="mt-3 text-sm leading-6 text-muted-foreground">{description}</div>
        </div>

        {errorMessage ? (
          <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        {children}

        {footer ? <div className="mt-8">{footer}</div> : null}
      </div>
    </section>
  );
}
