import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { Button, Input, Label } from "@fabbit/ui";
import { SocialLoginSection } from "@/features/auth/components/social-login-section";
import { useLoginAction } from "@/features/auth/hooks/use-login-action";
import { extractApiError } from "@/lib/api-error";
import { isRootDomain } from "@/lib/subdomain";

export function LoginPage() {
  const navigate = useNavigate();
  const loginAction = useLoginAction();
  const [email, setEmail] = useState(import.meta.env.DEV ? "test@gmail.com" : "");
  const [password, setPassword] = useState(import.meta.env.DEV ? "qwer1234" : "");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const isRegisterDomain = isRootDomain();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      const result = await loginAction.mutateAsync({ email, password });
      navigate(result.destination);
    } catch (loginError) {
      setError(extractApiError(loginError, "로그인에 실패했습니다."));
    }
  };

  return (
    <div className="grid overflow-hidden rounded-[32px] border border-border/70 bg-card shadow-[0_32px_120px_-72px_color-mix(in_srgb,var(--foreground)_45%,transparent)] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="auth-hero hidden p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/72">Fabbit</p>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight">
            AI 기반으로
            <br />
            PLM 운영 구조를 가볍게 만듭니다.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/76">
            `web2`는 기존 화면을 그대로 복사하지 않고, 공용 UI와 정리된 레이어 위에 다시 쌓고 있습니다.
          </p>
        </div>
        <div className="space-y-2 text-sm text-white/72">
          <p>도면 업로드와 BOM 분석</p>
          <p>프로젝트/변경 흐름 연결</p>
          <p>강한 페이지/훅/API 경계</p>
        </div>
      </section>

      <section className="p-6 sm:p-8 lg:p-10">
        <div className="mx-auto flex min-h-[640px] max-w-md flex-col justify-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground">로그인</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">워크스페이스에 접속합니다</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              계정으로 로그인해 새 구조의 Fabbit 화면으로 이동합니다.
            </p>
          </div>

          {error ? (
            <div className="mt-6 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  autoComplete="email"
                  className="h-12 pl-10"
                  disabled={loginAction.isPending}
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">비밀번호</Label>
                <button className="text-xs text-primary" type="button">
                  비밀번호 찾기
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  autoComplete="current-password"
                  className="h-12 pl-10 pr-10"
                  disabled={loginAction.isPending}
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  className="absolute right-3 top-1/2 text-muted-foreground"
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button className="h-12 w-full" disabled={loginAction.isPending} type="submit">
              {loginAction.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  로그인 중...
                </>
              ) : (
                "로그인"
              )}
            </Button>
          </form>

          <div className="mt-6">
            <SocialLoginSection />
          </div>

          {isRegisterDomain ? (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              아직 계정이 없으신가요?{" "}
              <Link className="font-medium text-primary" to="/signup">
                회원가입
              </Link>
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
