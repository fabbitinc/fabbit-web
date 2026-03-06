import { Badge, UserAvatar } from "@fabbit/ui";
import { SelectionDialog } from "./selection-dialog";

export interface DetailSelectionDialogItem {
  id: string;
  title: string;
  subtitle?: string;
  avatarName?: string;
  avatarImageUrl?: string | null;
  badgeLabel?: string;
}

export interface DetailSelectionDialogProps {
  description: string;
  emptyMessage: string;
  isLoading: boolean;
  isPending: boolean;
  items: DetailSelectionDialogItem[];
  onConfirm: () => Promise<void> | void;
  onOpenChange: (open: boolean) => void;
  onSearchChange: (value: string) => void;
  onToggle: (id: string) => void;
  open: boolean;
  searchPlaceholder: string;
  searchValue: string;
  selectedIds: string[];
  title: string;
}

export function DetailSelectionDialog({
  description,
  emptyMessage,
  isLoading,
  isPending,
  items,
  onConfirm,
  onOpenChange,
  onSearchChange,
  onToggle,
  open,
  searchPlaceholder,
  searchValue,
  selectedIds,
  title,
}: DetailSelectionDialogProps) {
  return (
    <SelectionDialog<DetailSelectionDialogItem>
      open={open}
      title={title}
      description={description}
      searchValue={searchValue}
      searchPlaceholder={searchPlaceholder}
      selectedIds={selectedIds}
      items={items}
      getItemId={(item) => item.id}
      emptyMessage={emptyMessage}
      isLoading={isLoading}
      isPending={isPending}
      onOpenChange={onOpenChange}
      onSearchChange={onSearchChange}
      onToggle={onToggle}
      onConfirm={onConfirm}
      renderItem={(item) => (
        <div className="flex items-center gap-3">
          {item.avatarName ? (
            <UserAvatar imageUrl={item.avatarImageUrl ?? null} name={item.avatarName} />
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
              {item.badgeLabel ? <Badge variant="outline">{item.badgeLabel}</Badge> : null}
            </div>
            {item.subtitle ? (
              <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
            ) : null}
          </div>
        </div>
      )}
    />
  );
}
