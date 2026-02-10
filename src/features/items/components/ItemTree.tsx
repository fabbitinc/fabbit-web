import { Loader2 } from "lucide-react";
import { useItemStore } from "@/stores/itemStore";
import { useItems } from "@/api";
import { ItemRow } from "./ItemRow";

export function ItemTree() {
  const selectedFolderId = useItemStore((state) => state.selectedFolderId);
  const { data: items = [], isLoading, error } = useItems(selectedFolderId || null);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#3b82f6]" />
        <span className="ml-2 text-[#64748b]">아이템 로딩 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="text-red-400">아이템을 불러오지 못했습니다</p>
        <p className="mt-1 text-xs text-[#64748b]">{error.message}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-[#94a3b8]">
        선택된 폴더에 아이템이 없습니다
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <table className="w-full text-sm table-fixed">
        <colgroup>
          {/* 품명: 열기 버튼(28px) + 들여쓰기 여유(80px) + 텍스트 */}
          <col className="w-[280px] min-w-[280px]" />
          {/* 품번 */}
          <col className="w-[160px]" />
          {/* 재질 */}
          <col className="w-[120px]" />
          {/* 수량 */}
          <col className="w-[100px]" />
          {/* 도면 */}
          <col className="w-[60px]" />
        </colgroup>
        <thead>
          <tr className="border-b border-[#e2e8f0] bg-[#f8fafc] text-left">
            <th className="py-3 pl-4 pr-6 text-[11px] font-medium uppercase tracking-wider text-[#64748b]">
              품명
            </th>
            <th className="py-3 pr-6 text-[11px] font-medium uppercase tracking-wider text-[#64748b]">
              품번
            </th>
            <th className="py-3 pr-6 text-[11px] font-medium uppercase tracking-wider text-[#64748b]">
              재질
            </th>
            <th className="py-3 pr-6 text-right text-[11px] font-medium uppercase tracking-wider text-[#64748b]">
              수량
            </th>
            <th className="py-3 pr-4 text-center text-[11px] font-medium uppercase tracking-wider text-[#64748b]">
              도면
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <ItemRow key={item.id} item={item} level={0} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
