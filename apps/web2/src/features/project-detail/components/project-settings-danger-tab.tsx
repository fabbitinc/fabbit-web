import { useState } from "react";
import { AlertTriangle, ArchiveRestore, ArchiveX, Trash2 } from "lucide-react";
import { Button, ConfirmDialog } from "@fabbit/ui";
import { useArchiveProjectAction } from "@/features/project-detail/hooks/use-archive-project-action";
import { useDeleteProjectAction } from "@/features/project-detail/hooks/use-delete-project-action";
import { useUnarchiveProjectAction } from "@/features/project-detail/hooks/use-unarchive-project-action";

interface ProjectSettingsDangerTabProps {
  isArchived: boolean;
  onDeleted: () => void;
  projectId: string;
  projectName: string;
}

export function ProjectSettingsDangerTab({
  isArchived,
  onDeleted,
  projectId,
  projectName,
}: ProjectSettingsDangerTabProps) {
  const archiveProjectAction = useArchiveProjectAction(projectId);
  const unarchiveProjectAction = useUnarchiveProjectAction(projectId);
  const deleteProjectAction = useDeleteProjectAction(projectId, { onSuccess: onDeleted });
  const [dialogType, setDialogType] = useState<"archive" | "unarchive" | "delete" | null>(null);

  return (
    <section className="space-y-4">
      <div className="rounded-[28px] border border-status-warning-border bg-status-warning-bg/60 p-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-status-warning/15 p-2 text-status-warning">
            <AlertTriangle className="size-4" />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">위험 영역</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              보관된 프로젝트는 읽기 전용으로 전환됩니다. 삭제는 되돌릴 수 없습니다.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={() => setDialogType(isArchived ? "unarchive" : "archive")}>
            {isArchived ? <ArchiveRestore className="size-4" /> : <ArchiveX className="size-4" />}
            {isArchived ? "보관 해제" : "보관"}
          </Button>
          <Button type="button" variant="destructive" onClick={() => setDialogType("delete")}>
            <Trash2 className="size-4" />
            프로젝트 삭제
          </Button>
        </div>
      </div>

      <ConfirmDialog
        cancelLabel="취소"
        confirmLabel={dialogType === "delete" ? "삭제" : dialogType === "unarchive" ? "보관 해제" : "보관"}
        description={
          dialogType === "delete"
            ? `${projectName} 프로젝트를 삭제합니다. 이 작업은 되돌릴 수 없습니다.`
            : dialogType === "unarchive"
              ? `${projectName} 프로젝트를 다시 활성 상태로 되돌립니다.`
              : `${projectName} 프로젝트를 보관하고 쓰기 작업을 중지합니다.`
        }
        open={dialogType !== null}
        title={
          dialogType === "delete"
            ? "프로젝트를 삭제할까요?"
            : dialogType === "unarchive"
              ? "프로젝트 보관을 해제할까요?"
              : "프로젝트를 보관할까요?"
        }
        variant={dialogType === "delete" ? "destructive" : "default"}
        onCancel={() => setDialogType(null)}
        onConfirm={() => {
          if (dialogType === "archive") {
            archiveProjectAction.mutate(undefined, {
              onSuccess: () => setDialogType(null),
            });
            return;
          }

          if (dialogType === "unarchive") {
            unarchiveProjectAction.mutate(undefined, {
              onSuccess: () => setDialogType(null),
            });
            return;
          }

          if (dialogType === "delete") {
            deleteProjectAction.mutate(undefined, {
              onSuccess: () => setDialogType(null),
            });
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            setDialogType(null);
          }
        }}
      />
    </section>
  );
}
