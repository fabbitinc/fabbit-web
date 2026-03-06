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
  Label,
  Textarea,
} from "@fabbit/ui";

export interface ProjectCreateDialogProps {
  open: boolean;
  name: string;
  description: string;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: () => void;
}

export function ProjectCreateDialog({
  open,
  name,
  description,
  isPending,
  onOpenChange,
  onNameChange,
  onDescriptionChange,
  onSubmit,
}: ProjectCreateDialogProps) {
  const canSubmit = name.trim().length > 0 && !isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>새 프로젝트</DialogTitle>
          <DialogDescription>프로젝트를 생성하고 부품을 그룹으로 관리합니다.</DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();

            if (!canSubmit) {
              return;
            }

            onSubmit();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="project-create-name">프로젝트 이름</Label>
            <Input
              id="project-create-name"
              autoFocus
              placeholder="예: Drive Unit Gen4"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-create-description">설명</Label>
            <Textarea
              id="project-create-description"
              placeholder="프로젝트 목표와 관리 범위를 입력해 주세요."
              rows={4}
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button disabled={!canSubmit} type="submit">
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              생성
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
