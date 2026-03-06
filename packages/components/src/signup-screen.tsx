import type { FormEventHandler, ReactNode } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button, Input, InputOTP, InputOTPGroup, InputOTPSlot, Label } from "@fabbit/ui";
import { OnboardingScreenShell } from "./onboarding-screen-shell";

export type SignupScreenStep = 1 | 2 | 3;
export type SignupScreenEmailStatus = "idle" | "invalid" | "checking" | "available" | "taken";

export interface SignupScreenProps {
  step: SignupScreenStep;
  email: string;
  verificationCode: string;
  name: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  emailStatus: SignupScreenEmailStatus;
  emailStatusMessage: string;
  errorMessage?: string;
  isResendDisabled?: boolean;
  isSendPending?: boolean;
  isVerifyPending?: boolean;
  loginAction?: ReactNode;
  resendLabel: string;
  verificationWidget?: ReactNode;
  onCompleteSignup: FormEventHandler<HTMLFormElement>;
  onConfirmPasswordChange: (value: string) => void;
  onEditEmail: () => void;
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onResend: () => void;
  onSendVerification: FormEventHandler<HTMLFormElement>;
  onToggleConfirmPasswordVisibility: () => void;
  onTogglePasswordVisibility: () => void;
  onVerificationCodeChange: (value: string) => void;
  onVerifyCode: FormEventHandler<HTMLFormElement>;
}

export function SignupScreen({
  step,
  email,
  verificationCode,
  name,
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  emailStatus,
  emailStatusMessage,
  errorMessage,
  isResendDisabled = false,
  isSendPending = false,
  isVerifyPending = false,
  loginAction,
  resendLabel,
  verificationWidget,
  onCompleteSignup,
  onConfirmPasswordChange,
  onEditEmail,
  onEmailChange,
  onNameChange,
  onPasswordChange,
  onResend,
  onSendVerification,
  onToggleConfirmPasswordVisibility,
  onTogglePasswordVisibility,
  onVerificationCodeChange,
  onVerifyCode,
}: SignupScreenProps) {
  return (
    <OnboardingScreenShell
      description="이메일 인증 후 이름과 비밀번호를 입력하면 다음 단계로 이동합니다."
      eyebrow="회원가입"
      errorMessage={errorMessage}
      footer={
        <p className="text-center text-sm text-muted-foreground">
          이미 계정이 있으신가요? {loginAction}
        </p>
      }
      title="새 워크스페이스를 시작합니다"
    >
      <div className="mb-8 flex gap-2">
        {[1, 2, 3].map((value) => (
          <div
            key={value}
            className={`h-2 flex-1 rounded-full ${value <= step ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>

      {step === 1 ? (
        <form className="space-y-5" onSubmit={onSendVerification}>
          <div className="space-y-2">
            <Label htmlFor="signup-email">이메일</Label>
            <Input
              id="signup-email"
              autoComplete="email"
              className="h-12"
              disabled={isSendPending}
              placeholder="name@company.com"
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
            />
            <p
              className={`text-xs ${
                emailStatus === "taken" || emailStatus === "invalid" ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {emailStatusMessage}
            </p>
          </div>

          {verificationWidget}

          <Button className="h-12 w-full" disabled={isSendPending} type="submit">
            {isSendPending ? (
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
        <form className="space-y-5" onSubmit={onVerifyCode}>
          <div className="space-y-2">
            <Label>인증코드</Label>
            <InputOTP maxLength={6} value={verificationCode} onChange={onVerificationCodeChange}>
              <InputOTPGroup className="w-full">
                {Array.from({ length: 6 }).map((_, index) => (
                  <InputOTPSlot key={index} className="h-12 flex-1" index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <p className="text-xs text-muted-foreground">{email}로 전송된 6자리 코드를 입력해 주세요.</p>
          </div>

          <div className="flex gap-3">
            <Button className="h-12 flex-1" disabled={isVerifyPending} type="submit">
              {isVerifyPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  확인 중...
                </>
              ) : (
                "인증 확인"
              )}
            </Button>
            <Button className="h-12" disabled={isResendDisabled || isSendPending} type="button" variant="outline" onClick={onResend}>
              {resendLabel}
            </Button>
          </div>

          <Button type="button" variant="ghost" onClick={onEditEmail}>
            이메일 다시 입력
          </Button>
        </form>
      ) : null}

      {step === 3 ? (
        <form className="space-y-5" onSubmit={onCompleteSignup}>
          <div className="space-y-2">
            <Label htmlFor="signup-name">이름</Label>
            <Input
              id="signup-name"
              className="h-12"
              placeholder="홍길동"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
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
                onChange={(event) => onPasswordChange(event.target.value)}
              />
              <button
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                className="absolute right-3 top-1/2 cursor-pointer text-muted-foreground"
                type="button"
                onClick={onTogglePasswordVisibility}
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
                onChange={(event) => onConfirmPasswordChange(event.target.value)}
              />
              <button
                aria-label={showConfirmPassword ? "비밀번호 확인 숨기기" : "비밀번호 확인 보기"}
                className="absolute right-3 top-1/2 cursor-pointer text-muted-foreground"
                type="button"
                onClick={onToggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <Button className="h-12 w-full" type="submit">
            워크스페이스 정보 입력
          </Button>
        </form>
      ) : null}
    </OnboardingScreenShell>
  );
}
