import { Button } from "@fabbit/ui";

interface EcWorkflowActionsProps {
  /** 현재 EC 상태 */
  state: string;
  /** 제출 중 여부 */
  isSubmitting: boolean;
  /** 승인/릴리즈 진행 중 여부 */
  isMerging: boolean;
  /** 반려 진행 중 여부 */
  isRejecting: boolean;
  /** 취소 진행 중 여부 */
  isCanceling: boolean;
  /** 제출 핸들러 */
  onSubmit: () => void;
  /** 승인/릴리즈 핸들러 (상태에 따라 적절한 API 호출) */
  onMerge: () => void;
  /** 반려 핸들러 */
  onReject: () => void;
  /** 취소 핸들러 */
  onCancel: () => void;
}

/** EC 상태별 워크플로 액션 버튼을 렌더링 */
export function EcWorkflowActions({
  state,
  isSubmitting,
  isMerging,
  isRejecting,
  isCanceling,
  onSubmit,
  onMerge,
  onReject,
  onCancel,
}: EcWorkflowActionsProps) {
  const normalized = state.toUpperCase();

  /* RELEASED, CANCELED 상태에서는 액션 없음 */
  if (normalized === "RELEASED" || normalized === "CANCELED") {
    return null;
  }

  const isAnyPending = isSubmitting || isMerging || isRejecting || isCanceling;

  return (
    <div className="flex items-center gap-2">
      {/* DRAFT → 제출 */}
      {normalized === "DRAFT" ? (
        <Button
          size="sm"
          disabled={isAnyPending}
          onClick={onSubmit}
        >
          {isSubmitting ? "제출 중…" : "제출"}
        </Button>
      ) : null}

      {/* REVIEW_PENDING → 승인 + 반려 */}
      {normalized === "REVIEW_PENDING" ? (
        <>
          <Button
            size="sm"
            disabled={isAnyPending}
            onClick={onMerge}
          >
            {isMerging ? "승인 중…" : "승인"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            disabled={isAnyPending}
            onClick={onReject}
          >
            {isRejecting ? "반려 중…" : "반려"}
          </Button>
        </>
      ) : null}

      {/* APPROVAL_PENDING → 승인 + 반려 */}
      {normalized === "APPROVAL_PENDING" ? (
        <>
          <Button
            size="sm"
            disabled={isAnyPending}
            onClick={onMerge}
          >
            {isMerging ? "승인 중…" : "승인"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            disabled={isAnyPending}
            onClick={onReject}
          >
            {isRejecting ? "반려 중…" : "반려"}
          </Button>
        </>
      ) : null}

      {/* RELEASE_PENDING → 릴리즈 + 반려 */}
      {normalized === "RELEASE_PENDING" ? (
        <>
          <Button
            size="sm"
            disabled={isAnyPending}
            onClick={onMerge}
          >
            {isMerging ? "릴리즈 중…" : "릴리즈"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            disabled={isAnyPending}
            onClick={onReject}
          >
            {isRejecting ? "반려 중…" : "반려"}
          </Button>
        </>
      ) : null}

      {/* 모든 비종료 상태에서 취소 가능 */}
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        disabled={isAnyPending}
        onClick={onCancel}
      >
        {isCanceling ? "취소 중…" : "취소"}
      </Button>
    </div>
  );
}
