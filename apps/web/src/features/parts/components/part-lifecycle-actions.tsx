import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@fabbit/ui";
import type { PartLifecycleState } from "@/features/parts/types/parts-model";
import { useChangePartLifecycleAction } from "@/features/parts/hooks/use-change-part-lifecycle-action";
import { josa } from "es-hangul";
import {
  getLifecycleBadgeClassName,
  getLifecycleLabel,
  getLifecycleVariant,
} from "@/features/parts/lib/part-lifecycle";

interface PartLifecycleActionsProps {
  className?: string;
  currentState: string | null;
  partId: string;
  revisionId: string;
  partNumber: string;
  partName: string | null;
  transitions: PartLifecycleState[];
  disabledReason: string | null;
}

export function PartLifecycleActions({
  className,
  currentState,
  partId,
  revisionId,
  partNumber,
  partName,
  transitions,
  disabledReason,
}: PartLifecycleActionsProps) {
  const [confirmTarget, setConfirmTarget] = useState<PartLifecycleState | null>(null);
  const lifecycleAction = useChangePartLifecycleAction(partId, revisionId, {
    onSuccess: () => setConfirmTarget(null),
  });

  if (!currentState) {
    return null;
  }

  const stateLabel = getLifecycleLabel(currentState);
  const hasTransitions = transitions.length > 0;

  // EC 모드: 현재 상태 배지 + 비활성 드롭다운 + 툴팁
  if (disabledReason) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={className}>
              <div className="inline-flex items-stretch rounded-md">
                <Badge
                  className={getLifecycleBadgeClassName(currentState)}
                  variant={getLifecycleVariant(currentState)}
                >
                  {stateLabel}
                </Badge>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{disabledReason}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // 전환 가능한 상태가 없으면 배지만 표시
  if (!hasTransitions) {
    return (
      <Badge
        className={getLifecycleBadgeClassName(currentState)}
        variant={getLifecycleVariant(currentState)}
      >
        {stateLabel}
      </Badge>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="inline-flex items-center gap-0.5 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer disabled:opacity-50"
            disabled={lifecycleAction.isPending}
            type="button"
          >
            <span className={getLifecycleBadgeClassName(currentState)?.split(" ").filter(c => c.startsWith("text-")).join(" ")}>
              {lifecycleAction.isPending ? "변경 중…" : stateLabel}
            </span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-36">
          {transitions.map((state) => (
            <DropdownMenuItem
              key={state}
              variant="destructive"
              onClick={() => setConfirmTarget(state)}
            >
              {josa(getLifecycleLabel(state), "으로/로")} 전환
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmTarget !== null} onOpenChange={(open) => { if (!open) setConfirmTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              부품 {confirmTarget === "OBSOLETE" ? "폐기" : "단종 예정"} (되돌릴 수 없음)
            </AlertDialogTitle>
            <AlertDialogDescription>
              {partNumber} {partName ? `"${partName}"` : ""}을(를){" "}
              {confirmTarget === "OBSOLETE" ? "폐기(OBSOLETE)" : "단종 예정(EOL)"}
              {" "}처리하시겠습니까?
              <br />
              <br />
              {confirmTarget === "OBSOLETE" ? (
                <>
                  폐기된 부품은:
                  <br />• 새로운 초안(리비전)을 생성할 수 없습니다
                  <br />• 이 작업은 되돌릴 수 없습니다
                </>
              ) : (
                <>
                  단종 예정 부품은:
                  <br />• 신규 설계에 사용할 수 없습니다
                  <br />• 이 작업은 되돌릴 수 없습니다
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={lifecycleAction.isPending}>취소</AlertDialogCancel>
            <AlertDialogAction
              className={confirmTarget === "OBSOLETE"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : undefined}
              disabled={lifecycleAction.isPending}
              onClick={() => {
                if (confirmTarget) {
                  lifecycleAction.mutate(confirmTarget);
                }
              }}
            >
              {lifecycleAction.isPending
                ? "처리 중…"
                : confirmTarget === "OBSOLETE"
                  ? "폐기 처리"
                  : "단종 예정 처리"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
