import { Link, Navigate } from "react-router-dom";
import { Turnstile } from "@marsidev/react-turnstile";
import { SignupScreen } from "@fabbit/components";
import { useSignupScreenLogic } from "@/features/registration/hooks/use-signup-screen-logic";

export function SignupPage() {
  const {
    confirmPassword,
    email,
    emailStatus,
    emailStatusMessage,
    errorMessage,
    isResendDisabled,
    isSendPending,
    isVerifyPending,
    name,
    password,
    resendLabel,
    setConfirmPassword,
    shouldRedirectToWorkspace,
    showConfirmPassword,
    showPassword,
    siteKey,
    step,
    turnstileRef,
    verificationCode,
    handleCompleteSignup,
    handleEditEmail,
    handleEmailChange,
    handleNameChange,
    handlePasswordChange,
    handleResend,
    handleSendVerification,
    handleToggleConfirmPasswordVisibility,
    handleTogglePasswordVisibility,
    handleTurnstileError,
    handleTurnstileExpire,
    handleTurnstileSuccess,
    handleVerificationCodeChange,
    handleVerifyCode,
  } = useSignupScreenLogic();

  if (shouldRedirectToWorkspace) {
    return <Navigate replace to="/workspace" />;
  }

  return (
    <SignupScreen
      confirmPassword={confirmPassword}
      email={email}
      emailStatus={emailStatus}
      emailStatusMessage={emailStatusMessage}
      errorMessage={errorMessage}
      isResendDisabled={isResendDisabled}
      isSendPending={isSendPending}
      isVerifyPending={isVerifyPending}
      loginAction={
        <Link className="font-medium text-primary" to="/login">
          로그인
        </Link>
      }
      name={name}
      password={password}
      resendLabel={resendLabel}
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
              onError={handleTurnstileError}
              onExpire={handleTurnstileExpire}
              onSuccess={handleTurnstileSuccess}
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
      onEditEmail={handleEditEmail}
      onEmailChange={handleEmailChange}
      onNameChange={handleNameChange}
      onPasswordChange={handlePasswordChange}
      onResend={handleResend}
      onSendVerification={handleSendVerification}
      onToggleConfirmPasswordVisibility={handleToggleConfirmPasswordVisibility}
      onTogglePasswordVisibility={handleTogglePasswordVisibility}
      onVerificationCodeChange={handleVerificationCodeChange}
      onVerifyCode={handleVerifyCode}
    />
  );
}
