import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Network,
  Search,
} from "lucide-react";
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
  align?: "left" | "center";
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

  if (lifecycleState === "개발") {
    return "accent";
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

function SortableHeader({
  align = "left",
  column,
  label,
  sortKey,
  sortOrder,
  onSortChange,
}: SortableHeaderProps) {
  const isActive = sortKey === column;
  const Icon = isActive ? (sortOrder === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <th className={`px-2 py-3 ${align === "center" ? "text-center" : "pl-4"}`}>
      <button
        type="button"
        className={`inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium uppercase tracking-wider transition-colors ${
          isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
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
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col style={{ width: "40px" }} />
            <col style={{ width: "12%" }} />
            <col />
            <col style={{ width: "10%" }} />
            <col style={{ width: "5%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "5%" }} />
            <col style={{ width: "8%" }} />
          </colgroup>
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-2 py-3 text-center">
                <Checkbox
                  aria-label="전체 선택"
                  checked={allChecked ? true : someChecked ? "indeterminate" : false}
                  onCheckedChange={onToggleSelectAll}
                />
              </th>
              <SortableHeader column="partNumber" label="품번" sortKey={sortKey} sortOrder={sortOrder} onSortChange={onSortChange} />
              <SortableHeader column="name" label="품명" sortKey={sortKey} sortOrder={sortOrder} onSortChange={onSortChange} />
              <SortableHeader
                align="center"
                column="category"
                label="카테고리"
                sortKey={sortKey}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
              />
              <SortableHeader
                align="center"
                column="revision"
                label="Rev"
                sortKey={sortKey}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
              />
              <SortableHeader
                align="center"
                column="lifecycleState"
                label="상태"
                sortKey={sortKey}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
              />
              <th className="px-2 py-3 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">도면</th>
              <th className="px-2 py-3 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">하위 부품</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="py-20 text-center" colSpan={8}>
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">불러오는 중...</p>
                  </div>
                </td>
              </tr>
            ) : null}

            {!isLoading && items.length === 0 ? (
              <tr>
                <td className="py-20 text-center" colSpan={8}>
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Search className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">검색 결과가 없습니다</p>
                      <p className="mt-1 text-xs text-muted-foreground">다른 검색어를 입력하거나 필터를 조정해 보세요</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : null}

            {!isLoading ? items.map((item) => (
              <tr
                key={item.id}
                className="group h-[45px] cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/50"
                onClick={() => onRowClick(item.id)}
              >
                <td className="px-2 py-2 text-center" onClick={(event) => event.stopPropagation()}>
                  <Checkbox
                    aria-label={`${item.partNumber} 선택`}
                    checked={selectedIds.has(item.id)}
                    onCheckedChange={() => onToggleSelectOne(item.id)}
                  />
                </td>
                <td className="py-2 pl-4 pr-2 font-mono text-xs font-medium text-primary">{item.partNumber}</td>
                <td className="py-2 pl-4 pr-2 text-foreground">{item.name ?? <span className="text-muted-foreground/40">—</span>}</td>
                <td className="px-2 py-2 text-center text-muted-foreground">{item.category ?? <span className="text-muted-foreground/40">—</span>}</td>
                <td className="px-2 py-2 text-center">
                  {item.revision ? (
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-muted text-[11px] font-medium text-muted-foreground">
                      {item.revision}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/40">—</span>
                  )}
                </td>
                <td className="px-2 py-2 text-center">
                  {item.lifecycleState ? (
                    <Badge
                      className={
                        item.lifecycleState === "양산"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : item.lifecycleState === "개발"
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : undefined
                      }
                      variant={getLifecycleVariant(item.lifecycleState)}
                    >
                      {item.lifecycleState}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground/40">—</span>
                  )}
                </td>
                <td className="px-2 py-2 text-center">
                  {item.drawingNumber ? (
                    <FileText className="mx-auto h-4 w-4 text-muted-foreground" />
                  ) : (
                    <span className="text-muted-foreground/40">—</span>
                  )}
                </td>
                <td className="px-2 py-2 text-center">
                  {item.childrenCount > 0 ? (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Network className="h-3.5 w-3.5" />
                      <span className="text-xs">{item.childrenCount}</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground/40">—</span>
                  )}
                </td>
              </tr>
            )) : null}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger className="h-8 w-[80px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((value) => (
                <SelectItem key={value} value={String(value)}>
                  {value}개씩
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">
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
                className="text-xs"
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
    </div>
  );
}
