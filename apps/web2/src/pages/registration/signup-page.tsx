import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { Button, Input, InputOTP, InputOTPGroup, InputOTPSlot, Label } from "@fabbit/ui";
import { useSendVerificationAction } from "@/features/auth/hooks/use-send-verification-action";
import { useVerifyEmailAction } from "@/features/auth/hooks/use-verify-email-action";
import { useEmailAvailabilityQuery } from "@/features/registration/hooks/use-email-availability-query";
import { useRegistrationStore } from "@/features/registration/stores/registration-store";
import { extractApiError } from "@/lib/api-error";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN = 60;

type SignupStep = 1 | 2 | 3;

export function SignupPage() {
  const navigate = useNavigate();
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const scopedToken = useRegistrationStore((state) => state.scopedToken);
  const signupData = useRegistrationStore((state) => state.signupData);
  const setSignupData = useRegistrationStore((state) => state.setSignupData);

  const [step, setStep] = useState<SignupStep>(1);
  const [email, setEmail] = useState(signupData.email);
  const [debouncedEmail, setDebouncedEmail] = useState(signupData.email);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [name, setName] = useState(signupData.name);
  const [password, setPassword] = useState(signupData.password);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const normalizedEmail = email.trim().toLowerCase();
  const emailFormatValid = EMAIL_REGEX.test(normalizedEmail);
  const emailAvailabilityQuery = useEmailAvailabilityQuery(debouncedEmail, Boolean(debouncedEmail) && EMAIL_REGEX.test(debouncedEmail));
  const sendVerificationAction = useSendVerificationAction();
  const verifyEmailAction = useVerifyEmailAction();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedEmail(normalizedEmail);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [normalizedEmail]);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCooldown((previous) => previous - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  const emailStatus = useMemo(() => {
    if (!normalizedEmail) {
      return "idle";
    }

    if (!emailFormatValid) {
      return "invalid";
    }

    if (emailAvailabilityQuery.isFetching) {
      return "checking";
    }

    if (emailAvailabilityQuery.data?.available) {
      return "available";
    }

    if (emailAvailabilityQuery.data && !emailAvailabilityQuery.data.available) {
      return "taken";
    }

    return "idle";
  }, [emailAvailabilityQuery.data, emailAvailabilityQuery.isFetching, emailFormatValid, normalizedEmail]);

  if (scopedToken) {
    return <Navigate replace to="/workspace" />;
  }

  const handleSendVerification = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!normalizedEmail) {
      setError("이메일을 입력해 주세요.");
      return;
    }

    if (!emailFormatValid) {
      setError("올바른 이메일 형식을 입력해 주세요.");
      return;
    }

    if (siteKey && !turnstileToken) {
      setError("보안 인증을 완료해 주세요.");
      return;
    }

    try {
      await sendVerificationAction.mutateAsync({
        email: normalizedEmail,
        ...(turnstileToken ? { turnstile_token: turnstileToken } : {}),
      });

      setStep(2);
      setCooldown(RESEND_COOLDOWN);
    } catch (sendError) {
      setError(extractApiError(sendError, "인증코드 발송에 실패했습니다."));
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    }
  };

  const handleVerifyCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (verificationCode.length !== 6) {
      setError("6자리 인증코드를 입력해 주세요.");
      return;
    }

    try {
      const result = await verifyEmailAction.mutateAsync({
        email: normalizedEmail,
        code: verificationCode,
      });

      setVerificationToken(result.verification_token);
      setStep(3);
    } catch (verifyError) {
      setError(extractApiError(verifyError, "인증코드 확인에 실패했습니다."));
    }
  };

  const handleResend = async () => {
    setError("");

    try {
      await sendVerificationAction.mutateAsync({ email: normalizedEmail });
      setCooldown(RESEND_COOLDOWN);
      setVerificationCode("");
    } catch (resendError) {
      setError(extractApiError(resendError, "인증코드 재발송에 실패했습니다."));
    }
  };

  const handleCompleteSignup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
      email: normalizedEmail,
      password,
      turnstileToken: turnstileToken ?? "",
      verificationToken,
      code: verificationCode,
    });

    navigate("/workspace");
  };

  return (
    <section className="app-panel rounded-[32px] p-6 sm:p-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-muted-foreground">회원가입</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">새 워크스페이스를 시작합니다</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          이메일 인증 후 이름과 비밀번호를 입력하면 다음 단계로 이동합니다.
        </p>
      </div>

      <div className="mb-8 flex gap-2">
        {[1, 2, 3].map((value) => (
          <div
            key={value}
            className={`h-2 flex-1 rounded-full ${value <= step ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {step === 1 ? (
        <form className="space-y-5" onSubmit={handleSendVerification}>
          <div className="space-y-2">
            <Label htmlFor="signup-email">이메일</Label>
            <Input
              id="signup-email"
              autoComplete="email"
              className="h-12"
              disabled={sendVerificationAction.isPending}
              placeholder="name@company.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {emailStatus === "available" && "사용 가능한 이메일입니다."}
              {emailStatus === "checking" && "이메일 사용 가능 여부를 확인하고 있습니다."}
              {emailStatus === "taken" && (emailAvailabilityQuery.data?.message ?? "이미 가입된 이메일입니다.")}
              {emailStatus === "invalid" && "올바른 이메일 형식을 입력해 주세요."}
            </p>
          </div>

          {siteKey ? (
            <div className="overflow-hidden rounded-2xl border border-border/70 p-3">
              <Turnstile
                ref={turnstileRef}
                options={{ theme: "light" }}
                siteKey={siteKey}
                onError={() => setError("보안 인증에 실패했습니다. 다시 시도해 주세요.")}
                onExpire={() => setTurnstileToken(null)}
                onSuccess={(token) => setTurnstileToken(token)}
              />
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-border/70 px-4 py-3 text-xs text-muted-foreground">
              `VITE_TURNSTILE_SITE_KEY`가 없어 보안 인증 위젯은 숨겨졌습니다.
            </p>
          )}

          <Button className="h-12 w-full" disabled={sendVerificationAction.isPending} type="submit">
            {sendVerificationAction.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                발송 중...
              </>
            ) : (
              "인증코드 보내기"
            )}
          </Button>
        </form>
      ) : null}

      {step === 2 ? (
        <form className="space-y-5" onSubmit={handleVerifyCode}>
          <div className="space-y-2">
            <Label>인증코드</Label>
            <InputOTP maxLength={6} value={verificationCode} onChange={setVerificationCode}>
              <InputOTPGroup className="w-full">
                {Array.from({ length: 6 }).map((_, index) => (
                  <InputOTPSlot key={index} className="h-12 flex-1" index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <p className="text-xs text-muted-foreground">
              {normalizedEmail}로 전송된 6자리 코드를 입력해 주세요.
            </p>
          </div>

          <div className="flex gap-3">
            <Button className="h-12 flex-1" disabled={verifyEmailAction.isPending} type="submit">
              {verifyEmailAction.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  확인 중...
                </>
              ) : (
                "인증 확인"
              )}
            </Button>
            <Button
              className="h-12"
              disabled={cooldown > 0 || sendVerificationAction.isPending}
              type="button"
              variant="outline"
              onClick={() => void handleResend()}
            >
              {cooldown > 0 ? `${cooldown}s` : "재발송"}
            </Button>
          </div>

          <Button type="button" variant="ghost" onClick={() => setStep(1)}>
            이메일 다시 입력
          </Button>
        </form>
      ) : null}

      {step === 3 ? (
        <form className="space-y-5" onSubmit={handleCompleteSignup}>
          <div className="space-y-2">
            <Label htmlFor="signup-name">이름</Label>
            <Input
              id="signup-name"
              className="h-12"
              placeholder="홍길동"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password">비밀번호</Label>
            <div className="relative">
              <Input
                id="signup-password"
                className="h-12 pr-10"
                placeholder="8자 이상 입력해 주세요"
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

          <div className="space-y-2">
            <Label htmlFor="signup-confirm-password">비밀번호 확인</Label>
            <div className="relative">
              <Input
                id="signup-confirm-password"
                className="h-12 pr-10"
                placeholder="비밀번호를 다시 입력해 주세요"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
              <button
                className="absolute right-3 top-1/2 text-muted-foreground"
                type="button"
                onClick={() => setShowConfirmPassword((previous) => !previous)}
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <Button className="h-12 w-full" type="submit">
            다음 단계로 이동
          </Button>
        </form>
      ) : null}

      <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground">
        <Link className="text-primary" to="/login">
          로그인으로 돌아가기
        </Link>
        <div className="flex items-center gap-2">
          <Check className="size-4 text-primary" />
          단계 저장됨
        </div>
      </div>
    </section>
  );
}
