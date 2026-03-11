import type { FormEventHandler, ReactNode } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { BrandLogo, Button, Input, Label } from "@fabbit/ui";

export interface LoginScreenProps {
  email: string;
  password: string;
  errorMessage?: string;
  isRegisterDomain?: boolean;
  isSubmitting?: boolean;
  showPassword: boolean;
  forgotPasswordAction?: ReactNode;
  socialLoginSection?: ReactNode;
  signupAction?: ReactNode;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onTogglePasswordVisibility: () => void;
}

export function LoginScreen({
  email,
  password,
  errorMessage,
  isRegisterDomain = false,
  isSubmitting = false,
  showPassword,
  forgotPasswordAction,
  socialLoginSection,
  signupAction,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onTogglePasswordVisibility,
}: LoginScreenProps) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden flex-col items-center justify-center overflow-hidden border-r border-border/70 bg-[var(--login-panel-bg,#0f172a)] lg:flex lg:w-1/2">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,color-mix(in_srgb,var(--primary)_60%,transparent),transparent_60%),radial-gradient(circle_at_75%_65%,color-mix(in_srgb,var(--accent)_45%,transparent),transparent_55%),radial-gradient(circle_at_60%_80%,color-mix(in_srgb,var(--primary)_35%,transparent),transparent_45%)]" />
        <div className="relative z-10 w-full max-w-md space-y-8 px-8">
          <BrandLogo size="xl" textClassName="text-white" />

          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight text-white">
              AI 기반 초경량
              <br />
              PLM 시스템
            </h1>
            <p className="max-w-md text-lg text-white/75">
              도면을 업로드하면 AI가 자동으로 BOM을 생성합니다.
              <br />
              더 빠르고, 더 정확한 제품 관리를 경험하세요.
            </p>
          </div>
        </div>

        <div className="absolute bottom-8 left-8 z-10 text-sm text-white/50">&copy; {new Date().getFullYear()} Fabbit. All rights reserved.</div>
      </div>

      <div className="flex w-full items-center justify-center bg-background p-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center justify-center lg:hidden">
            <BrandLogo size="lg" />
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-foreground">로그인</h2>
            <p className="mt-2 text-sm text-muted-foreground">계정에 로그인하여 Fabbit을 시작하세요</p>
          </div>

          {errorMessage ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              {errorMessage}
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">
                이메일
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  autoComplete="email"
                  className="h-12 bg-background pl-10"
                  disabled={isSubmitting}
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  onChange={(event) => onEmailChange(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">
                  비밀번호
                </Label>
                {forgotPasswordAction}
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  autoComplete="current-password"
                  className="h-12 bg-background pl-10 pr-10"
                  disabled={isSubmitting}
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => onPasswordChange(event.target.value)}
                />
                <button
                  aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                  className="absolute right-3 top-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                  type="button"
                  onClick={onTogglePasswordVisibility}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button className="h-12 w-full text-base font-medium" disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  로그인 중...
                </>
              ) : (
                "로그인"
              )}
            </Button>
          </form>

          {socialLoginSection ? <div>{socialLoginSection}</div> : null}

          {isRegisterDomain ? (
            <p className="text-center text-sm text-muted-foreground">
              아직 계정이 없으신가요? {signupAction}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
