import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginAction } from "@/features/auth/hooks/use-login-action";
import { extractApiError } from "@/lib/api-error";
import { isRootDomain } from "@/lib/subdomain";

const LOGIN_STATUS_MESSAGES = {
  401: "이메일 또는 비밀번호가 올바르지 않습니다.",
  403: "로그인이 허용되지 않은 계정입니다. 관리자에게 문의해 주세요.",
} as const;

export function useLoginScreenLogic() {
  const navigate = useNavigate();
  const loginAction = useLoginAction();
  const [email, setEmail] = useState(import.meta.env.DEV ? "test@gmail.com" : "");
  const [password, setPassword] = useState(import.meta.env.DEV ? "qwer1234" : "");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isRegisterDomain = isRootDomain();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    try {
      const result = await loginAction.mutateAsync({ email, password });
      navigate(result.destination);
    } catch (loginError) {
      setErrorMessage(
        extractApiError(loginError, {
          fallback: "로그인에 실패했습니다.",
          statusMessages: LOGIN_STATUS_MESSAGES,
        }),
      );
    }
  };

  return {
    email,
    errorMessage,
    isRegisterDomain,
    isSubmitting: loginAction.isPending,
    password,
    showPassword,
    setEmail,
    setPassword,
    togglePasswordVisibility: () => setShowPassword((previous) => !previous),
    handleSubmit,
  };
}
