import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

// 소셜 로그인 아이콘 SVG
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function NaverIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#03C75A" d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z" />
    </svg>
  );
}

function KakaoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#000000"
        d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 01-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"
      />
    </svg>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithProvider, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    }
  };

  const handleSocialLogin = async (provider: "google" | "naver" | "kakao") => {
    setError("");

    try {
      await loginWithProvider(provider);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "소셜 로그인에 실패했습니다.");
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
            <br />
            더 빠르고, 더 정확한 제품 관리를 경험하세요.
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

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e2e8f0]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#f8fafc] px-4 text-[#94a3b8]">
                또는 소셜 계정으로 로그인
              </span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-12 border-[#e2e8f0] bg-white hover:bg-[#f8fafc]",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => handleSocialLogin("google")}
              disabled={isLoading}
            >
              <GoogleIcon className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-12 border-[#e2e8f0] bg-white hover:bg-[#f8fafc]",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => handleSocialLogin("naver")}
              disabled={isLoading}
            >
              <NaverIcon className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-12 border-[#e2e8f0] bg-[#FEE500] hover:bg-[#FDD835] border-[#FEE500]",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => handleSocialLogin("kakao")}
              disabled={isLoading}
            >
              <KakaoIcon className="h-5 w-5" />
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-center text-xs text-[#94a3b8]">
            Fabbit 이용을 위해서는 관리자의 초대가 필요합니다.
            <br />
            문의: support@fabbit.io
          </p>
        </div>
      </div>
    </div>
  );
}
