import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { useRegistrationStore } from "@/stores/registrationStore";
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mockTakenEmails = ["admin@fabbit.com", "test@company.com", "demo@maker.co.kr"];
type EmailStatus = "idle" | "invalid" | "checking" | "available" | "taken";

export function SignupPage() {
  const navigate = useNavigate();
  const { loginWithProvider, isLoading } = useAuthStore();
  const { signupData, setSignupData } = useRegistrationStore();

  const [name, setName] = useState(signupData.name);
  const [email, setEmail] = useState(signupData.email);
  const [password, setPassword] = useState(signupData.password);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle");
  const [emailError, setEmailError] = useState<string>("");

  useEffect(() => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setEmailStatus("idle");
      setEmailError("");
      return;
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setEmailStatus("invalid");
      setEmailError("올바른 이메일 형식을 입력해 주세요.");
      return;
    }

    setEmailStatus("checking");
    setEmailError("");

    const timer = setTimeout(() => {
      if (mockTakenEmails.includes(normalizedEmail)) {
        setEmailStatus("taken");
        setEmailError("이미 사용 중인 이메일입니다. (mock)");
        return;
      }

      setEmailStatus("available");
    }, 400);

    return () => clearTimeout(timer);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("필수 정보를 모두 입력해 주세요.");
      return;
    }

    if (password.length < 8) {
      setError("비밀번호는 8자 이상 입력해 주세요.");
      return;
    }

    if (emailStatus !== "available") {
      setError(emailError || "이메일을 확인해 주세요.");
      return;
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!turnstileToken) {
      setError("보안 인증을 완료해 주세요.");
      return;
    }

    setSignupData({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });
    navigate("/register/workspace");
  };

  const handleSocialSignup = async (provider: "google" | "naver" | "kakao") => {
    setError("");

    try {
      await loginWithProvider(provider);
      navigate("/register/workspace");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "소셜 가입에 실패했습니다.",
      );
    }
  };

  const canProceed =
    name.trim().length > 0 &&
    emailStatus === "available" &&
    password.length >= 8 &&
    confirmPassword.length > 0 &&
    confirmPassword === password &&
    !!turnstileToken;

  return (
    <div className="flex w-full max-w-[1000px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-gray-200/50 md:grid md:grid-cols-2">
      {/* Left Column: Branding / Marketing */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 p-10 text-white md:flex">
        {/* Background Gradients/Patterns */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700" />
        <div className="absolute top-0 left-0 h-full w-full bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full bg-blue-500 blur-3xl opacity-20" />
        <div className="absolute -left-20 -bottom-20 h-[300px] w-[300px] rounded-full bg-indigo-500 blur-3xl opacity-20" />

        {/* Content */}
        <div className="relative z-10">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">Fabbit</span>
          </div>

          <h2 className="mb-4 text-3xl font-bold leading-tight">
            스마트한 제조 관리의 시작,<br />
            지금 바로 경험해보세요.
          </h2>
          <p className="text-blue-100 leading-relaxed opacity-90">
            복잡한 BOM 관리부터 실시간 공정 모니터링까지.<br />
            Fabbit 하나로 모든 제조 데이터를 연결하세요.
          </p>
        </div>

      </div>

      {/* Right Column: Sign Up Form */}
      <div className="flex flex-col justify-center p-8 md:p-12 bg-white">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">계정 만들기</h1>
          <p className="mt-2 text-sm text-gray-500">
            30초만에 가입하고 무료로 시작하세요.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">이름</Label>
            <Input
              id="name"
              type="text"
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">이메일</Label>
              {(emailStatus === "invalid" || emailStatus === "taken") && (
                <span className="text-xs text-red-500">{emailError}</span>
              )}
              {emailStatus === "available" && (
                <span className="text-xs text-green-600">사용 가능 (mock)</span>
              )}
            </div>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "h-11 pr-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                  (emailStatus === "invalid" || emailStatus === "taken") &&
                    "border-red-300 focus:border-red-400 focus:ring-red-400/20",
                  emailStatus === "available" &&
                    "border-green-500 focus:border-green-500 focus:ring-green-500/20",
                )}
                disabled={isLoading}
              />
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                {emailStatus === "checking" && (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                )}
                {emailStatus === "available" && <Check className="h-4 w-4 text-green-600" />}
                {(emailStatus === "invalid" || emailStatus === "taken") && (
                  <X className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">비밀번호</Label>
              {password && password.length < 8 && (
                <span className="text-xs text-red-500">8자 이상 입력해 주세요</span>
              )}
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="8자 이상 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "h-11 pr-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                  password && password.length < 8
                    ? "border-red-300 focus:border-red-400 focus:ring-red-400/20"
                    : ""
                )}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">비밀번호 확인</Label>
              {confirmPassword && confirmPassword !== password && (
                <span className="text-xs text-red-500">비밀번호가 일치하지 않습니다</span>
              )}
              {confirmPassword && password.length >= 8 && confirmPassword === password && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <Check className="w-3 h-3" /> 일치
                </span>
              )}
            </div>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="비밀번호를 다시 입력하세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn(
                  "h-11 pr-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                  confirmPassword && confirmPassword !== password
                    ? "border-red-300 focus:border-red-400 focus:ring-red-400/20"
                    : confirmPassword && password.length >= 8 && confirmPassword === password
                      ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
                      : ""
                )}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Turnstile CAPTCHA */}
          <div className="flex justify-center pt-1">
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
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-semibold shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/30"
            disabled={isLoading || !canProceed}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                처리 중...
              </>
            ) : (
              "다음"
            )}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-gray-500 font-medium">
              Social Login
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-12 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all"
            onClick={() => handleSocialSignup("google")}
            disabled={isLoading}
          >
            <GoogleIcon className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all"
            onClick={() => handleSocialSignup("naver")}
            disabled={isLoading}
          >
            <NaverIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all"
            onClick={() => handleSocialSignup("kakao")}
            disabled={isLoading}
          >
            <KakaoIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
