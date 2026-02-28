import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Check, ArrowLeft, X } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useRegistrationStore } from "@/stores/registrationStore";
import { SocialLoginSection } from "@/components/auth/SocialLoginSection";
import { sendVerification, verifyEmail, checkEmail } from "@/api";
import { extractApiError } from "@/lib/api-error";
import { cn } from "@/lib/utils";


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN = 60;

type Step = 1 | 2 | 3;

export function SignupPage() {
  const navigate = useNavigate();
  const { signupData, setSignupData, scopedToken } = useRegistrationStore();

  // scopedToken이 있으면 이미 로그인된 상태 → workspace로 리다이렉트
  if (scopedToken) {
    return <Navigate to="/workspace" replace />;
  }

  const [step, setStep] = useState<Step>(1);

  // Step 1 상태
  const [email, setEmail] = useState(signupData.email);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const [emailStatus, setEmailStatus] = useState<"idle" | "invalid" | "checking" | "available" | "taken">("idle");
  const [emailError, setEmailError] = useState("");

  // Step 2 상태
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Step 3 상태
  const [name, setName] = useState(signupData.name);
  const [password, setPassword] = useState(signupData.password);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 공통 상태
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 이메일 디바운스 검증
  useEffect(() => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setEmailStatus("idle");
      setEmailError("");
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setEmailStatus("invalid");
      setEmailError("올바른 이메일 형식을 입력해 주세요.");
      return;
    }

    setEmailStatus("checking");
    setEmailError("");
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const result = await checkEmail(trimmed);
        if (!cancelled) {
          if (result.available) {
            setEmailStatus("available");
            setEmailError("");
          } else {
            setEmailStatus("taken");
            setEmailError(result.message ?? "이미 가입된 이메일입니다.");
          }
        }
      } catch (err) {
        if (!cancelled) {
          setEmailStatus("taken");
          setEmailError(extractApiError(err, "이메일 확인에 실패했습니다."));
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [email]);

  // 쿨다운 타이머
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Step 1: 인증코드 발송
  const handleSendVerification = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("이메일을 입력해 주세요.");
      return;
    }
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setError("올바른 이메일 형식을 입력해 주세요.");
      return;
    }
    if (!turnstileToken) {
      setError("보안 인증을 완료해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      await sendVerification({
        email: normalizedEmail,
        turnstile_token: turnstileToken,
      });
      setStep(2);
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(extractApiError(err, "인증코드 발송에 실패했습니다."));
      // Turnstile 리셋 (사용된 토큰 재생성)
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } finally {
      setSubmitting(false);
    }
  }, [email, turnstileToken]);

  // Step 2: 인증코드 확인
  const handleVerifyCode = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (verificationCode.length !== 6) {
      setError("6자리 인증코드를 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await verifyEmail({
        email: email.trim().toLowerCase(),
        code: verificationCode,
      });
      setVerificationToken(result.verification_token);
      setStep(3);
    } catch (err) {
      setError(extractApiError(err, "인증코드 확인에 실패했습니다."));
    } finally {
      setSubmitting(false);
    }
  }, [email, verificationCode]);

  // Step 2: 재발송
  const handleResend = useCallback(async () => {
    setError("");
    setSubmitting(true);
    // Turnstile 리셋 후 새 토큰으로 재발송
    turnstileRef.current?.reset();
    try {
      await sendVerification({
        email: email.trim().toLowerCase(),
      });
      setCooldown(RESEND_COOLDOWN);
      setVerificationCode("");
    } catch (err) {
      setError(extractApiError(err, "재발송에 실패했습니다."));
    } finally {
      setSubmitting(false);
    }
  }, [email]);

  // Step 3: 이름/비밀번호 입력 후 다음 단계
  const handleCompleteSignup = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("이름을 입력해 주세요.");
      return;
    }
    if (password.length < 8) {
      setError("비밀번호는 8자 이상 입력해 주세요.");
      return;
    }
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setSignupData({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      turnstileToken: "",
      verificationToken,
      code: verificationCode,
    });
    navigate("/workspace");
  }, [name, email, password, confirmPassword, verificationToken, verificationCode, setSignupData, navigate]);

  // Step 2 → Step 1 복귀
  const handleBackToStep1 = () => {
    setStep(1);
    setVerificationCode("");
    setCooldown(0);
    setError("");
    setEmailStatus("idle");
    setEmailError("");
    // Turnstile 리셋
    turnstileRef.current?.reset();
    setTurnstileToken(null);
  };


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
            {step === 1 && "이메일을 입력하고 인증코드를 받으세요."}
            {step === 2 && "이메일로 전송된 인증코드를 입력해 주세요."}
            {step === 3 && "이름과 비밀번호를 설정해 주세요."}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
            {error}
          </div>
        )}

        {/* Step 1: 이메일 + Turnstile */}
        {step === 1 && (
          <>
            <form onSubmit={handleSendVerification} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">이메일</Label>
                  {emailStatus === "available" && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <Check className="w-3 h-3" /> 사용 가능
                    </span>
                  )}
                  {(emailStatus === "invalid" || emailStatus === "taken") && (
                    <span className="text-xs text-red-500">{emailError}</span>
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
                      emailStatus === "available" && "border-green-500 focus:border-green-500 focus:ring-green-500/20",
                      (emailStatus === "invalid" || emailStatus === "taken") && "border-red-300 focus:border-red-400 focus:ring-red-400/20",
                    )}
                    disabled={submitting || submitting}
                    autoFocus
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {emailStatus === "checking" && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                    {emailStatus === "available" && <Check className="h-4 w-4 text-green-600" />}
                    {(emailStatus === "invalid" || emailStatus === "taken") && <X className="h-4 w-4 text-red-500" />}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-sm font-semibold shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/30"
                disabled={submitting || submitting || emailStatus !== "available" || !turnstileToken}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    발송 중...
                  </>
                ) : (
                  "인증코드 발송"
                )}
              </Button>

              {/* Turnstile CAPTCHA */}
              <div className="flex justify-center pt-1">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  onError={() => setTurnstileToken(null)}
                  options={{ theme: "light", language: "ko" }}
                />
              </div>
            </form>

            <SocialLoginSection />

            <p className="mt-6 text-center text-sm text-gray-500">
              이미 계정이 있으신가요?{" "}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
                로그인
              </Link>
            </p>
          </>
        )}

        {/* Step 2: 인증코드 입력 */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
              <strong>{email.trim().toLowerCase()}</strong>로 인증코드를 발송했습니다.
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">인증코드</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={verificationCode}
                  onChange={setVerificationCode}
                  disabled={submitting}
                  autoFocus
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="h-11 w-11 text-lg" />
                    <InputOTPSlot index={1} className="h-11 w-11 text-lg" />
                    <InputOTPSlot index={2} className="h-11 w-11 text-lg" />
                    <InputOTPSlot index={3} className="h-11 w-11 text-lg" />
                    <InputOTPSlot index={4} className="h-11 w-11 text-lg" />
                    <InputOTPSlot index={5} className="h-11 w-11 text-lg" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-semibold shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/30"
              disabled={submitting || verificationCode.length !== 6}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  확인 중...
                </>
              ) : (
                "확인"
              )}
            </Button>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleBackToStep1}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                다른 이메일로 변경
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || submitting}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {cooldown > 0 ? `재발송 (${cooldown}초)` : "인증코드 재발송"}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: 이름 + 비밀번호 */}
        {step === 3 && (
          <form onSubmit={handleCompleteSignup} className="space-y-4">
            <div className="rounded-lg bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
              <Check className="h-4 w-4" />
              <strong>{email.trim().toLowerCase()}</strong> 인증 완료
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">이름</Label>
              <Input
                id="name"
                type="text"
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                disabled={submitting}
                autoFocus
              />
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
                  className={
                    "h-11 pr-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors" +
                    (password && password.length < 8
                      ? " border-red-300 focus:border-red-400 focus:ring-red-400/20"
                      : "")
                  }
                  disabled={submitting}
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
                  className={
                    "h-11 pr-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors" +
                    (confirmPassword && confirmPassword !== password
                      ? " border-red-300 focus:border-red-400 focus:ring-red-400/20"
                      : confirmPassword && password.length >= 8 && confirmPassword === password
                        ? " border-green-500 focus:border-green-500 focus:ring-green-500/20"
                        : "")
                  }
                  disabled={submitting}
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

            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-semibold shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/30"
              disabled={
                submitting ||
                !name.trim() ||
                password.length < 8 ||
                !confirmPassword ||
                confirmPassword !== password
              }
            >
              다음
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
