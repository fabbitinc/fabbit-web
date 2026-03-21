import { useState } from "react";
import { Check, X, Loader2, AlertCircle, RotateCcw } from "lucide-react";
import { Button, Badge } from "@fabbit/ui";
import { useConfirmActionAction } from "../hooks/use-confirm-action-action";
import { useRejectActionAction } from "../hooks/use-reject-action-action";
import type { ActionRequestPayload, ActionRequestStatus } from "../types/chat-artifact";

interface ActionRequestCardProps {
  payload: ActionRequestPayload;
}

const ACTION_TYPE_LABELS: Record<string, string> = {
  CREATE_ISSUE: "이슈 생성",
  UPDATE_ISSUE: "이슈 수정",
  CREATE_PART: "부품 생성",
};

const STATUS_CONFIG: Record<
  ActionRequestStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  PENDING: { label: "대기 중", variant: "outline" },
  CONFIRMED: { label: "확인됨", variant: "default" },
  REJECTED: { label: "취소됨", variant: "secondary" },
  EXECUTED: { label: "완료됨", variant: "default" },
  FAILED: { label: "실패", variant: "destructive" },
  EXPIRED: { label: "만료됨", variant: "secondary" },
};

export function ActionRequestCard({ payload }: ActionRequestCardProps) {
  const { actionRequestId, actionType, status, preview } = payload;
  const confirmAction = useConfirmActionAction();
  const rejectAction = useRejectActionAction();
  const [localStatus, setLocalStatus] = useState<ActionRequestStatus>(status);
  const [error, setError] = useState<string | null>(null);

  const isPending = localStatus === "PENDING";
  const isSubmitting = confirmAction.isPending || rejectAction.isPending;
  const actionLabel = ACTION_TYPE_LABELS[actionType] ?? actionType;
  const statusConfig = STATUS_CONFIG[localStatus];

  async function handleConfirm() {
    if (isSubmitting || !isPending || !actionRequestId) return;
    setError(null);
    try {
      await confirmAction.mutateAsync(actionRequestId);
      setLocalStatus("CONFIRMED");
    } catch {
      setError("실행에 실패했습니다. 다시 시도해 주세요.");
    }
  }

  async function handleReject() {
    if (isSubmitting || !isPending || !actionRequestId) return;
    setError(null);
    try {
      await rejectAction.mutateAsync(actionRequestId);
      setLocalStatus("REJECTED");
    } catch {
      setError("취소에 실패했습니다. 다시 시도해 주세요.");
    }
  }

  function handleRetry() {
    setError(null);
    setLocalStatus("PENDING");
  }

  // actionRequestId가 없으면 비활성 fallback
  if (!actionRequestId) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3 text-sm text-muted-foreground">
        액션 요청 정보를 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          {actionLabel}
        </span>
        <Badge variant={statusConfig.variant} className="text-xs">
          {statusConfig.label}
        </Badge>
      </div>

      {/* 미리보기 */}
      <div className="space-y-1 px-3 py-3">
        {preview.title && (
          <p className="text-sm font-medium">{preview.title}</p>
        )}
        {preview.bodySummary && (
          <p className="text-sm text-muted-foreground">
            {preview.bodySummary}
          </p>
        )}
        {preview.part && (preview.part.number || preview.part.name) && (
          <p className="text-xs text-muted-foreground">
            연결 부품:{" "}
            <span className="font-medium text-foreground">
              {[preview.part.number, preview.part.name]
                .filter(Boolean)
                .join(" ")}
            </span>
          </p>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="flex items-center gap-2 border-t border-border bg-destructive/5 px-3 py-2 text-xs text-destructive">
          <AlertCircle className="size-3.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={handleRetry}
          >
            <RotateCcw className="mr-1 size-3" />
            재시도
          </Button>
        </div>
      )}

      {/* 버튼 — PENDING일 때만 표시 */}
      {isPending && (
        <div className="flex gap-2 border-t border-border px-3 py-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {confirmAction.isPending ? (
              <Loader2 className="mr-1 size-3.5 animate-spin" />
            ) : (
              <Check className="mr-1 size-3.5" />
            )}
            생성
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleReject}
            disabled={isSubmitting}
          >
            {rejectAction.isPending ? (
              <Loader2 className="mr-1 size-3.5 animate-spin" />
            ) : (
              <X className="mr-1 size-3.5" />
            )}
            취소
          </Button>
        </div>
      )}
    </div>
  );
}
