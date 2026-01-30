import { Info, AlertTriangle, AlertCircle, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Announcement } from "../../types/dashboard.types";

interface AnnouncementBannerProps {
  announcements: Announcement[];
  onDismiss?: (id: string) => void;
  onViewAll?: () => void;
}

const typeConfig = {
  info: {
    icon: Info,
    bgColor: "bg-[#eff6ff]",
    borderColor: "border-[#bfdbfe]",
    iconColor: "text-[#3b82f6]",
    titleColor: "text-[#1e40af]",
    textColor: "text-[#3b82f6]",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-[#fffbeb]",
    borderColor: "border-[#fde68a]",
    iconColor: "text-[#f59e0b]",
    titleColor: "text-[#92400e]",
    textColor: "text-[#b45309]",
  },
  urgent: {
    icon: AlertCircle,
    bgColor: "bg-[#fef2f2]",
    borderColor: "border-[#fecaca]",
    iconColor: "text-[#ef4444]",
    titleColor: "text-[#991b1b]",
    textColor: "text-[#dc2626]",
  },
};

export function AnnouncementBanner({ announcements, onDismiss, onViewAll }: AnnouncementBannerProps) {
  if (announcements.length === 0) return null;

  // urgent > warning > info 순으로 정렬하여 첫 번째 표시
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    const priority = { urgent: 0, warning: 1, info: 2 };
    return priority[a.type] - priority[b.type];
  });

  const announcement = sortedAnnouncements[0];
  const config = typeConfig[announcement.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", config.iconColor)} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={cn("font-medium", config.titleColor)}>
              {announcement.title}
            </h4>
            {announcements.length > 1 && (
              <span className={cn("text-xs", config.textColor)}>
                +{announcements.length - 1}
              </span>
            )}
          </div>
          <p className={cn("mt-1 text-sm", config.textColor)}>
            {announcement.content}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-xs text-[#94a3b8]">
              {announcement.author} · {announcement.createdAt}
            </span>
            {onViewAll && announcements.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-auto p-0 text-xs hover:bg-transparent", config.textColor)}
                onClick={onViewAll}
              >
                모두 보기
                <ChevronRight className="ml-0.5 h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-[#94a3b8] hover:text-[#64748b]"
            onClick={() => onDismiss(announcement.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
