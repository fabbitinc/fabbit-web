import { Badge } from "@fabbit/ui";

export interface OrganizationLogsTabItem {
  id: string;
  action: string;
  actor: string;
  target: string;
  ip: string;
  at: string;
  result: string;
}

export interface OrganizationLogsTabProps {
  logs: OrganizationLogsTabItem[];
  caption?: string;
}

export function OrganizationLogsTab({
  logs,
  caption = "최근 7일 활동 로그 (목데이터)",
}: OrganizationLogsTabProps) {
  const successCount = logs.filter((log) => log.result === "성공").length;
  const failedCount = logs.length - successCount;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">성공 {successCount}</Badge>
        <Badge variant="outline">실패 {failedCount}</Badge>
        <p className="text-sm text-muted-foreground">{caption}</p>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-border/70 bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">시각</th>
              <th className="px-4 py-3 text-left font-medium">작업</th>
              <th className="px-4 py-3 text-left font-medium">대상</th>
              <th className="px-4 py-3 text-left font-medium">사용자</th>
              <th className="px-4 py-3 text-left font-medium">IP</th>
              <th className="px-4 py-3 text-left font-medium">결과</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-border/70">
                <td className="px-4 py-3 text-muted-foreground">{log.at}</td>
                <td className="px-4 py-3 text-foreground">{log.action}</td>
                <td className="px-4 py-3 text-muted-foreground">{log.target}</td>
                <td className="px-4 py-3 text-foreground">{log.actor}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{log.ip}</td>
                <td className="px-4 py-3">
                  <Badge variant={log.result === "성공" ? "secondary" : "destructive"}>{log.result}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
