import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, User } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
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
      <path
        fill="#03C75A"
        d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"
      />
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

export function SignupPage() {
  const navigate = useNavigate();
  const { signup, loginWithProvider, isLoading } = useAuthStore();
  const { setStep } = useOnboardingStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  useEffect(() => {
    setStep(1);
  }, [setStep]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!turnstileToken) {
      setError("보안 인증을 완료해 주세요.");
      return;
    }

    try {
      // TODO: turnstileToken을 백엔드로 전달하여 검증
      await signup(name, email, password);
      navigate("/onboarding/workspace");
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    }
  };

  const handleSocialSignup = async (provider: "google" | "naver" | "kakao") => {
    setError("");

    try {
      await loginWithProvider(provider);
      navigate("/onboarding/workspace");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "소셜 가입에 실패했습니다.",
      );
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* 상단 헤더 */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6]">
            <User className="h-6 w-6 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[#0f172a]">계정 생성</h1>
        <p className="text-sm text-[#64748b]">
          Fabbit으로 제품 관리를 시작하세요
        </p>
      </div>

      {/* 카드 */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-8 shadow-sm">
        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600 mb-6">
            {error}
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium text-[#0f172a]">
              이름
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 bg-white border-[#e2e8f0]"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-[#0f172a]">
              이메일
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 bg-white border-[#e2e8f0]"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-[#0f172a]">
              비밀번호
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="8자 이상 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "h-11 pr-10 bg-white",
                  password && password.length < 8
                    ? "border-red-300 focus:border-red-400 focus:ring-red-400/20"
                    : "border-[#e2e8f0]",
                )}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password && password.length < 8 && (
              <p className="text-xs text-red-500">8자 이상 입력해 주세요</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-[#0f172a]">
              비밀번호 확인
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="비밀번호를 다시 입력하세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn(
                  "h-11 pr-10 bg-white",
                  confirmPassword && confirmPassword !== password
                    ? "border-red-300 focus:border-red-400 focus:ring-red-400/20"
                    : confirmPassword && password.length >= 8 && confirmPassword === password
                      ? "border-[#22c55e] focus:border-[#22c55e] focus:ring-[#22c55e]/20"
                      : "border-[#e2e8f0]",
                )}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b]"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p className="text-xs text-red-500">비밀번호가 일치하지 않습니다</p>
            )}
            {confirmPassword && password.length >= 8 && confirmPassword === password && (
              <p className="text-xs text-[#22c55e]">비밀번호가 일치합니다</p>
            )}
          </div>

          {/* Turnstile CAPTCHA */}
          <div className="flex justify-center">
            <Turnstile
              siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
              onSuccess={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setTurnstileToken(null)}
              options={{ theme: "light", language: "ko" }}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-[#3b82f6] hover:bg-[#2563eb] text-base font-medium"
            disabled={isLoading || !turnstileToken}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                가입 중...
              </>
            ) : (
              "다음"
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e2e8f0]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-4 text-[#94a3b8]">
              또는 소셜 계정으로 가입
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
              isLoading && "opacity-50 cursor-not-allowed",
            )}
            onClick={() => handleSocialSignup("google")}
            disabled={isLoading}
          >
            <GoogleIcon className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-12 border-[#e2e8f0] bg-white hover:bg-[#f8fafc]",
              isLoading && "opacity-50 cursor-not-allowed",
            )}
            onClick={() => handleSocialSignup("naver")}
            disabled={isLoading}
          >
            <NaverIcon className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-12 border-[#e2e8f0] bg-[#FEE500] hover:bg-[#FDD835] border-[#FEE500]",
              isLoading && "opacity-50 cursor-not-allowed",
            )}
            onClick={() => handleSocialSignup("kakao")}
            disabled={isLoading}
          >
            <KakaoIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* 로그인 링크 */}
      <p className="text-center text-sm text-[#64748b]">
        이미 계정이 있으신가요?{" "}
        <Link
          to="/login"
          className="font-medium text-[#3b82f6] hover:text-[#2563eb] transition-colors"
        >
          로그인
        </Link>
      </p>
    </div>
  );
}
