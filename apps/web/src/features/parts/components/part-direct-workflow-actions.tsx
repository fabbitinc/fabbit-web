import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Textarea,
  cn,
} from "@fabbit/ui";
import type { PartDetailModel } from "@/features/parts/types/parts-model";
import { useCancelPartDraftAction } from "@/features/parts/hooks/use-cancel-part-draft-action";
import { useReleasePartDraftAction } from "@/features/parts/hooks/use-release-part-draft-action";

type WorkflowActionKind = "cancel" | "release";

interface PartDirectWorkflowActionsProps {
  className?: string;
  partId: string;
  onCanceled: () => void;
  onReleased: (part: PartDetailModel) => void;
}

const actionMeta: Record<
  WorkflowActionKind,
  {
    confirmLabel: string;
    description: string;
    title: string;
  }
> = {
  cancel: {
    title: "부품 초안을 폐기합니다",
    description:
      "폐기 사유를 입력하면 현재 초안을 종료하고 다시 사용할 수 없습니다.",
    confirmLabel: "폐기",
  },
  release: {
    title: "부품 초안을 배포합니다",
    description:
      "배포 사유를 입력하면 초안을 배포하고 공식 리비전으로 전환합니다.",
    confirmLabel: "배포",
  },
};

export function PartDirectWorkflowActions({
  className,
  partId,
  onCanceled,
  onReleased,
}: PartDirectWorkflowActionsProps) {
  const [selectedActionKind, setSelectedActionKind] =
    useState<WorkflowActionKind>("release");
  const [actionKind, setActionKind] = useState<WorkflowActionKind | null>(null);
  const [reason, setReason] = useState("");
  const cancelAction = useCancelPartDraftAction(partId, {
    onSuccess: () => {
      setActionKind(null);
      setReason("");
      onCanceled();
    },
  });
  const releaseAction = useReleasePartDraftAction(partId, {
    onSuccess: (part) => {
      setActionKind(null);
      setReason("");
      onReleased(part);
    },
  });

  const isPending = cancelAction.isPending || releaseAction.isPending;
  const currentMeta = actionKind ? actionMeta[actionKind] : null;
  const selectedActionMeta = actionMeta[selectedActionKind];
  const isCancelSelected = selectedActionKind === "cancel";
  const isCancelConfirm = actionKind === "cancel";

  function closeDialog(open: boolean) {
    if (isPending) {
      return;
    }

    if (!open) {
      setActionKind(null);
      setReason("");
    }
  }

  function handleConfirm() {
    if (!actionKind) {
      return;
    }

    if (actionKind === "cancel") {
      cancelAction.mutate(reason);
      return;
    }

    releaseAction.mutate(reason);
  }

  return (
    <>
      <div className={className ?? "w-full"}>
        <div className="inline-flex w-full items-stretch rounded-md shadow-xs">
          <Button
            className="min-w-0 flex-1 rounded-r-none"
            disabled={isPending}
            size="sm"
            type="button"
            variant={isCancelSelected ? "destructive" : "default"}
            onClick={() => setActionKind(selectedActionKind)}
          >
            {selectedActionMeta.confirmLabel}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="폐기 또는 배포 선택"
                className="w-4 rounded-l-none border-l border-current/20 px-0"
                disabled={isPending}
                size="sm"
                type="button"
                variant={isCancelSelected ? "destructive" : "default"}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="min-w-36">
              {(["release", "cancel"] as WorkflowActionKind[]).map((kind) => (
                <DropdownMenuItem
                  key={kind}
                  className="flex items-center justify-between"
                  variant={kind === "cancel" ? "destructive" : "default"}
                  onClick={() => setSelectedActionKind(kind)}
                >
                  <span>{actionMeta[kind].confirmLabel}</span>
                  <Check
                    className={cn(
                      "h-4 w-4 transition-opacity",
                      kind === "cancel" ? "text-destructive" : "text-primary",
                      selectedActionKind === kind ? "opacity-100" : "opacity-0",
                    )}
                  />
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={actionKind !== null} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{currentMeta?.title}</DialogTitle>
            <DialogDescription>{currentMeta?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="part-workflow-reason"
            >
              변경 사유
            </label>
            <Textarea
              id="part-workflow-reason"
              maxLength={2000}
              placeholder="폐기 또는 배포 사유를 입력해 주세요."
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {reason.trim().length}/2000
            </p>
          </div>

          <DialogFooter>
            <Button
              disabled={isPending}
              type="button"
              variant="outline"
              onClick={() => closeDialog(false)}
            >
              취소
            </Button>
            <Button
              disabled={isPending || reason.trim().length === 0}
              type="button"
              variant={isCancelConfirm ? "destructive" : "default"}
              onClick={handleConfirm}
            >
              {currentMeta?.confirmLabel ?? "확인"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
