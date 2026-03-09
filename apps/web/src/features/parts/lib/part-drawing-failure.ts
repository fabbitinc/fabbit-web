import type { PartDrawingFailureCode } from "@/features/parts/types/parts-model";

export const DEFAULT_PART_DRAWING_FAILURE_MESSAGE =
  "도면 처리에 실패했습니다. 파일 형식과 원본 상태를 확인해 주세요.";

const PART_DRAWING_FAILURE_MESSAGES: Record<PartDrawingFailureCode, string> = {
  TIMEOUT: "도면 변환 시간이 초과되었습니다.",
  UNSUPPORTED_FORMAT: "지원하지 않는 도면 형식입니다.",
  CONVERTER_UNAVAILABLE:
    "도면 변환기를 사용할 수 없습니다. 관리자에게 문의해 주세요.",
  CONVERSION_FAILED: "도면 변환에 실패했습니다.",
  UNKNOWN: "도면 처리 중 오류가 발생했습니다.",
};

export function getPartDrawingFailureMessage(
  failureCode?: PartDrawingFailureCode | null,
): string | null {
  if (!failureCode) {
    return null;
  }

  return PART_DRAWING_FAILURE_MESSAGES[failureCode] ?? DEFAULT_PART_DRAWING_FAILURE_MESSAGE;
}

export function resolvePartDrawingFailureCode({
  failureCode,
  failureReason,
}: {
  failureCode?: string | null;
  failureReason?: string | null;
}): PartDrawingFailureCode | null {
  if (failureCode === "TIMEOUT") {
    return "TIMEOUT";
  }

  if (failureCode === "UNSUPPORTED_FORMAT") {
    return "UNSUPPORTED_FORMAT";
  }

  if (failureCode === "CONVERTER_UNAVAILABLE") {
    return "CONVERTER_UNAVAILABLE";
  }

  if (failureCode === "CONVERSION_FAILED") {
    return "CONVERSION_FAILED";
  }

  if (failureCode === "UNKNOWN") {
    return "UNKNOWN";
  }

  if (!failureReason) {
    return null;
  }

  if (failureReason.includes("시간이 초과")) {
    return "TIMEOUT";
  }

  if (failureReason.includes("지원하지 않는 도면 파일 형식")) {
    return "UNSUPPORTED_FORMAT";
  }

  if (
    failureReason.includes("실행 파일을 찾을 수 없습니다") ||
    failureReason.includes("settings.ini 리소스를 찾을 수 없습니다") ||
    failureReason.includes("변환기를 사용할 수 없습니다")
  ) {
    return "CONVERTER_UNAVAILABLE";
  }

  if (
    failureReason.includes("결과 파일이 생성되지 않았습니다") ||
    failureReason.includes("실행에 실패했습니다") ||
    failureReason.includes("실행이 중단되었습니다") ||
    failureReason.includes("dwg2pdf 실패")
  ) {
    return "CONVERSION_FAILED";
  }

  return "UNKNOWN";
}
