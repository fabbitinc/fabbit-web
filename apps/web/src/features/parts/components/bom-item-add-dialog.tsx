import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input } from "@fabbit/ui";
import { useQuery } from "@tanstack/react-query";
import { partsQueries } from "@/features/parts/api/parts.queries";
import { useAddBomItemAction } from "@/features/parts/hooks/use-bom-item-actions";

interface BomItemAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partId: string;
  revisionId: string;
}

export function BomItemAddDialog({ open, onOpenChange, partId, revisionId }: BomItemAddDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedPartRevisionId, setSelectedPartRevisionId] = useState<string | null>(null);
  const [selectedPartLabel, setSelectedPartLabel] = useState("");
  const [lineNumber, setLineNumber] = useState("");
  const [quantity, setQuantity] = useState<number>(1);

  const addBomItem = useAddBomItemAction(partId, revisionId);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const searchResults = useQuery({
    ...partsQueries.list({ search: debouncedQuery || undefined, limit: 20 }),
    enabled: open && debouncedQuery.length > 0,
  });

  const filteredItems = (searchResults.data?.items ?? []).filter((item) => item.partId !== partId);

  function handleReset() {
    setSearchQuery("");
    setDebouncedQuery("");
    setSelectedPartRevisionId(null);
    setSelectedPartLabel("");
    setLineNumber("");
    setQuantity(1);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) handleReset();
    onOpenChange(nextOpen);
  }

  async function handleSubmit() {
    if (!selectedPartRevisionId || !lineNumber) return;

    await addBomItem.mutateAsync({
      child_part_revision_id: selectedPartRevisionId,
      line_number: lineNumber,
      quantity,
    });

    handleOpenChange(false);
  }

  const canSubmit = selectedPartRevisionId !== null && lineNumber.trim() !== "" && quantity > 0 && !addBomItem.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>BOM 항목 추가</DialogTitle>
          <DialogDescription>하위 부품을 검색하여 BOM에 추가합니다.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {selectedPartRevisionId ? (
            <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2">
              <span className="text-sm font-medium">{selectedPartLabel}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedPartRevisionId(null);
                  setSelectedPartLabel("");
                }}
              >
                변경
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="부품 번호 또는 이름으로 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              {searchResults.isFetching ? (
                <div className="flex items-center gap-2 px-2 py-3 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  검색 중...
                </div>
              ) : filteredItems.length > 0 ? (
                <div className="max-h-48 overflow-y-auto rounded-md border border-border">
                  {filteredItems.map((item) => (
                    <button
                      key={item.revisionId ?? item.partId}
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/50"
                      disabled={!item.revisionId}
                      onClick={() => {
                        if (item.revisionId) {
                          setSelectedPartRevisionId(item.revisionId);
                          setSelectedPartLabel(`${item.partNumber} — ${item.name ?? "이름 없음"}`);
                          setSearchQuery("");
                        }
                      }}
                    >
                      <span className="font-mono text-xs">{item.partNumber}</span>
                      <span className="text-muted-foreground">{item.name ?? "이름 없음"}</span>
                    </button>
                  ))}
                </div>
              ) : debouncedQuery.length > 0 && !searchResults.isFetching ? (
                <p className="px-2 py-3 text-sm text-muted-foreground">검색 결과가 없습니다.</p>
              ) : null}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="bom-line-number" className="mb-1 block text-sm font-medium">
                줄 번호
              </label>
              <Input
                id="bom-line-number"
                placeholder="10"
                value={lineNumber}
                onChange={(e) => setLineNumber(e.target.value)}
                maxLength={50}
              />
            </div>
            <div>
              <label htmlFor="bom-quantity" className="mb-1 block text-sm font-medium">
                수량
              </label>
              <Input
                id="bom-quantity"
                type="number"
                min={0}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            취소
          </Button>
          <Button type="button" disabled={!canSubmit} onClick={handleSubmit}>
            {addBomItem.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
