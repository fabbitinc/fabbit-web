import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  FilePen,
  FileCheck,
  FileX,
  MessageSquare,
  Plus,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LabelBadge } from "@fabbit/ui";
import { cn } from "@/lib/utils";
import type { ChangeRequest, ChangeRequestType } from "@/pages/projects/changeRequestMock";
import { useIssues } from "@/api/hooks/useIndependentIssues";
import { useChanges } from "@/api/hooks/useIndependentChanges";
import { toIssueChangeRequest, toChangeChangeRequest } from "./utils";

// --- 유틸 ---

function formatShortDate(dateString: string): string {
  const d = new Date(dateString);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  return formatShortDate(iso);
}


// --- 상태 아이콘 설정 ---

const CR_STATUS_CONFIG: Record<
  string,
  { icon: React.ElementType; label: string; className: string }
> = {
  draft: { icon: FilePen, label: "초안", className: "text-gray-500 dark:text-gray-400" },
  open: { icon: FilePen, label: "제출", className: "text-emerald-600 dark:text-emerald-400" },
  merged: { icon: FileCheck, label: "반영", className: "text-purple-600 dark:text-purple-400" },
  closed: { icon: FileX, label: "닫힘", className: "text-red-500 dark:text-red-400" },
};

const ISSUE_STATUS_CONFIG: Record<
  string,
  { icon: React.ElementType; label: string; className: string }
> = {
  open: { icon: AlertCircle, label: "열림", className: "text-emerald-600 dark:text-emerald-400" },
  closed: { icon: CheckCircle2, label: "닫힘", className: "text-purple-600 dark:text-purple-400" },
};

function CRStatusIcon({ cr }: { cr: ChangeRequest }) {
  const config =
    cr.type === "pr"
      ? CR_STATUS_CONFIG[cr.status]
      : ISSUE_STATUS_CONFIG[cr.status];

  if (!config) return null;

  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 ${config.className}`}>
      <Icon className="h-4 w-4" />
      <span className="text-xs font-medium">{config.label}</span>
    </span>
  );
}

// --- 리스트 뷰 ---

function CRListView({
  items,
  type,
  createLabel,
  emptyIcon: EmptyIcon,
  onCreate,
  onSelect,
  isLoading,
}: {
  items: ChangeRequest[];
  type: ChangeRequestType;
  createLabel: string;
  emptyIcon: React.ElementType;
  onCreate: () => void;
  onSelect: (cr: ChangeRequest) => void;
  isLoading?: boolean;
}) {
  const [statusFilter, setStatusFilter] = useState<"open" | "closed">("open");

  const isOpenStatus = (status: string) =>
    status === "open" || status === "draft";
  const openCount = items.filter((c) => isOpenStatus(c.status)).length;
  const closedCount = items.filter((c) => !isOpenStatus(c.status)).length;

  const filtered = useMemo(() => {
    if (statusFilter === "open") {
      return items.filter((c) => isOpenStatus(c.status));
    }
    return items.filter((c) => !isOpenStatus(c.status));
  }, [items, statusFilter]);

  const emptyLabel =
    type === "issue"
      ? statusFilter === "open"
        ? "열린 이슈가 없습니다"
        : "닫힌 이슈가 없습니다"
      : statusFilter === "open"
        ? "열린 변경 요청이 없습니다"
        : "닫힌 변경 요청이 없습니다";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      {/* 필터 헤더 */}
      <div className="flex items-center justify-between border-b px-5 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setStatusFilter("open")}
            className={`inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer transition-colors ${
              statusFilter === "open"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <AlertCircle className="h-4 w-4" />
            {openCount} 열림
          </button>
          <button
            onClick={() => setStatusFilter("closed")}
            className={`inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer transition-colors ${
              statusFilter === "closed"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            {closedCount} 닫힘
          </button>
        </div>
        <Button size="sm" onClick={onCreate}>
          <Plus className="h-3.5 w-3.5" />
          {createLabel}
        </Button>
      </div>

      {/* 리스트 */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <EmptyIcon className="h-8 w-8 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">{emptyLabel}</p>
        </div>
      ) : (
        <div className="divide-y">
          {filtered.map((cr) => (
            <button
              key={cr.id}
              onClick={() => onSelect(cr)}
              className="flex w-full items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-muted/30 cursor-pointer"
            >
              <div className="mt-0.5 shrink-0 w-14">
                <CRStatusIcon cr={cr} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {cr.title}
                  </span>
                  {cr.labels.map((label) => (
                    <LabelBadge
                      key={label.name}
                      label={label.name}
                      colorHex={label.colorHex}
                      size="sm"
                    />
                  ))}
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>#{cr.number}</span>
                  <span>·</span>
                  <span>
                    {cr.author} 님이 {timeAgo(cr.createdAt)} 생성했습니다
                  </span>
                  {cr.assignees.length > 0 && (
                    <>
                      <span>·</span>
                      <div className="flex -space-x-1">
                        {cr.assignees.map((assignee) => (
                          <UserAvatar
                            key={assignee.id ?? assignee.name}
                            name={assignee.name}
                            imageUrl={assignee.profileImageUrl}
                            className="h-4 w-4 border border-background text-[8px]"
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {cr.commentsCount > 0 && (
                <div className="mt-1 flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {cr.commentsCount}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- 탭 콘텐츠 ---

function IssuesTab() {
  const navigate = useNavigate();
  const { data: issuesResponse, isLoading } = useIssues();

  const issues = useMemo(
    () => issuesResponse?.items.map((issue) => toIssueChangeRequest(issue)) ?? [],
    [issuesResponse],
  );

  return (
    <CRListView
      items={issues}
      type="issue"
      createLabel="새 이슈"
      emptyIcon={AlertCircle}
      isLoading={isLoading}
      onCreate={() => navigate("/changes/issues/new")}
      onSelect={(cr) => navigate(`/changes/issues/${cr.number}`)}
    />
  );
}

function RequestsTab() {
  const navigate = useNavigate();
  const { data: changesResponse, isLoading } = useChanges();

  const changes = useMemo(
    () => changesResponse?.items.map((change) => toChangeChangeRequest(change)) ?? [],
    [changesResponse],
  );

  return (
    <CRListView
      items={changes}
      type="pr"
      createLabel="새 변경 요청"
      emptyIcon={FilePen}
      isLoading={isLoading}
      onCreate={() => navigate("/changes/requests/new")}
      onSelect={(cr) => navigate(`/changes/requests/${cr.number}`)}
    />
  );
}

// --- 메인 페이지 ---

type TabId = "issues" | "requests";

const TABS: { id: TabId; label: string; path: string }[] = [
  { id: "issues", label: "이슈", path: "/changes/issues" },
  { id: "requests", label: "변경 요청", path: "/changes/requests" },
];

export function ChangeManagementPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab: TabId = location.pathname.includes("/changes/requests")
    ? "requests"
    : "issues";

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">변경 관리</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <HelpCircle className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>내가 담당자, 검토자, 생성자인 항목만 표시됩니다</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* 탭 바 */}
      <div className="flex gap-4 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={cn(
              "relative px-1 pb-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-foreground" />
            )}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 — 기존 Routes 제거, activeTab 기반 렌더링 */}
      {activeTab === "issues" ? <IssuesTab /> : <RequestsTab />}
    </div>
  );
}
