import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@fabbit/ui";
import type { PartBomTabItem } from "@fabbit/components";
import { useDeleteBomItemAction } from "@/features/parts/hooks/use-bom-item-actions";

interface BomItemDeleteConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partId: string;
  revisionId: string;
  bomItem: PartBomTabItem;
}

export function BomItemDeleteConfirm({ open, onOpenChange, partId, revisionId, bomItem }: BomItemDeleteConfirmProps) {
  const deleteBomItem = useDeleteBomItemAction(partId, revisionId);

  async function handleConfirm() {
    if (!bomItem.bomItemId) return;
    await deleteBomItem.mutateAsync(bomItem.bomItemId);
    onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>BOM 항목 삭제</AlertDialogTitle>
          <AlertDialogDescription>
            {bomItem.partNumber} ({bomItem.name ?? "이름 없음"}) 항목을 BOM에서 삭제하시겠습니까?
            이 작업은 되돌릴 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction
            disabled={deleteBomItem.isPending}
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
          >
            {deleteBomItem.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            삭제
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
