import type { ReactNode } from "react";
import { Search } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  ScrollArea,
} from "@fabbit/ui";

export interface SelectionDialogProps<T> {
  open: boolean;
  title: string;
  description: string;
  searchValue: string;
  searchPlaceholder: string;
  selectedIds: string[];
  items: T[];
  getItemId: (item: T) => string;
  emptyMessage: string;
  isLoading: boolean;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSearchChange: (value: string) => void;
  onToggle: (id: string) => void;
  onConfirm: () => void | Promise<void>;
  renderItem: (item: T) => ReactNode;
}

export function SelectionDialog<T>({
  open,
  title,
  description,
  searchValue,
  searchPlaceholder,
  selectedIds,
  items,
  getItemId,
  emptyMessage,
  isLoading,
  isPending,
  onOpenChange,
  onSearchChange,
  onToggle,
  onConfirm,
  renderItem,
}: SelectionDialogProps<T>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>

          <ScrollArea className="h-[360px] rounded-[24px] border border-border/70 bg-muted/20 p-3">
            <div className="space-y-2 pr-3">
              {isLoading ? (
                <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                  검색 결과를 불러오는 중입니다.
                </div>
              ) : null}

              {!isLoading && items.length === 0 ? (
                <div className="flex h-40 items-center justify-center px-6 text-center text-sm leading-6 text-muted-foreground">
                  {emptyMessage}
                </div>
              ) : null}

              {items.map((item) => {
                const itemId = getItemId(item);
                const isSelected = selectedIds.includes(itemId);

                return (
                  <button
                    key={itemId}
                    type="button"
                    className={`flex w-full cursor-pointer items-center justify-between rounded-[20px] border px-4 py-3 text-left transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border/70 bg-card hover:border-border hover:bg-background"
                    }`}
                    onClick={() => onToggle(itemId)}
                  >
                    <div className="min-w-0 flex-1">{renderItem(item)}</div>
                    <span
                      className={`ml-4 rounded-full px-2 py-1 text-[11px] font-semibold ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isSelected ? "선택됨" : "선택"}
                    </span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button disabled={isPending} type="button" onClick={() => void onConfirm()}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
