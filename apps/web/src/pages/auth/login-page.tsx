import { Link } from "react-router-dom";
import { LoginScreen } from "@fabbit/components";
import { useLoginScreenLogic } from "@/features/auth/hooks/use-login-screen-logic";

export function LoginPage() {
  const {
    email,
    errorMessage,
    isRegisterDomain,
    isSubmitting,
    password,
    showPassword,
    setEmail,
    setPassword,
    togglePasswordVisibility,
    handleSubmit,
  } = useLoginScreenLogic();

  return (
    <LoginScreen
      email={email}
      errorMessage={errorMessage}
      forgotPasswordAction={
        <button className="cursor-pointer text-xs text-primary" type="button">
          비밀번호 찾기
        </button>
      }
      isRegisterDomain={isRegisterDomain}
      isSubmitting={isSubmitting}
      password={password}
      showPassword={showPassword}
      signupAction={
        <Link className="font-medium text-primary" to="/signup">
          회원가입
        </Link>
      }
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
      onTogglePasswordVisibility={togglePasswordVisibility}
    />
  );
}
