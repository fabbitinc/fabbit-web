import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { useRegistrationStore } from "@/stores/registrationStore";
import { SocialLoginSection } from "@/components/auth/SocialLoginSection";
import { loginScoped } from "@/api";
import { isRootDomain } from "@/lib/subdomain";
import { extractApiError } from "@/lib/api-error";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  // TODO: 개발용 기본값 제거
  const [email, setEmail] = useState(
    import.meta.env.DEV ? "test@gmail.com" : "",
  );
  const [password, setPassword] = useState(
    import.meta.env.DEV ? "qwer1234" : "",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const isRegister = isRootDomain();
  const setScopedToken = useRegistrationStore((s) => s.setScopedToken);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegister) {
        // register 도메인: scoped login → 조직 생성 플로우
        const response = await loginScoped({ email, password });
        setScopedToken(response.scoped_token);
        navigate("/workspace");
      } else {
        // 워크스페이스 도메인: 기존 로그인
        await login(email, password);
        navigate("/");
      }
    } catch (err) {
      setError(extractApiError(err, "로그인에 실패했습니다."));
    }
  };


  return (
    <div className="flex min-h-screen">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#3b82f6] via-[#6366f1] to-[#8b5cf6] flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        {/* Content Container - 중앙 정렬 */}
        <div className="relative z-10 flex flex-col justify-between h-full w-full max-w-md mx-auto px-8 py-12">
          {/* Logo & Title */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <svg
                  className="h-7 w-7 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-white">Fabbit</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white leading-tight">
              AI 기반 초경량
              <br />
              PLM 시스템
            </h1>
            <p className="text-lg text-white/80 max-w-md">
              도면을 업로드하면 AI가 자동으로 BOM을 생성합니다.
              <br />더 빠르고, 더 정확한 제품 관리를 경험하세요.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 pt-4">
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white">
                AI 도면 분석
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white">
                자동 BOM 생성
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white">
                실시간 협업
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm text-white/60">
            &copy; 2024 Fabbit. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-[#f8fafc]">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6]">
              <svg
                className="h-6 w-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-xl font-bold text-[#0f172a]">Fabbit</span>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-[#0f172a]">로그인</h2>
            <p className="mt-2 text-sm text-[#64748b]">
              계정에 로그인하여 Fabbit을 시작하세요
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#334155]">
                이메일
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94a3b8]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-white border-[#e2e8f0] focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[#334155]">
                  비밀번호
                </Label>
                <button
                  type="button"
                  className="text-xs text-[#3b82f6] hover:text-[#2563eb] transition-colors"
                >
                  비밀번호 찾기
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94a3b8]" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 bg-white border-[#e2e8f0] focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b]"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#3b82f6] hover:bg-[#2563eb] text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  로그인 중...
                </>
              ) : (
                "로그인"
              )}
            </Button>
          </form>

          <SocialLoginSection />

          {/* Register 도메인에서 회원가입 링크 */}
          {isRegister && (
            <p className="text-center text-sm text-[#64748b]">
              아직 계정이 없으신가요?{" "}
              <Link to="/signup" className="font-medium text-[#3b82f6] hover:text-[#2563eb] transition-colors">
                회원가입
              </Link>
            </p>
          )}

          {/* Footer Note */}
          <p className="text-center text-sm text-[#64748b]">
            &copy; 2024 Fabbit. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
