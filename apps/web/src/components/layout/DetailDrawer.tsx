import { useNavigate } from "react-router-dom";
import { X, Maximize2, FileText, Box, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useItemStore } from "@/stores/itemStore";
import { cn } from "@/lib/utils";

export function DetailDrawer() {
  const navigate = useNavigate();
  const { drawerOpen, selectedItem, closeDrawer } = useItemStore();

  if (!selectedItem) return null;

  const statusConfig: Record<string, { label: string; bg: string; text: string; icon: typeof CheckCircle2 }> = {
    approved: { label: "승인됨", bg: "bg-[#ecfdf5]", text: "text-[#059669]", icon: CheckCircle2 },
    draft: { label: "분석중", bg: "bg-[#fffbeb]", text: "text-[#d97706]", icon: Sparkles },
    none: { label: "미등록", bg: "bg-[#f1f5f9]", text: "text-[#64748b]", icon: FileText },
  };

  const status = statusConfig[selectedItem.drawingStatus ?? "none"];
  const StatusIcon = status.icon;
  const hasConflicts = selectedItem.conflicts && selectedItem.conflicts.length > 0;

  const handleExpand = () => {
    closeDrawer();
    navigate(`/items/${selectedItem.id}`);
  };

  return (
    <div
      className={cn(
        "fixed right-0 top-0 z-50 flex h-full w-96 flex-col border-l border-[#e2e8f0] bg-white shadow-2xl transition-transform duration-300 ease-out",
        drawerOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#f1f5f9] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
            status.bg, status.text
          )}>
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </span>
          {hasConflicts && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#fef2f2] px-2 py-0.5 text-[11px] font-medium text-[#dc2626]">
              <AlertTriangle className="h-3 w-3" />
              {selectedItem.conflicts!.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[#64748b] hover:text-[#0f172a]"
            onClick={handleExpand}
            title="전체 화면으로 보기"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[#64748b] hover:text-[#0f172a]"
            onClick={closeDrawer}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Title */}
        <div className="border-b border-[#f1f5f9] px-5 py-4">
          <h3 className="text-[15px] font-semibold text-[#0f172a]">{selectedItem.name}</h3>
          <p className="mt-0.5 font-mono text-[13px] text-[#64748b]">{selectedItem.partNumber}</p>
        </div>

        {/* Drawing Thumbnail */}
        <div className="border-b border-[#f1f5f9] bg-[#f8fafc] p-4">
          <div
            className="relative cursor-pointer overflow-hidden rounded-lg border border-[#e2e8f0] bg-white transition-shadow hover:shadow-md"
            onClick={handleExpand}
          >
            <div className="flex h-32 items-center justify-center bg-[#fafafa]">
              <div className="flex flex-col items-center gap-1 text-[#94a3b8]">
                <svg className="h-12 w-12" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="10" y="10" width="80" height="60" rx="2" />
                  <line x1="10" y1="25" x2="90" y2="25" />
                  <line x1="30" y1="10" x2="30" y2="70" />
                  <rect x="35" y="30" width="50" height="35" rx="1" strokeDasharray="3 2" />
                  <circle cx="60" cy="47" r="10" />
                </svg>
                <span className="text-[10px]">클릭하여 상세 보기</span>
              </div>

              {selectedItem.aiAnalyzed && (
                <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-[#3b82f6] px-2 py-0.5 text-[9px] font-medium text-white">
                  <Sparkles className="h-2.5 w-2.5" />
                  AI 분석완료
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Conflict Alert (Compact) */}
        {hasConflicts && (
          <div className="border-b border-[#f1f5f9] px-4 py-3">
            <div
              className="cursor-pointer rounded-lg border border-[#fecaca] bg-[#fef2f2] p-3 transition-colors hover:bg-[#fee2e2]"
              onClick={handleExpand}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#dc2626]">
                  <AlertTriangle className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#dc2626]">{selectedItem.conflicts!.length}건의 불일치 감지</p>
                  <p className="text-[10px] text-[#64748b]">클릭하여 상세 내용 확인</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 gap-px bg-[#f1f5f9]">
          <div className="bg-white px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#94a3b8]">재질</p>
            <p className="mt-1 text-sm font-medium text-[#0f172a]">{selectedItem.material ?? "-"}</p>
          </div>
          <div className="bg-white px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#94a3b8]">수량</p>
            <p className="mt-1 text-sm font-medium text-[#0f172a]">{selectedItem.quantity} {selectedItem.unit ?? "EA"}</p>
          </div>
        </div>

        {/* Related Documents */}
        <div className="px-4 py-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#94a3b8]">관련 문서</p>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-[#f8fafc]">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fef2f2]">
                <FileText className="h-4 w-4 text-[#ef4444]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#0f172a]">도면.pdf</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-[#f8fafc]">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0fdf4]">
                <Box className="h-4 w-4 text-[#22c55e]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#0f172a]">3D모델.step</p>
              </div>
            </div>
          </div>
        </div>

        {/* Child Parts Preview */}
        {selectedItem.children && selectedItem.children.length > 0 && (
          <div className="border-t border-[#f1f5f9] px-4 py-4">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#94a3b8]">
              하위 부품 ({selectedItem.children.length})
            </p>
            <div className="mt-2 space-y-1">
              {selectedItem.children.slice(0, 3).map((child) => (
                <div key={child.id} className="flex items-center justify-between rounded py-1.5 text-sm">
                  <span className="text-[#334155]">{child.name}</span>
                  <span className="text-xs text-[#94a3b8]">x{child.quantity}</span>
                </div>
              ))}
              {selectedItem.children.length > 3 && (
                <button
                  className="text-xs text-[#3b82f6] hover:underline"
                  onClick={handleExpand}
                >
                  +{selectedItem.children.length - 3}개 더 보기
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="border-t border-[#f1f5f9] p-4">
        <Button
          className="w-full bg-[#0f172a] hover:bg-[#1e293b]"
          onClick={handleExpand}
        >
          <Maximize2 className="mr-2 h-4 w-4" />
          상세 화면 열기
        </Button>
      </div>
    </div>
  );
}
