import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Turnstile } from "@marsidev/react-turnstile";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { SignupScreen as SignupScreenView } from "@fabbit/components";
import { useSendVerificationAction } from "@/features/auth/hooks/use-send-verification-action";
import { useVerifyEmailAction } from "@/features/auth/hooks/use-verify-email-action";
import { useEmailAvailabilityQuery } from "@/features/registration/hooks/use-email-availability-query";
import { useRegistrationStore } from "@/features/registration/stores/registration-store";
import { extractApiError } from "@/lib/api-error";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN = 60;

type SignupStep = 1 | 2 | 3;

export function SignupScreen() {
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
  const emailAvailabilityQuery = useEmailAvailabilityQuery(
    debouncedEmail,
    Boolean(debouncedEmail) && EMAIL_REGEX.test(debouncedEmail),
  );
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

  const emailStatusMessage = useMemo(() => {
    if (emailStatus === "available") {
      return "사용 가능한 이메일입니다.";
    }

    if (emailStatus === "checking") {
      return "이메일 사용 가능 여부를 확인하고 있습니다.";
    }

    if (emailStatus === "taken") {
      return emailAvailabilityQuery.data?.message ?? "이미 가입된 이메일입니다.";
    }

    if (emailStatus === "invalid") {
      return "올바른 이메일 형식을 입력해 주세요.";
    }

    return "";
  }, [emailAvailabilityQuery.data?.message, emailStatus]);

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
    <SignupScreenView
      confirmPassword={confirmPassword}
      email={email}
      emailStatus={emailStatus}
      emailStatusMessage={emailStatusMessage}
      errorMessage={error}
      isResendDisabled={cooldown > 0 || sendVerificationAction.isPending}
      isSendPending={sendVerificationAction.isPending}
      isVerifyPending={verifyEmailAction.isPending}
      loginAction={
        <Link className="font-medium text-primary" to="/login">
          로그인
        </Link>
      }
      name={name}
      password={password}
      resendLabel={cooldown > 0 ? `${cooldown}s` : "재발송"}
      showConfirmPassword={showConfirmPassword}
      showPassword={showPassword}
      step={step}
      verificationCode={verificationCode}
      verificationWidget={
        siteKey ? (
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
        )
      }
      onCompleteSignup={handleCompleteSignup}
      onConfirmPasswordChange={setConfirmPassword}
      onEditEmail={() => setStep(1)}
      onEmailChange={setEmail}
      onNameChange={setName}
      onPasswordChange={setPassword}
      onResend={() => {
        void handleResend();
      }}
      onSendVerification={(event) => {
        void handleSendVerification(event);
      }}
      onToggleConfirmPasswordVisibility={() => setShowConfirmPassword((previous) => !previous)}
      onTogglePasswordVisibility={() => setShowPassword((previous) => !previous)}
      onVerificationCodeChange={setVerificationCode}
      onVerifyCode={(event) => {
        void handleVerifyCode(event);
      }}
    />
  );
}
