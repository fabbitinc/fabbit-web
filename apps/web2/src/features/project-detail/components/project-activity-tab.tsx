import { useMemo, useState } from "react";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, UserAvatar } from "@fabbit/ui";
import { useProjectActivitiesQuery } from "@/features/project-detail/hooks/use-project-activities-query";

const activityScopeOptions = [
  { id: "all", label: "전체" },
  { id: "project", label: "프로젝트" },
  { id: "issue", label: "이슈" },
  { id: "cr", label: "변경요청" },
] as const;

function getActionLabel(action: string) {
  const actionLabelMap: Record<string, string> = {
    "project:updated": "프로젝트 정보 수정",
    "project:part_added": "부품 연결",
    "project:part_removed": "부품 연결 해제",
    "project:archived": "프로젝트 보관",
    "project:unarchived": "프로젝트 보관 해제",
    "issue:created": "이슈 생성",
    "cr:created": "변경요청 생성",
  };

  return actionLabelMap[action] ?? action;
}

interface ProjectActivityTabProps {
  projectId: string;
}

export function ProjectActivityTab({ projectId }: ProjectActivityTabProps) {
  const [scope, setScope] = useState<(typeof activityScopeOptions)[number]["id"]>("all");
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([]);

  const activityQuery = useProjectActivitiesQuery(projectId, {
    cursor: cursor ?? undefined,
    limit: 20,
    scope: scope === "all" ? undefined : scope,
  });

  const formattedItems = useMemo(() => activityQuery.data?.items ?? [], [activityQuery.data?.items]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-lg font-semibold text-foreground">프로젝트 활동</p>
          <p className="mt-1 text-sm text-muted-foreground">프로젝트 범위의 최신 활동 피드를 확인합니다.</p>
        </div>
        <Select
          value={scope}
          onValueChange={(value) => {
            setScope(value as (typeof activityScopeOptions)[number]["id"]);
            setCursor(null);
            setCursorStack([]);
          }}
        >
          <SelectTrigger className="w-[160px] bg-background">
            <SelectValue placeholder="범위 선택" />
          </SelectTrigger>
          <SelectContent>
            {activityScopeOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <section className="app-panel rounded-[32px] p-5">
        <div className="space-y-3">
          {formattedItems.map((item) => (
            <div key={item.id} className="flex gap-3 rounded-[24px] border border-border/70 bg-card px-4 py-4">
              <div className="mt-1 rounded-full bg-primary/10 p-2 text-primary">
                <Activity className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {item.actor ? (
                    <div className="flex items-center gap-2">
                      <UserAvatar imageUrl={item.actor.profileImageUrl} name={item.actor.fullName} />
                      <span className="font-medium text-foreground">{item.actor.fullName}</span>
                    </div>
                  ) : (
                    <span className="font-medium text-foreground">알 수 없는 사용자</span>
                  )}
                  <span className="text-sm text-muted-foreground">{getActionLabel(item.action)}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {new Intl.DateTimeFormat("ko-KR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(item.createdAt))}
                </p>
              </div>
            </div>
          ))}

          {activityQuery.isLoading ? (
            <div className="rounded-[24px] border border-border/70 bg-card px-4 py-10 text-center text-sm text-muted-foreground">
              활동을 불러오는 중입니다.
            </div>
          ) : null}

          {!activityQuery.isLoading && formattedItems.length === 0 ? (
            <div className="rounded-[24px] border border-border/70 bg-card px-4 py-10 text-center text-sm text-muted-foreground">
              선택한 범위의 활동이 없습니다.
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Button
            disabled={cursorStack.length === 0}
            type="button"
            variant="outline"
            onClick={() => {
              const previousCursor = cursorStack.at(-1) ?? null;
              setCursorStack((current) => current.slice(0, -1));
              setCursor(previousCursor);
            }}
          >
            <ChevronLeft className="size-4" />
            이전 묶음
          </Button>

          <Button
            disabled={!activityQuery.data?.nextCursor}
            type="button"
            variant="outline"
            onClick={() => {
              setCursorStack((current) => [...current, cursor]);
              setCursor(activityQuery.data?.nextCursor ?? null);
            }}
          >
            다음 묶음
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
