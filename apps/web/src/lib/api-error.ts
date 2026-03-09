import axios from "axios";

const ERROR_MESSAGES: Record<string, string> = {
  ALREADY_EXISTS: "이미 가입된 이메일입니다.",
  COOLDOWN_ACTIVE: "인증 메일을 너무 자주 요청했습니다. 잠시 후 다시 시도해 주세요.",
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

type ApiErrorStatusMessages = Partial<Record<number, string>>;

interface ExtractApiErrorOptions {
  fallback?: string;
  codeMessages?: Record<string, string>;
  statusMessages?: ApiErrorStatusMessages;
}

function resolveOptions(options?: string | ExtractApiErrorOptions): Required<ExtractApiErrorOptions> {
  if (typeof options === "string") {
    return {
      fallback: options,
      codeMessages: {},
      statusMessages: {},
    };
  }

  return {
    fallback: options?.fallback ?? "요청에 실패했습니다.",
    codeMessages: options?.codeMessages ?? {},
    statusMessages: options?.statusMessages ?? {},
  };
}

function extractDetailMessage(detail: unknown) {
  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    const firstDetail = detail[0];

    if (typeof firstDetail === "string") {
      return firstDetail;
    }

    if (firstDetail && typeof firstDetail === "object") {
      if ("msg" in firstDetail && typeof firstDetail.msg === "string") {
        return firstDetail.msg;
      }

      if ("message" in firstDetail && typeof firstDetail.message === "string") {
        return firstDetail.message;
      }
    }
  }

  if (detail && typeof detail === "object" && "message" in detail && typeof detail.message === "string") {
    return detail.message;
  }

  return null;
}

export function extractApiError(error: unknown, options?: string | ExtractApiErrorOptions) {
  const { fallback, codeMessages, statusMessages } = resolveOptions(options);

  if (!axios.isAxiosError(error) || !error.response?.data) {
    return error instanceof Error ? error.message : fallback;
  }

  const data = error.response.data;
  const status = error.response.status;
  const mergedCodeMessages = {
    ...ERROR_MESSAGES,
    ...codeMessages,
  };

  if (typeof data.code === "string" && data.code in mergedCodeMessages) {
    return mergedCodeMessages[data.code];
  }

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  const detailMessage = extractDetailMessage(data.detail);

  if (detailMessage) {
    return detailMessage;
  }

  if (status in statusMessages && statusMessages[status]) {
    return statusMessages[status] ?? fallback;
  }

  return fallback;
}
