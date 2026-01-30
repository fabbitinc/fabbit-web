import { useNavigate } from "react-router-dom";
import { FileText, Clock, ChevronRight, CheckCircle2, AlertTriangle, XCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RecentDrawing, DrawingStatus } from "../../types/dashboard.types";

interface RecentDrawingThumbnailsProps {
  drawings: RecentDrawing[];
  maxItems?: number;
  highlightedItemId?: string | null; // 주의 필요 항목에서 선택된 아이템
  onViewAll?: () => void;
}

const statusConfig: Record<DrawingStatus, { label: string; color: string; bgColor: string; icon: typeof CheckCircle2 }> = {
  approved: {
    label: "승인",
    color: "text-[#22c55e]",
    bgColor: "bg-[#ecfdf5]",
    icon: CheckCircle2,
  },
  reviewing: {
    label: "검토중",
    color: "text-[#f59e0b]",
    bgColor: "bg-[#fffbeb]",
    icon: Search,
  },
  rejected: {
    label: "반려",
    color: "text-[#ef4444]",
    bgColor: "bg-[#fef2f2]",
    icon: XCircle,
  },
  conflict: {
    label: "불일치",
    color: "text-[#ef4444]",
    bgColor: "bg-[#fef2f2]",
    icon: AlertTriangle,
  },
};

export function RecentDrawingThumbnails({
  drawings,
  maxItems = 3,
  highlightedItemId,
  onViewAll,
}: RecentDrawingThumbnailsProps) {
  const navigate = useNavigate();
  const displayDrawings = drawings.slice(0, maxItems);

  if (displayDrawings.length === 0) {
    return (
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-5">
        <h3 className="font-semibold text-[#0f172a]">최근 도면</h3>
        <div className="mt-4 flex items-center justify-center py-8 text-sm text-[#94a3b8]">
          업로드된 도면이 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#0f172a]">최근 도면</h3>
        {onViewAll && drawings.length > maxItems && (
          <Button variant="ghost" size="sm" className="text-xs text-[#3b82f6]" onClick={onViewAll}>
            모두 보기
            <ChevronRight className="ml-0.5 h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {displayDrawings.map((drawing) => {
          const status = statusConfig[drawing.status];
          const StatusIcon = status.icon;
          const isHighlighted = highlightedItemId === drawing.itemId;

          return (
            <div
              key={drawing.id}
              className={cn(
                "group cursor-pointer overflow-hidden rounded-lg border transition-all hover:shadow-md",
                isHighlighted
                  ? "border-[#3b82f6] ring-2 ring-[#3b82f6]/20 shadow-md"
                  : "border-[#e2e8f0] hover:border-[#3b82f6]/30"
              )}
              onClick={() => navigate(`/items/${drawing.itemId}`)}
            >
              {/* Thumbnail */}
              <div className="relative aspect-[4/3] bg-[#f8fafc]">
                {drawing.thumbnailUrl ? (
                  <img
                    src={drawing.thumbnailUrl}
                    alt={drawing.itemName}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                ) : null}
                {/* 플레이스홀더 */}
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#f1f5f9] to-[#e2e8f0]",
                    drawing.thumbnailUrl && "hidden"
                  )}
                >
                  <FileText className="h-8 w-8 text-[#94a3b8]" />
                </div>

                {/* 상태 배지 (좌상단) */}
                <div
                  className={cn(
                    "absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5",
                    status.bgColor
                  )}
                >
                  <StatusIcon className={cn("h-3 w-3", status.color)} />
                  <span className={cn("text-[10px] font-medium", status.color)}>{status.label}</span>
                </div>

                {/* 버전 배지 (우상단) */}
                <div className="absolute right-2 top-2 rounded bg-black/60 px-1.5 py-0.5">
                  <span className="font-mono text-[10px] font-medium text-white">{drawing.version}</span>
                </div>

                {/* 하이라이트 인디케이터 */}
                {isHighlighted && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-[#3b82f6] px-2 py-0.5">
                    <AlertTriangle className="h-3 w-3 text-white" />
                    <span className="text-[10px] font-medium text-white">주의 필요</span>
                  </div>
                )}

                {/* 호버 오버레이 */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#0f172a]">
                    상세 보기
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-2">
                <p className={cn("truncate text-sm font-medium", isHighlighted ? "text-[#3b82f6]" : "text-[#0f172a]")}>
                  {drawing.itemName}
                </p>
                <p className="truncate font-mono text-xs text-[#64748b]">{drawing.partNumber}</p>
                <div className="mt-1 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-[#94a3b8]">
                    <Clock className="h-3 w-3" />
                    <span>{drawing.uploadedAt}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
