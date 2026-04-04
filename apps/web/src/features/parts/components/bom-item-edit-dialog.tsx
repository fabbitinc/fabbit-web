import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input } from "@fabbit/ui";
import type { PartBomTabItem } from "@fabbit/components";
import { useUpdateBomItemAction } from "@/features/parts/hooks/use-bom-item-actions";
import { buildBomUpdateRequest } from "@/features/parts/lib/build-bom-update-request";

interface BomItemEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partId: string;
  revisionId: string;
  bomItem: PartBomTabItem;
}

export function BomItemEditDialog({ open, onOpenChange, partId, revisionId, bomItem }: BomItemEditDialogProps) {
  const [lineNumber, setLineNumber] = useState(bomItem.lineNumber ?? "");
  const [quantity, setQuantity] = useState(bomItem.quantity);
  const updateBomItem = useUpdateBomItemAction(partId, revisionId);
  const initialValues = {
    childPartRevisionId: bomItem.id,
    lineNumber: bomItem.lineNumber ?? "",
    quantity: bomItem.quantity,
  };

  useEffect(() => {
    if (open) {
      setLineNumber(bomItem.lineNumber ?? "");
      setQuantity(bomItem.quantity);
    }
  }, [open, bomItem]);

  async function handleSubmit() {
    if (!bomItem.bomItemId) return;

    const request = buildBomUpdateRequest(
      { childPartRevisionId: bomItem.id, lineNumber, quantity },
      initialValues,
    );

    if (!request) return;

    await updateBomItem.mutateAsync({ bomItemId: bomItem.bomItemId, request });
    onOpenChange(false);
  }

  const updateRequest = buildBomUpdateRequest(
    { childPartRevisionId: bomItem.id, lineNumber, quantity },
    initialValues,
  );
  const canSubmit = updateRequest !== null && !updateBomItem.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>BOM 항목 수정</DialogTitle>
          <DialogDescription>
            {bomItem.partNumber} — {bomItem.name ?? "이름 없음"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label htmlFor="edit-line-number" className="mb-1 block text-sm font-medium">
              줄 번호
            </label>
            <Input
              id="edit-line-number"
              value={lineNumber}
              onChange={(e) => setLineNumber(e.target.value)}
              maxLength={50}
            />
          </div>
          <div>
            <label htmlFor="edit-quantity" className="mb-1 block text-sm font-medium">
              수량
            </label>
            <Input
              id="edit-quantity"
              type="number"
              min={0}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button type="button" disabled={!canSubmit} onClick={handleSubmit}>
            {updateBomItem.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            수정
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
