import { ChevronRight, FileCheck, FilePen, FileX, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useItemStore } from "@/stores/itemStore";
import type { ItemData } from "../types";

interface ItemRowProps {
  item: ItemData;
  level: number;
}

export function ItemRow({ item, level }: ItemRowProps) {
  const { expandedIds, toggleExpanded, selectItem, selectedItem } =
    useItemStore();
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedIds.has(item.id);
  const isSelected = selectedItem?.id === item.id;
  const hasConflicts = item.conflicts && item.conflicts.length > 0;

  const statusConfig = {
    approved: { icon: FileCheck, color: "text-[#10b981]" },
    draft: { icon: FilePen, color: "text-[#f59e0b]" },
    none: { icon: FileX, color: "text-[#cbd5e1]" },
  };

  const status = statusConfig[item.drawingStatus ?? "none"];
  const StatusIcon = status.icon;

  return (
    <>
      <tr
        className={cn(
          "cursor-pointer border-b border-[#f1f5f9] transition-colors",
          isSelected
            ? "bg-[#eff6ff]"
            : "hover:bg-[#f8fafc]"
        )}
        onClick={() => selectItem(isSelected ? null : item)}
      >
        <td className="py-3.5 pr-6" style={{ paddingLeft: `${level * 20 + 16}px` }}>
          <div className="flex items-center gap-2">
            <button
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors",
                hasChildren && "hover:bg-[#e2e8f0]",
                !hasChildren && "invisible"
              )}
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(item.id);
              }}
            >
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 text-[#94a3b8] transition-transform",
                  isExpanded && "rotate-90"
                )}
              />
            </button>
            <span className="font-semibold text-[#0f172a]">{item.partNumber}</span>
            {hasConflicts && (
              <span className="ml-2 inline-flex items-center gap-1 rounded bg-[#fef2f2] px-1.5 py-0.5 text-[10px] font-medium text-[#dc2626]">
                <AlertTriangle className="h-3 w-3" />
                {item.conflicts!.length}
              </span>
            )}
          </div>
        </td>
        <td className="py-3.5 pr-6 text-[#334155]">{item.name}</td>
        <td className="py-3.5 pr-6">
          {item.material && (
            <span className="inline-flex items-center rounded-full bg-[#f1f5f9] px-3 py-1 text-[11px] font-medium text-[#475569]">
              {item.material}
            </span>
          )}
        </td>
        <td className="py-3.5 pr-6 text-right tabular-nums text-[#334155]">
          {item.quantity}
          <span className="ml-1 text-[#94a3b8]">{item.unit ?? "EA"}</span>
        </td>
        <td className="py-3.5 pr-4">
          <div className="flex items-center justify-center">
            <StatusIcon className={cn("h-4 w-4", status.color)} />
          </div>
        </td>
      </tr>
      {hasChildren &&
        isExpanded &&
        item.children!.map((child) => (
          <ItemRow key={child.id} item={child} level={level + 1} />
        ))}
    </>
  );
}
