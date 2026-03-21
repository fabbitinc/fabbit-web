import { Loader2 } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Switch,
} from "@fabbit/ui";

export interface SystemOverrideDraft {
  active: boolean;
  activeConfigurable: boolean;
  displayNameOverride: string;
  displayOrder: string;
}

interface SystemOverrideDialogProps {
  draft: SystemOverrideDraft;
  isPending: boolean;
  open: boolean;
  onClose: () => void;
  onDraftChange: (draft: SystemOverrideDraft) => void;
  onSubmit: () => void;
}

export function SystemOverrideDialog({
  draft,
  isPending,
  open,
  onClose,
  onDraftChange,
  onSubmit,
}: SystemOverrideDialogProps) {
  const canConfigureActive = draft.activeConfigurable;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>기본 항목 표시 설정</DialogTitle>
          <DialogDescription>
            기본으로 제공되는 항목입니다. 항목 이름, 보이는 순서{canConfigureActive ? ", 사용 여부" : ""}를 설정합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">화면 표시명</label>
            <Input
              value={draft.displayNameOverride}
              onChange={(e) => onDraftChange({ ...draft, displayNameOverride: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">표시 순서</label>
            <Input
              inputMode="numeric"
              value={draft.displayOrder}
              onChange={(e) => onDraftChange({ ...draft, displayOrder: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-foreground">사용 여부</p>
              <p className="text-xs text-muted-foreground">
                {canConfigureActive
                  ? "사용 안 함으로 바꾸면 부품 화면에서 숨겨집니다."
                  : "이 기본 항목은 조직 설정에서 사용 여부를 변경할 수 없습니다."}
              </p>
            </div>
            <Switch
              checked={draft.active}
              disabled={!canConfigureActive}
              onCheckedChange={(c) => onDraftChange({ ...draft, active: c })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>취소</Button>
          <Button type="button" disabled={isPending} onClick={onSubmit}>
            {isPending ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
