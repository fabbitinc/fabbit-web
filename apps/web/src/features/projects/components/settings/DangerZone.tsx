import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DangerZoneProps {
  projectName: string;
  onDelete?: () => void;
}

export function DangerZone({
  projectName,
  onDelete,
}: DangerZoneProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const isConfirmValid = confirmText === projectName;

  const handleDelete = () => {
    if (isConfirmValid) {
      onDelete?.();
      setDeleteDialogOpen(false);
      setConfirmText("");
    }
  };

  return (
    <>
      <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] p-6">
        <h2 className="text-lg font-medium text-[#dc2626]">위험 영역</h2>
        <p className="mt-1 text-sm text-[#64748b]">
          이 작업은 되돌릴 수 없습니다. 신중하게 진행해주세요.
        </p>

        <div className="mt-6">
          {/* 프로젝트 삭제 */}
          <div className="flex items-center justify-between rounded-lg border border-[#fecaca] bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fee2e2] text-[#dc2626]">
                <Trash2 className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-[#0f172a]">프로젝트 삭제</p>
                <p className="mt-0.5 text-sm text-[#64748b]">
                  프로젝트와 모든 데이터가 영구적으로 삭제됩니다.
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              삭제
            </Button>
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fee2e2]">
              <AlertTriangle className="h-6 w-6 text-[#dc2626]" />
            </div>
            <DialogTitle className="text-center">프로젝트 삭제</DialogTitle>
            <DialogDescription className="text-center">
              이 작업은 되돌릴 수 없습니다. 프로젝트의 모든 데이터가 영구적으로
              삭제됩니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm text-[#0f172a]">
                삭제하려면{" "}
                <span className="font-semibold text-[#dc2626]">
                  {projectName}
                </span>
                을(를) 입력하세요:
              </p>
              <Input
                className="mt-2"
                placeholder={projectName}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                autoComplete="off"
              />
            </div>

            {confirmText && !isConfirmValid && (
              <p className="text-xs text-[#dc2626]">
                프로젝트 이름이 일치하지 않습니다.
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setConfirmText("");
              }}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!isConfirmValid}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
