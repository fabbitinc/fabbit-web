import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input } from "@fabbit/ui";
import { useAddBomItemsBatchAction } from "@/features/parts/hooks/use-bom-item-actions";

interface BatchRow {
  key: number;
  childPartRevisionId: string;
  lineNumber: string;
  quantity: number;
}

interface BomItemBatchAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partId: string;
  revisionId: string;
}

let nextKey = 0;

function createEmptyRow(): BatchRow {
  return { key: nextKey++, childPartRevisionId: "", lineNumber: "", quantity: 1 };
}

export function BomItemBatchAddDialog({ open, onOpenChange, partId, revisionId }: BomItemBatchAddDialogProps) {
  const [rows, setRows] = useState<BatchRow[]>(() => [createEmptyRow()]);
  const addBatch = useAddBomItemsBatchAction(partId, revisionId);

  function handleReset() {
    setRows([createEmptyRow()]);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) handleReset();
    onOpenChange(nextOpen);
  }

  function addRow() {
    if (rows.length >= 500) return;
    setRows((prev) => [...prev, createEmptyRow()]);
  }

  function removeRow(key: number) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  function updateRow(key: number, field: keyof Omit<BatchRow, "key">, value: string | number) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  }

  async function handleSubmit() {
    const validRows = rows.filter((r) => r.childPartRevisionId && r.lineNumber && r.quantity > 0);
    if (validRows.length === 0) return;

    await addBatch.mutateAsync({
      items: validRows.map((r) => ({
        child_part_revision_id: r.childPartRevisionId,
        line_number: r.lineNumber,
        quantity: r.quantity,
      })),
    });

    handleOpenChange(false);
  }

  const validCount = rows.filter((r) => r.childPartRevisionId && r.lineNumber && r.quantity > 0).length;
  const canSubmit = validCount > 0 && !addBatch.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>BOM 항목 일괄 추가</DialogTitle>
          <DialogDescription>
            여러 하위 부품을 한 번에 추가합니다. 최대 500건까지 가능합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-80 space-y-2 overflow-y-auto">
          {rows.map((row, index) => (
            <div key={row.key} className="flex items-center gap-2">
              <span className="w-8 text-right text-xs text-muted-foreground">{index + 1}</span>
              <Input
                placeholder="하위 부품 리비전 ID"
                value={row.childPartRevisionId}
                onChange={(e) => updateRow(row.key, "childPartRevisionId", e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="줄 번호"
                value={row.lineNumber}
                onChange={(e) => updateRow(row.key, "lineNumber", e.target.value)}
                className="w-24"
                maxLength={50}
              />
              <Input
                type="number"
                min={0}
                placeholder="수량"
                value={row.quantity}
                onChange={(e) => updateRow(row.key, "quantity", Number(e.target.value))}
                className="w-20"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                disabled={rows.length <= 1}
                onClick={() => removeRow(row.key)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>

        <Button type="button" variant="outline" size="sm" disabled={rows.length >= 500} onClick={addRow}>
          <Plus className="size-4" />
          행 추가 ({rows.length}/500)
        </Button>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            취소
          </Button>
          <Button type="button" disabled={!canSubmit} onClick={handleSubmit}>
            {addBatch.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {validCount}건 추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
