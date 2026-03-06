import axios from "axios";

const ERROR_MESSAGES: Record<string, string> = {
  ALREADY_EXISTS: "이미 가입된 이메일입니다.",
  COOLDOWN_ACTIVE: "잠시 후 다시 시도해 주세요.",
  INVALID_EMAIL: "올바른 이메일 형식을 입력해 주세요.",
  TURNSTILE_FAILED: "보안 인증에 실패했습니다. 다시 시도해 주세요.",
  INVALID_CODE: "인증코드가 올바르지 않습니다.",
  CODE_EXPIRED: "인증코드가 만료되었습니다. 다시 발송해 주세요.",
  TOO_MANY_ATTEMPTS: "인증 시도 횟수를 초과했습니다. 다시 발송해 주세요.",
  TOKEN_EXPIRED: "인증이 만료되었습니다. 이메일 인증을 다시 진행해 주세요.",
  SLUG_TAKEN: "이미 사용 중인 워크스페이스 주소입니다.",
  INVALID_CREDENTIALS: "이메일 또는 비밀번호가 올바르지 않습니다.",
  ACCOUNT_DISABLED: "비활성화된 계정입니다. 관리자에게 문의해 주세요.",
};

export function extractApiError(error: unknown, fallback = "요청에 실패했습니다.") {
  if (!axios.isAxiosError(error) || !error.response?.data) {
    return error instanceof Error ? error.message : fallback;
  }

  const data = error.response.data;

  if (typeof data.code === "string" && data.code in ERROR_MESSAGES) {
    return ERROR_MESSAGES[data.code];
  }

  if (Array.isArray(data.detail) && data.detail.length > 0) {
    return data.detail[0].msg ?? fallback;
  }

  return fallback;
}
