import type { FormEventHandler, ReactNode } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { Button, Input, Label } from "@fabbit/ui";

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
      <div className="hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 lg:flex lg:w-1/2">
        <div className="relative z-10 flex h-full w-full max-w-md flex-col justify-between px-8 py-12">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <span className="text-2xl font-semibold text-white">F</span>
              </div>
              <span className="text-2xl font-bold text-white">Fabbit</span>
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight text-white">
              AI 기반 초경량
              <br />
              PLM 시스템
            </h1>
            <p className="max-w-md text-lg text-white/80">
              도면을 업로드하면 AI가 자동으로 BOM을 생성합니다.
              <br />
              더 빠르고, 더 정확한 제품 관리를 경험하세요.
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              <span className="rounded-full bg-white/20 px-4 py-2 text-sm text-white backdrop-blur-sm">AI 도면 분석</span>
              <span className="rounded-full bg-white/20 px-4 py-2 text-sm text-white backdrop-blur-sm">자동 BOM 생성</span>
              <span className="rounded-full bg-white/20 px-4 py-2 text-sm text-white backdrop-blur-sm">실시간 협업</span>
            </div>
          </div>

          <div className="text-sm text-white/60">&copy; 2024 Fabbit. All rights reserved.</div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-slate-50 p-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500">
              <span className="text-xl font-semibold text-white">F</span>
            </div>
            <span className="text-xl font-bold text-slate-900">Fabbit</span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-slate-900">로그인</h2>
            <p className="mt-2 text-sm text-slate-500">계정에 로그인하여 Fabbit을 시작하세요</p>
          </div>

          {errorMessage ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {errorMessage}
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label className="text-slate-700" htmlFor="email">
                이메일
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  autoComplete="email"
                  className="h-12 border-slate-200 bg-white pl-10 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
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
                <Label className="text-slate-700" htmlFor="password">
                  비밀번호
                </Label>
                {forgotPasswordAction}
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  autoComplete="current-password"
                  className="h-12 border-slate-200 bg-white pl-10 pr-10 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                  disabled={isSubmitting}
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => onPasswordChange(event.target.value)}
                />
                <button
                  aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                  className="absolute right-3 top-1/2 cursor-pointer text-slate-400 hover:text-slate-500"
                  type="button"
                  onClick={onTogglePasswordVisibility}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button className="h-12 w-full bg-blue-500 text-base font-medium hover:bg-blue-600" disabled={isSubmitting} type="submit">
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
            <p className="text-center text-sm text-slate-500">
              아직 계정이 없으신가요? {signupAction}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
