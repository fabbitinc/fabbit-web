import axios from "axios";

// 백엔드 에러 코드 → 프론트엔드 메시지 매핑 (i18n 대비)
const ERROR_MESSAGES: Record<string, string> = {
  // auth - send-verification
  ALREADY_EXISTS: "이미 가입된 이메일입니다.",
  COOLDOWN_ACTIVE: "잠시 후 다시 시도해 주세요.",
  INVALID_EMAIL: "올바른 이메일 형식을 입력해 주세요.",
  TURNSTILE_FAILED: "보안 인증에 실패했습니다. 다시 시도해 주세요.",

  // auth - verify-email
  INVALID_CODE: "인증코드가 올바르지 않습니다.",
  CODE_EXPIRED: "인증코드가 만료되었습니다. 다시 발송해 주세요.",
  TOO_MANY_ATTEMPTS: "인증 시도 횟수를 초과했습니다. 인증코드를 다시 발송해 주세요.",

  // auth - register
  TOKEN_EXPIRED: "인증이 만료되었습니다. 이메일 인증을 다시 진행해 주세요.",
  SLUG_TAKEN: "이미 사용 중인 워크스페이스 주소입니다.",

  // auth - login
  INVALID_CREDENTIALS: "이메일 또는 비밀번호가 올바르지 않습니다.",
  ACCOUNT_DISABLED: "비활성화된 계정입니다. 관리자에게 문의해 주세요.",
};

/**
 * API 에러에서 사용자 친화적 메시지를 추출한다.
 *
 * 백엔드 응답 구조: { code: "ERROR_CODE", message: "..." }
 * code를 기준으로 프론트 매핑 메시지를 반환한다 (백엔드 message는 무시).
 * 매핑되지 않은 code는 fallback을 반환한다.
 *
 * FastAPI ValidationError({ detail: [...] }) 형태도 지원.
 */
export function extractApiError(error: unknown, fallback = "요청에 실패했습니다."): string {
  if (!axios.isAxiosError(error) || !error.response?.data) {
    return error instanceof Error ? error.message : fallback;
  }

  const data = error.response.data;

  // { code: "ALREADY_EXISTS", message: "..." } 형태
  if (typeof data.code === "string" && data.code in ERROR_MESSAGES) {
    return ERROR_MESSAGES[data.code];
  }

  // FastAPI ValidationError: { detail: [{ msg: "..." }] }
  if (Array.isArray(data.detail) && data.detail.length > 0) {
    return data.detail[0].msg ?? fallback;
  }

  return fallback;
}
