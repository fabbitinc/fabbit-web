import {
  Calendar,
  Clock,
  Pause,
  Plus,
  Search,
} from "lucide-react";
import {
  Badge,
  Button,
  InlineTabs,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  UserAvatar,
} from "@fabbit/ui";

export interface ProductionResultListItem {
  id: string;
  orderNumber: string;
  productName: string;
  goodQuantity: number;
  defectQuantity: number;
  plannedQuantity: number;
  workDuration: string;
  recordedAt: string;
  recorder: {
    name: string;
    profileImageUrl: string | null;
  };
  team: string;
  hasDefectRecord: boolean;
}

export interface ProductionResultListQueryState {
  query: string;
  page: number;
  pageSize: number;
  period: "today" | "week" | "month" | "all";
  team: string | null;
}

export interface ProductionResultListScreenProps {
  items: ProductionResultListItem[];
  queryState: ProductionResultListQueryState;
  totalCount: number;
  teams: string[];
  isLoading?: boolean;
  onCreateClick: () => void;
  onItemClick: (item: ProductionResultListItem) => void;
  onPageChange: (page: number) => void;
  onQueryChange: (query: string) => void;
  onPeriodChange: (period: ProductionResultListQueryState["period"]) => void;
  onTeamChange: (team: string | null) => void;
}

const PERIOD_TABS = [
  { key: "today", label: "오늘" },
  { key: "week", label: "이번 주" },
  { key: "month", label: "이번 달" },
  { key: "all", label: "전체" },
] as const;

export function ProductionResultListScreen({
  items,
  queryState,
  totalCount,
  teams,
  isLoading = false,
  onCreateClick,
  onItemClick,
  onPageChange,
  onQueryChange,
  onPeriodChange,
  onTeamChange,
}: ProductionResultListScreenProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / queryState.pageSize));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">생산실적</h1>
          <p className="mt-1 text-sm text-muted-foreground">생산 실적을 조회하고 관리합니다</p>
        </div>
        <Button type="button" onClick={onCreateClick}>
          <Plus className="size-4" />
          실적 입력
        </Button>
      </div>

      <InlineTabs
        items={PERIOD_TABS.map((tab) => ({ key: tab.key, label: tab.label }))}
        activeKey={queryState.period}
        onChange={(key) => onPeriodChange(key as ProductionResultListQueryState["period"])}
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
          </div>
        </div>

        <div className="border-b px-4 py-2">
          <span className="text-xs text-muted-foreground">
            {isLoading ? "불러오는 중..." : `${totalCount.toLocaleString()}건의 실적`}
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
            <p className="mt-3 text-sm text-muted-foreground">등록된 실적이 없습니다</p>
          </div>
        ) : null}

        {!isLoading && totalCount > 0 ? (
          <div className="divide-y">
            {items.map((item) => {
              const totalQuantity = item.goodQuantity + item.defectQuantity;
              const achievementRate = item.plannedQuantity > 0
                ? Math.round((item.goodQuantity / item.plannedQuantity) * 100)
                : 0;

              return (
                <button
                  key={item.id}
                  className="flex w-full cursor-pointer items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-muted/30"
                  type="button"
                  onClick={() => onItemClick(item)}
                >
                  <div className="mt-0.5 shrink-0">
                    <Badge variant={achievementRate >= 100 ? "success" : "info"} className="gap-1">
                      {achievementRate}%
                    </Badge>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">{item.orderNumber}</span>
                      <span className="text-sm font-medium text-foreground">{item.productName}</span>
                      {item.hasDefectRecord && (
                        <Badge variant="danger" className="text-[10px]">
                          불량
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>양품: {item.goodQuantity.toLocaleString()}</span>
                      <span>·</span>
                      <span className={item.defectQuantity > 0 ? "text-destructive" : ""}>
                        불량: {item.defectQuantity.toLocaleString()}
                      </span>
                      <span>·</span>
                      <span>총: {totalQuantity.toLocaleString()} / {item.plannedQuantity.toLocaleString()}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {item.workDuration}
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="size-3" />
                        {item.recordedAt}
                      </span>
                      <span>·</span>
                      <span>{item.team}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <UserAvatar
                      className="size-6 text-[10px]"
                      imageUrl={item.recorder.profileImageUrl}
                      name={item.recorder.name}
                    />
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
