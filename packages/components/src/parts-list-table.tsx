import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, FileText, Network } from "lucide-react";
import { Badge, Button, Checkbox, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fabbit/ui";

export type PartsListTableSortKey = "partNumber" | "name" | "category" | "revision" | "lifecycleState";
export type PartsListTableSortOrder = "asc" | "desc";

export interface PartsListTableItem {
  id: string;
  partNumber: string;
  name: string | null;
  category: string | null;
  revision: string;
  lifecycleState: string | null;
  drawingNumber: string | null;
  childrenCount: number;
}

export interface PartsListTableProps {
  items: PartsListTableItem[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  sortKey: PartsListTableSortKey;
  sortOrder: PartsListTableSortOrder;
  totalCount: number;
  selectedIds: Set<string>;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRowClick: (partId: string) => void;
  onSortChange: (sortKey: PartsListTableSortKey) => void;
  onToggleSelectAll: () => void;
  onToggleSelectOne: (partId: string) => void;
}

interface SortableHeaderProps {
  column: PartsListTableSortKey;
  label: string;
  sortKey: PartsListTableSortKey;
  sortOrder: PartsListTableSortOrder;
  onSortChange: (sortKey: PartsListTableSortKey) => void;
}

const pageSizeOptions = [15, 30, 50];

function getLifecycleVariant(lifecycleState: string | null): "outline" | "neutral" | "accent" | "success" {
  if (lifecycleState === "양산") {
    return "success";
  }

  if (lifecycleState === "중단") {
    return "neutral";
  }

  return "outline";
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) {
    pages.push("...");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (current < total - 2) {
    pages.push("...");
  }

  pages.push(total);
  return pages;
}

function SortableHeader({ column, label, sortKey, sortOrder, onSortChange }: SortableHeaderProps) {
  const isActive = sortKey === column;
  const Icon = isActive ? (sortOrder === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <th className="px-3 py-3 text-left">
      <button
        type="button"
        className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
        onClick={() => onSortChange(column)}
      >
        {label}
        <Icon className={`size-3 ${isActive ? "text-primary" : "text-muted-foreground/50"}`} />
      </button>
    </th>
  );
}

export function PartsListTable({
  items,
  isLoading,
  page,
  pageSize,
  sortKey,
  sortOrder,
  totalCount,
  selectedIds,
  onPageChange,
  onPageSizeChange,
  onRowClick,
  onSortChange,
  onToggleSelectAll,
  onToggleSelectOne,
}: PartsListTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const allChecked = items.length > 0 && items.every((item) => selectedIds.has(item.id));
  const someChecked = items.some((item) => selectedIds.has(item.id));

  return (
    <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col style={{ width: "48px" }} />
            <col style={{ width: "18%" }} />
            <col />
            <col style={{ width: "15%" }} />
            <col style={{ width: "72px" }} />
            <col style={{ width: "96px" }} />
            <col style={{ width: "72px" }} />
            <col style={{ width: "96px" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-border/70 bg-muted/50">
              <th className="w-12 px-4 py-3 text-center">
                <Checkbox
                  aria-label="전체 선택"
                  checked={allChecked ? true : someChecked ? "indeterminate" : false}
                  onCheckedChange={onToggleSelectAll}
                />
              </th>
              <SortableHeader column="partNumber" label="품번" sortKey={sortKey} sortOrder={sortOrder} onSortChange={onSortChange} />
              <SortableHeader column="name" label="품명" sortKey={sortKey} sortOrder={sortOrder} onSortChange={onSortChange} />
              <SortableHeader column="category" label="카테고리" sortKey={sortKey} sortOrder={sortOrder} onSortChange={onSortChange} />
              <SortableHeader column="revision" label="Rev" sortKey={sortKey} sortOrder={sortOrder} onSortChange={onSortChange} />
              <SortableHeader
                column="lifecycleState"
                label="상태"
                sortKey={sortKey}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
              />
              <th className="px-3 py-3 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">도면</th>
              <th className="px-3 py-3 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">하위 부품</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: pageSize }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="border-b border-border/50 last:border-b-0">
                    <td className="px-4 py-3 text-center">
                      <div className="mx-auto h-4 w-4 rounded bg-muted/60" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-24 rounded bg-muted/60" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-32 rounded bg-muted/60" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-20 rounded bg-muted/60" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="mx-auto h-4 w-10 rounded bg-muted/60" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="mx-auto h-5 w-16 rounded-full bg-muted/60" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="mx-auto h-4 w-4 rounded bg-muted/60" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="mx-auto h-4 w-8 rounded bg-muted/60" />
                    </td>
                  </tr>
                ))
              : null}

            {!isLoading && items.length === 0 ? (
              <tr>
                <td className="px-4 py-14 text-center text-sm text-muted-foreground" colSpan={8}>
                  검색 조건에 맞는 부품이 없습니다.
                </td>
              </tr>
            ) : null}

            {!isLoading
              ? items.map((item) => (
                  <tr
                    key={item.id}
                    className="h-[45px] cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/50"
                    onClick={() => onRowClick(item.id)}
                  >
                    <td className="px-4 py-3 text-center" onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        aria-label={`${item.partNumber} 선택`}
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={() => onToggleSelectOne(item.id)}
                      />
                    </td>
                    <td className="px-3 py-3 font-mono text-xs font-medium text-primary">{item.partNumber}</td>
                    <td className="px-3 py-3 text-sm text-foreground">{item.name ?? "이름 없음"}</td>
                    <td className="px-3 py-3 text-sm text-muted-foreground">{item.category ?? "미분류"}</td>
                    <td className="px-3 py-3 text-center text-sm text-foreground">{item.revision}</td>
                    <td className="px-3 py-3 text-center">
                      {item.lifecycleState ? (
                        <Badge variant={getLifecycleVariant(item.lifecycleState)}>{item.lifecycleState}</Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">미지정</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {item.drawingNumber ? <FileText className="mx-auto size-4 text-muted-foreground" /> : <span className="text-muted-foreground">-</span>}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {item.childrenCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                          <Network className="size-4" />
                          {item.childrenCount}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-border/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger className="h-8 w-[80px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((value) => (
                <SelectItem key={value} value={String(value)}>
                  {value}개
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>
            {totalCount > 0 ? `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, totalCount)} / ${totalCount}건` : "0건"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button disabled={page <= 1} size="icon-sm" type="button" variant="ghost" onClick={() => onPageChange(page - 1)}>
            <ChevronLeft className="size-4" />
          </Button>
          {getPageNumbers(page, totalPages).map((pageNumber, index) =>
            pageNumber === "..." ? (
              <span key={`ellipsis-${index}`} className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={pageNumber}
                size="icon-sm"
                type="button"
                variant={pageNumber === page ? "default" : "ghost"}
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </Button>
            ),
          )}
          <Button
            disabled={page >= totalPages}
            size="icon-sm"
            type="button"
            variant="ghost"
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
