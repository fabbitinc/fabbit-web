export interface PartHistoryEntry {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface PartHistoryTabProps {
  entries?: PartHistoryEntry[];
  notice?: string;
}

const defaultEntries: PartHistoryEntry[] = [
  {
    id: "history-1",
    title: "도면이 갱신되었습니다.",
    description: "DWG 도면이 최신 버전으로 교체되었습니다.",
    timestamp: "2026-02-24T10:30:00Z",
  },
  {
    id: "history-2",
    title: "담당자가 변경되었습니다.",
    description: "부품 기본 담당자가 생산기술팀으로 조정되었습니다.",
    timestamp: "2026-02-19T06:10:00Z",
  },
  {
    id: "history-3",
    title: "프로젝트 연결이 추가되었습니다.",
    description: "신규 프로젝트 시제 제작 이슈와 함께 연결되었습니다.",
    timestamp: "2026-02-11T02:20:00Z",
  },
];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function PartHistoryTab({
  entries = defaultEntries,
  notice = "이력 탭은 레거시와 동일하게 현재 mock 데이터를 유지합니다. 추후 부품 활동 계약이 생기면 실제 타임라인으로 교체합니다.",
}: PartHistoryTabProps) {
  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-border/70 bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
        {notice}
      </div>

      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-lg border border-border/70 bg-card px-4 py-4">
            <p className="font-medium text-foreground">{entry.title}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{entry.description}</p>
            <p className="mt-3 text-xs text-muted-foreground">{formatDateTime(entry.timestamp)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
