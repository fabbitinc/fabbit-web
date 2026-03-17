import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { SignupScreenEmailStatus } from "@fabbit/components";
import { useNavigate } from "react-router-dom";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { useSendVerificationAction } from "@/features/auth/hooks/use-send-verification-action";
import { useVerifyEmailAction } from "@/features/auth/hooks/use-verify-email-action";
import { useEmailAvailabilityQuery } from "@/features/registration/hooks/use-email-availability-query";
import { useRegistrationStore } from "@/features/registration/stores/registration-store";
import { extractApiError } from "@/lib/api-error";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN = 60;

// OpenAPI `/api/v1/auth/send-verification`는 409(이미 가입된 이메일), 429(요청 제한)를 명시한다.
const SEND_VERIFICATION_STATUS_MESSAGES = {
  400: "인증 메일을 보낼 수 없습니다. 입력한 이메일과 보안 인증 상태를 다시 확인해 주세요.",
  409: "이미 가입된 이메일입니다.",
  429: "인증 메일을 너무 많이 요청했습니다. 잠시 후 다시 시도해 주세요.",
} as const;

// OpenAPI `/api/v1/auth/verify-email`는 400(잘못된 요청), 404(리소스를 찾을 수 없음)를 명시한다.
const VERIFY_EMAIL_STATUS_MESSAGES = {
  400: "인증코드를 다시 확인해 주세요.",
  404: "인증 요청을 찾을 수 없습니다. 인증 메일을 다시 보내 주세요.",
} as const;

type SignupStep = 1 | 2 | 3;

export function useSignupScreenLogic() {
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
  const [errorMessage, setErrorMessage] = useState("");
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

  const emailStatus = useMemo<SignupScreenEmailStatus>(() => {
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

  const handleSendVerification = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!normalizedEmail) {
      setErrorMessage("이메일을 입력해 주세요.");
      return;
    }

    if (!emailFormatValid) {
      setErrorMessage("올바른 이메일 형식을 입력해 주세요.");
      return;
    }

    if (siteKey && !turnstileToken) {
      setErrorMessage("보안 인증을 완료해 주세요.");
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
      setErrorMessage(
        extractApiError(sendError, {
          fallback: "인증코드 발송에 실패했습니다.",
          statusMessages: SEND_VERIFICATION_STATUS_MESSAGES,
        }),
      );
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    }
  };

  const handleVerifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (verificationCode.length !== 6) {
      setErrorMessage("6자리 인증코드를 입력해 주세요.");
      return;
    }

    try {
      const result = await verifyEmailAction.mutateAsync({
        code: verificationCode,
        email: normalizedEmail,
      });

      setVerificationToken(result.verification_token);
      setStep(3);
    } catch (verifyError) {
      setErrorMessage(
        extractApiError(verifyError, {
          fallback: "인증코드 확인에 실패했습니다.",
          statusMessages: VERIFY_EMAIL_STATUS_MESSAGES,
        }),
      );
    }
  };

  const handleResend = async () => {
    setErrorMessage("");

    try {
      await sendVerificationAction.mutateAsync({ email: normalizedEmail });
      setCooldown(RESEND_COOLDOWN);
      setVerificationCode("");
    } catch (resendError) {
      setErrorMessage(
        extractApiError(resendError, {
          fallback: "인증코드 재발송에 실패했습니다.",
          statusMessages: SEND_VERIFICATION_STATUS_MESSAGES,
        }),
      );
    }
  };

  const handleCompleteSignup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("이름을 입력해 주세요.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("비밀번호는 8자 이상 입력해 주세요.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    setSignupData({
      code: verificationCode,
      email: normalizedEmail,
      name: name.trim(),
      password,
      turnstileToken: turnstileToken ?? "",
      verificationToken,
    });

    navigate("/workspace");
  };

  return {
    confirmPassword,
    email,
    emailStatus,
    emailStatusMessage,
    errorMessage,
    isResendDisabled: cooldown > 0 || sendVerificationAction.isPending,
    isSendPending: sendVerificationAction.isPending,
    isVerifyPending: verifyEmailAction.isPending,
    name,
    password,
    resendLabel: cooldown > 0 ? `${cooldown}s` : "재발송",
    shouldRedirectToWorkspace: Boolean(scopedToken),
    showConfirmPassword,
    showPassword,
    siteKey,
    step,
    turnstileRef,
    verificationCode,
    handleCompleteSignup,
    handleEditEmail: () => setStep(1),
    handleEmailChange: setEmail,
    handleNameChange: setName,
    handlePasswordChange: setPassword,
    handleResend: () => {
      void handleResend();
    },
    handleSendVerification: (event: FormEvent<HTMLFormElement>) => {
      void handleSendVerification(event);
    },
    handleToggleConfirmPasswordVisibility: () => setShowConfirmPassword((previous) => !previous),
    handleTogglePasswordVisibility: () => setShowPassword((previous) => !previous),
    handleTurnstileError: () => setErrorMessage("보안 인증에 실패했습니다. 다시 시도해 주세요."),
    handleTurnstileExpire: () => setTurnstileToken(null),
    handleTurnstileSuccess: (token: string) => setTurnstileToken(token),
    handleVerificationCodeChange: setVerificationCode,
    handleVerifyCode: (event: FormEvent<HTMLFormElement>) => {
      void handleVerifyCode(event);
    },
    setConfirmPassword,
  };
}
