import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoginScreen as LoginScreenView } from "@fabbit/components";
import { useLoginAction } from "@/features/auth/hooks/use-login-action";
import { extractApiError } from "@/lib/api-error";
import { isRootDomain } from "@/lib/subdomain";
import { SocialLoginSection } from "./social-login-section";

export function LoginScreen() {
  const navigate = useNavigate();
  const loginAction = useLoginAction();
  const [email, setEmail] = useState(import.meta.env.DEV ? "test@gmail.com" : "");
  const [password, setPassword] = useState(import.meta.env.DEV ? "qwer1234" : "");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const isRegisterDomain = isRootDomain();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      const result = await loginAction.mutateAsync({ email, password });
      navigate(result.destination);
    } catch (loginError) {
      setError(extractApiError(loginError, "로그인에 실패했습니다."));
    }
  };

  return (
    <LoginScreenView
      email={email}
      errorMessage={error}
      forgotPasswordAction={
        <button className="cursor-pointer text-xs text-primary" type="button">
          비밀번호 찾기
        </button>
      }
      isRegisterDomain={isRegisterDomain}
      isSubmitting={loginAction.isPending}
      password={password}
      showPassword={showPassword}
      signupAction={
        <Link className="font-medium text-primary" to="/signup">
          회원가입
        </Link>
      }
      socialLoginSection={<SocialLoginSection />}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
      onTogglePasswordVisibility={() => setShowPassword((previous) => !previous)}
    />
  );
}
