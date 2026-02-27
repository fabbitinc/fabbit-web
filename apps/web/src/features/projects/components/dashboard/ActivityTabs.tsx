import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Upload, AlertTriangle, FileText, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Activity, Comment } from "../../types/dashboard.types";

type TabType = "activity" | "comments";

interface ActivityTabsProps {
  activities: Activity[];
  comments: Comment[];
}

// 멘션 하이라이트 함수
function highlightMentions(content: string, mentions: string[]): React.ReactNode {
  if (mentions.length === 0) return content;

  const parts: React.ReactNode[] = [];
  let remaining = content;
  let key = 0;

  mentions.forEach((mention) => {
    const mentionText = `@${mention}`;
    const index = remaining.indexOf(mentionText);

    if (index !== -1) {
      if (index > 0) {
        parts.push(remaining.substring(0, index));
      }
      parts.push(
        <span key={key++} className="rounded bg-[#3b82f6]/10 px-1 font-medium text-[#3b82f6]">
          {mentionText}
        </span>
      );
      remaining = remaining.substring(index + mentionText.length);
    }
  });

  if (remaining) {
    parts.push(remaining);
  }

  return parts;
}

export function ActivityTabs({ activities, comments }: ActivityTabsProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("activity");

  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white">
      {/* Tab Headers */}
      <div className="flex items-center border-b border-[#e2e8f0]">
        <button
          className={cn(
            "relative flex-1 px-4 py-3 text-sm font-medium transition-colors",
            activeTab === "activity" ? "text-[#3b82f6]" : "text-[#64748b] hover:text-[#0f172a]"
          )}
          onClick={() => setActiveTab("activity")}
        >
          <span>최근 활동</span>
          {activities.length > 0 && (
            <span
              className={cn(
                "ml-1.5 text-xs",
                activeTab === "activity" ? "text-[#3b82f6]" : "text-[#94a3b8]"
              )}
            >
              ({activities.length})
            </span>
          )}
          {activeTab === "activity" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3b82f6]" />
          )}
        </button>
        <button
          className={cn(
            "relative flex-1 px-4 py-3 text-sm font-medium transition-colors",
            activeTab === "comments" ? "text-[#8b5cf6]" : "text-[#64748b] hover:text-[#0f172a]"
          )}
          onClick={() => setActiveTab("comments")}
        >
          <span>댓글</span>
          {comments.length > 0 && (
            <span
              className={cn(
                "ml-1.5 text-xs",
                activeTab === "comments" ? "text-[#8b5cf6]" : "text-[#94a3b8]"
              )}
            >
              ({comments.length})
            </span>
          )}
          {activeTab === "comments" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8b5cf6]" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="max-h-[280px] overflow-y-auto p-4">
        {activeTab === "activity" ? (
          activities.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-[#94a3b8]">
              활동 내역이 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      activity.type === "approve" && "bg-[#ecfdf5]",
                      activity.type === "upload" && "bg-[#eff6ff]",
                      activity.type === "conflict" && "bg-[#fef2f2]",
                      activity.type === "comment" && "bg-[#f5f3ff]"
                    )}
                  >
                    {activity.type === "approve" && <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />}
                    {activity.type === "upload" && <Upload className="h-4 w-4 text-[#3b82f6]" />}
                    {activity.type === "conflict" && <AlertTriangle className="h-4 w-4 text-[#ef4444]" />}
                    {activity.type === "comment" && <FileText className="h-4 w-4 text-[#8b5cf6]" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#0f172a]">
                      <span className="font-medium">{activity.user}</span>{" "}
                      <span className="text-[#64748b]">{activity.action}</span>
                    </p>
                    <p
                      className={cn(
                        "mt-0.5 truncate text-xs",
                        activity.targetId
                          ? "cursor-pointer text-[#3b82f6] hover:underline"
                          : "text-[#64748b]"
                      )}
                      onClick={() => activity.targetId && navigate(`/items/${activity.targetId}`)}
                    >
                      {activity.target}
                    </p>
                    <p className="mt-0.5 text-xs text-[#94a3b8]">{activity.createdAt}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : comments.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-[#94a3b8]">
            댓글이 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] text-xs font-medium text-white">
                  {comment.author[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#0f172a]">{comment.author}</span>
                    <span className="text-xs text-[#94a3b8]">{comment.createdAt}</span>
                  </div>
                  <p className="mt-1 text-sm text-[#334155]">
                    {highlightMentions(comment.content, comment.mentions)}
                  </p>
                  {comment.targetId && (
                    <p
                      className="mt-1 flex cursor-pointer items-center gap-1 text-xs text-[#64748b] hover:text-[#3b82f6]"
                      onClick={() => navigate(`/items/${comment.targetId}`)}
                    >
                      <MessageSquare className="h-3 w-3" />
                      {comment.targetType === "item" && "품목 댓글"}
                      {comment.targetType === "milestone" && "마일스톤 댓글"}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
