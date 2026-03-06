import { useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  LabelBadge,
  Textarea,
} from "@fabbit/ui";
import { Check, Loader2, Pipette, Plus, Trash2 } from "lucide-react";
import { labelColorPresets } from "@/features/organization-settings/constants/label-color-presets";
import { useCreateOrganizationLabelAction } from "@/features/organization-settings/hooks/use-create-organization-label-action";
import { useDeleteOrganizationLabelAction } from "@/features/organization-settings/hooks/use-delete-organization-label-action";
import { useOrganizationLabelsQuery } from "@/features/organization-settings/hooks/use-organization-labels-query";

export function OrganizationLabelsTab() {
  const labelsQuery = useOrganizationLabelsQuery();
  const deleteLabelAction = useDeleteOrganizationLabelAction();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">라벨</h2>
        <Button className="gap-1" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="size-4" />
          라벨 추가
        </Button>
      </div>

      <div className="space-y-2">
        {(labelsQuery.data ?? []).map((label) => (
          <div
            key={label.id}
            className="flex items-center gap-3 rounded-[20px] border border-border/70 bg-card px-4 py-2.5"
          >
            <LabelBadge colorHex={label.color} label={label.name} />
            <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{label.description ?? ""}</span>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="icon" variant="ghost">
                  <Trash2 className="size-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>라벨을 영구 삭제</AlertDialogTitle>
                  <AlertDialogDescription>
                    이 라벨을 삭제하면 다시 복구할 수 없으며 연결된 이슈와 변경 요청에서 제거됩니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteLabelAction.mutate(label.id)}>라벨 삭제</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
        {(labelsQuery.data?.length ?? 0) === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">라벨이 없습니다.</p>
        ) : null}
      </div>

      <CreateOrganizationLabelDialog
        existingNames={new Set((labelsQuery.data ?? []).map((label) => label.name))}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}

function CreateOrganizationLabelDialog({
  open,
  onOpenChange,
  existingNames,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingNames: Set<string>;
}) {
  const createLabelAction = useCreateOrganizationLabelAction();
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<string>(labelColorPresets[0].value);

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      setName("");
      setDescription("");
      setColor(labelColorPresets[0].value);
    }
    onOpenChange(nextOpen);
  }

  const normalizedName = name.trim();
  const isDuplicate = existingNames.has(normalizedName);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>라벨 추가</DialogTitle>
          <DialogDescription>조직에서 사용할 새 라벨을 만듭니다.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-4">
            {normalizedName ? <LabelBadge colorHex={color} label={normalizedName} /> : <span className="text-xs text-muted-foreground">라벨 미리보기</span>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="organization-label-name">이름</Label>
            <Input
              id="organization-label-name"
              maxLength={50}
              placeholder="라벨 이름 (최대 50자)"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="organization-label-description">설명</Label>
            <Textarea
              id="organization-label-description"
              maxLength={200}
              placeholder="라벨에 대한 간단한 설명 (최대 200자)"
              rows={2}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>색상</Label>
            <div className="grid grid-cols-10 gap-1.5">
              {labelColorPresets.map((preset) => (
                <button
                  key={preset.value}
                  className="group relative flex h-7 w-7 items-center justify-center rounded-md border border-transparent transition-transform hover:scale-110"
                  style={{ backgroundColor: preset.value }}
                  title={preset.label}
                  type="button"
                  onClick={() => setColor(preset.value)}
                >
                  {color === preset.value ? <Check className="size-3.5 text-white" /> : null}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                className="flex h-7 w-7 items-center justify-center rounded-md border border-dashed border-border hover:bg-muted"
                type="button"
                onClick={() => colorInputRef.current?.click()}
              >
                <Pipette className="size-3.5 text-muted-foreground" />
              </button>
              <input
                ref={colorInputRef}
                className="sr-only"
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
              />
              <span className="text-xs text-muted-foreground">직접 선택</span>
              <span className="ml-auto rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                {color.toUpperCase()}
              </span>
            </div>
          </div>

          {isDuplicate ? <p className="text-xs text-destructive">이미 존재하는 라벨 이름입니다.</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            취소
          </Button>
          <Button
            disabled={!normalizedName || isDuplicate || createLabelAction.isPending}
            onClick={() =>
              createLabelAction.mutate(
                {
                  name: normalizedName,
                  color,
                  description: description.trim() || null,
                },
                {
                  onSuccess: () => handleClose(false),
                },
              )
            }
          >
            {createLabelAction.isPending ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
