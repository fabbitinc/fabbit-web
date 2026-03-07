import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  CircleDot,
  Clock,
  MessageSquare,
  Pause,
  Play,
  Plus,
  Search,
  XCircle,
} from "lucide-react";
import {
  Badge,
  Button,
  Input,
  InlineTabs,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  UserAvatar,
} from "@fabbit/ui";

export type WorkOrderStatus = "draft" | "released" | "in_progress" | "done" | "cancelled";

export interface WorkOrderListItem {
  id: string;
  orderNumber: string;
  productName: string;
  quantity: number;
  dueDate: string;
  priority: "high" | "medium" | "low";
  status: WorkOrderStatus;
  assignee: {
    name: string;
    profileImageUrl: string | null;
  };
  team: string;
  commentsCount: number;
  bomReference: string;
}

export interface WorkOrderListScreenQueryState {
  query: string;
  page: number;
  pageSize: number;
  status: WorkOrderStatus | "all";
  team: string | null;
  priority: string | null;
}

export interface WorkOrderListScreenProps {
  items: WorkOrderListItem[];
  queryState: WorkOrderListScreenQueryState;
  totalCount: number;
  teams: string[];
  isLoading?: boolean;
  onCreateClick: () => void;
  onItemClick: (item: WorkOrderListItem) => void;
  onPageChange: (page: number) => void;
  onQueryChange: (query: string) => void;
  onStatusChange: (status: WorkOrderStatus | "all") => void;
  onTeamChange: (team: string | null) => void;
  onPriorityChange: (priority: string | null) => void;
}

const STATUS_TABS = [
  { key: "all", label: "전체" },
  { key: "released", label: "예정" },
  { key: "in_progress", label: "진행 중" },
  { key: "done", label: "완료" },
  { key: "draft", label: "초안" },
  { key: "cancelled", label: "취소" },
] as const;

function getStatusConfig(status: WorkOrderStatus) {
  switch (status) {
    case "draft":
      return { icon: CircleDot, label: "초안", variant: "neutral" as const };
    case "released":
      return { icon: Clock, label: "예정", variant: "info" as const };
    case "in_progress":
      return { icon: Play, label: "진행 중", variant: "success" as const };
    case "done":
      return { icon: CheckCircle2, label: "완료", variant: "accent" as const };
    case "cancelled":
      return { icon: XCircle, label: "취소", variant: "danger" as const };
  }
}

function getPriorityConfig(priority: "high" | "medium" | "low") {
  switch (priority) {
    case "high":
      return { label: "긴급", variant: "danger" as const };
    case "medium":
      return { label: "보통", variant: "warning" as const };
    case "low":
      return { label: "낮음", variant: "neutral" as const };
  }
}

function isOverdue(dueDate: string, status: WorkOrderStatus) {
  if (status === "done" || status === "cancelled") return false;
  return new Date(dueDate) < new Date();
}

export function WorkOrderListScreen({
  items,
  queryState,
  totalCount,
  teams,
  isLoading = false,
  onCreateClick,
  onItemClick,
  onPageChange,
  onQueryChange,
  onStatusChange,
  onTeamChange,
  onPriorityChange,
}: WorkOrderListScreenProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / queryState.pageSize));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">작업지시</h1>
          <p className="mt-1 text-sm text-muted-foreground">생산 작업을 관리합니다</p>
        </div>
        <Button type="button" onClick={onCreateClick}>
          <Plus className="size-4" />
          새 작업 등록
        </Button>
      </div>

      <InlineTabs
        items={STATUS_TABS.map((tab) => ({ key: tab.key, label: tab.label }))}
        activeKey={queryState.status}
        onChange={(key) => onStatusChange(key as WorkOrderStatus | "all")}
      />

      <div className="rounded-lg border bg-card">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="작업번호 또는 품목명으로 검색"
              value={queryState.query}
              onChange={(e) => onQueryChange(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={queryState.team ?? "__all__"}
              onValueChange={(v) => onTeamChange(v === "__all__" ? null : v)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="담당" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">전체 담당</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={queryState.priority ?? "__all__"}
              onValueChange={(v) => onPriorityChange(v === "__all__" ? null : v)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="우선순위" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">전체</SelectItem>
                <SelectItem value="high">긴급</SelectItem>
                <SelectItem value="medium">보통</SelectItem>
                <SelectItem value="low">낮음</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border-b px-4 py-2">
          <span className="text-xs text-muted-foreground">
            {isLoading ? "불러오는 중..." : `${totalCount.toLocaleString()}건의 작업`}
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
            목록을 불러오는 중입니다.
          </div>
        ) : null}

        {!isLoading && totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Pause className="size-8 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">작업지시가 없습니다</p>
          </div>
        ) : null}

        {!isLoading && totalCount > 0 ? (
          <div className="divide-y">
            {items.map((item) => {
              const statusCfg = getStatusConfig(item.status);
              const priorityCfg = getPriorityConfig(item.priority);
              const StatusIcon = statusCfg.icon;
              const overdue = isOverdue(item.dueDate, item.status);

              return (
                <button
                  key={item.id}
                  className="flex w-full cursor-pointer items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-muted/30"
                  type="button"
                  onClick={() => onItemClick(item)}
                >
                  <div className="mt-0.5 shrink-0">
                    <Badge variant={statusCfg.variant} className="gap-1">
                      <StatusIcon className="size-3" />
                      {statusCfg.label}
                    </Badge>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">{item.orderNumber}</span>
                      <span className="text-sm font-medium text-foreground">{item.productName}</span>
                      <Badge variant={priorityCfg.variant} className="text-[10px]">
                        {priorityCfg.label}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>수량: {item.quantity.toLocaleString()}</span>
                      <span>·</span>
                      <span className={`inline-flex items-center gap-1 ${overdue ? "font-medium text-destructive" : ""}`}>
                        {overdue && <AlertTriangle className="size-3" />}
                        <Calendar className="size-3" />
                        납기: {item.dueDate}
                      </span>
                      <span>·</span>
                      <span>{item.team}</span>
                      <span>·</span>
                      <span>{item.bomReference}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <UserAvatar
                      className="size-6 text-[10px]"
                      imageUrl={item.assignee.profileImageUrl}
                      name={item.assignee.name}
                    />
                    {item.commentsCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="size-3.5" />
                        {item.commentsCount}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}

        {!isLoading && totalPages > 1 ? (
          <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-3">
            <span className="text-xs text-muted-foreground">
              {queryState.page} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                disabled={queryState.page <= 1}
                size="sm"
                type="button"
                variant="ghost"
                onClick={() => onPageChange(queryState.page - 1)}
              >
                이전
              </Button>
              <Button
                disabled={queryState.page >= totalPages}
                size="sm"
                type="button"
                variant="ghost"
                onClick={() => onPageChange(queryState.page + 1)}
              >
                다음
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
