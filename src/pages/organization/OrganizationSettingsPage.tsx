import { useMemo, useState, type ComponentType } from "react";
import { ShieldCheck, Building2, ListChecks, History, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";

type SettingsTab = "general" | "security" | "logs" | "advanced";

interface AllowedIpEntry {
  id: string;
  cidr: string;
}

const settingsTabs: Array<{ id: SettingsTab; label: string; icon: ComponentType<{ className?: string }> }> = [
  { id: "general", label: "일반", icon: Building2 },
  { id: "security", label: "보안", icon: ShieldCheck },
  { id: "logs", label: "로그 기록", icon: History },
  { id: "advanced", label: "기타 설정", icon: ListChecks },
];

const mockActivityLogs = [
  {
    id: "log-1",
    action: "조직 설정 수정",
    actor: "김지훈",
    target: "결재 워크플로우",
    ip: "203.0.113.16",
    at: "2026-02-17 17:41",
    result: "성공",
  },
  {
    id: "log-2",
    action: "IP 허용 목록 변경",
    actor: "박민서",
    target: "허용 IP +1",
    ip: "198.51.100.5",
    at: "2026-02-17 15:12",
    result: "성공",
  },
  {
    id: "log-3",
    action: "권한 정책 변경 시도",
    actor: "이도윤",
    target: "2단계 인증 필수",
    ip: "203.0.113.221",
    at: "2026-02-16 09:20",
    result: "실패",
  },
  {
    id: "log-4",
    action: "세션 제한 시간 수정",
    actor: "김지훈",
    target: "8시간 → 4시간",
    ip: "203.0.113.16",
    at: "2026-02-15 11:03",
    result: "성공",
  },
];

export function OrganizationSettingsPage() {
  const currentOrg = useAuthStore((state) => state.currentMembership?.organization);
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const [orgName, setOrgName] = useState(currentOrg?.name ?? "Fabbit Design Team");
  const [slug, setSlug] = useState(currentOrg?.slug ?? "fabbit-design");
  const [timezone, setTimezone] = useState("Asia/Seoul");
  const [enforceSso, setEnforceSso] = useState(false);
  const [requireMfa, setRequireMfa] = useState(true);
  const [allowOutsideInvite, setAllowOutsideInvite] = useState(false);
  const [approvalRequired, setApprovalRequired] = useState(true);
  const [ipRestrictionEnabled, setIpRestrictionEnabled] = useState(true);
  const [allowedIps, setAllowedIps] = useState<AllowedIpEntry[]>([
    { id: "ip-1", cidr: "203.0.113.0/24" },
    { id: "ip-2", cidr: "198.51.100.18" },
    { id: "ip-3", cidr: "192.0.2.42" },
  ]);
  const [newIp, setNewIp] = useState("");

  const saveSettings = () => {
    toast.success("조직 설정을 저장했습니다. (목데이터)");
  };

  const addAllowedIp = () => {
    const trimmed = newIp.trim();
    if (!trimmed) return;
    if (allowedIps.some((entry) => entry.cidr === trimmed)) {
      toast.info("이미 추가된 IP입니다.");
      return;
    }
    setAllowedIps((prev) => [
      ...prev,
      {
        id: `ip-${Date.now()}`,
        cidr: trimmed,
      },
    ]);
    setNewIp("");
  };

  const removeAllowedIp = (id: string) => {
    setAllowedIps((prev) => prev.filter((value) => value.id !== id));
  };

  const logSummary = useMemo(() => {
    const success = mockActivityLogs.filter((log) => log.result === "성공").length;
    const failed = mockActivityLogs.length - success;
    return { success, failed };
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-foreground">조직 설정</h1>
            <p className="text-sm text-muted-foreground">
              {currentOrg?.name ?? "현재 조직"}의 보안 정책과 운영 설정을 관리합니다.
            </p>
          </div>
          <Button className="gap-2" onClick={saveSettings}>
            <Save className="h-4 w-4" />
            설정 저장
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-56 border-r border-border bg-muted/30 p-4">
          <nav className="space-y-1">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                  activeTab === tab.id
                    ? "bg-background font-medium text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="flex-1 overflow-auto p-6">
          {activeTab === "general" && (
            <div className="mx-auto max-w-3xl space-y-6">
              <div className="rounded-lg border border-border bg-card p-5">
                <h2 className="text-base font-semibold text-foreground">기본 정보</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">조직명</p>
                    <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">워크스페이스 슬러그</p>
                    <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <p className="text-sm text-muted-foreground">기본 시간대</p>
                    <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-5">
                <h2 className="text-base font-semibold text-foreground">초대 정책</h2>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">외부 도메인 사용자 초대 허용</p>
                      <p className="text-xs text-muted-foreground">비인가 도메인 초대를 허용할지 결정합니다.</p>
                    </div>
                    <Switch checked={allowOutsideInvite} onCheckedChange={setAllowOutsideInvite} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">멤버 초대 승인 필수</p>
                      <p className="text-xs text-muted-foreground">관리자 승인 후에만 초대가 확정됩니다.</p>
                    </div>
                    <Switch checked={approvalRequired} onCheckedChange={setApprovalRequired} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="mx-auto max-w-3xl space-y-6">
              <div className="rounded-lg border border-border bg-card p-5">
                <h2 className="text-base font-semibold text-foreground">접근 보안</h2>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">SSO 강제</p>
                      <p className="text-xs text-muted-foreground">일반 로그인 대신 조직 SSO 로그인만 허용합니다.</p>
                    </div>
                    <Switch checked={enforceSso} onCheckedChange={setEnforceSso} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">2단계 인증 필수</p>
                      <p className="text-xs text-muted-foreground">모든 멤버에게 MFA 등록을 요구합니다.</p>
                    </div>
                    <Switch checked={requireMfa} onCheckedChange={setRequireMfa} />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">IP 제한</h2>
                    <p className="text-xs text-muted-foreground">허용 목록 기반으로 접속 IP를 제한합니다.</p>
                  </div>
                  <Switch checked={ipRestrictionEnabled} onCheckedChange={setIpRestrictionEnabled} />
                </div>

                <div className="mt-4 flex gap-2">
                  <Input
                    placeholder="예: 203.0.113.0/24"
                    value={newIp}
                    onChange={(e) => setNewIp(e.target.value)}
                    disabled={!ipRestrictionEnabled}
                  />
                  <Button type="button" variant="outline" className="gap-1" onClick={addAllowedIp} disabled={!ipRestrictionEnabled}>
                    <Plus className="h-4 w-4" />
                    추가
                  </Button>
                </div>

                <div className="mt-3 overflow-hidden rounded-md border border-border">
                  <div className="grid grid-cols-[1fr_auto] bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
                    <p>허용 IP</p>
                    <p className="text-right">관리</p>
                  </div>
                  {allowedIps.map((entry) => (
                    <div key={entry.id} className="grid grid-cols-[1fr_auto] items-center border-t border-border px-3 py-2 text-sm">
                      <p className="font-mono text-xs text-foreground">{entry.cidr}</p>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="허용 IP 삭제"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => removeAllowedIp(entry.id)}
                          disabled={!ipRestrictionEnabled}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "logs" && (
            <div className="mx-auto max-w-5xl space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">성공 {logSummary.success}</Badge>
                <Badge variant="outline">실패 {logSummary.failed}</Badge>
                <p className="text-sm text-muted-foreground">최근 7일 활동 로그 (목데이터)</p>
              </div>

              <div className="overflow-hidden rounded-lg border border-border bg-card">
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
                    {mockActivityLogs.map((log) => (
                      <tr key={log.id} className="border-t border-border">
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
          )}

          {activeTab === "advanced" && (
            <div className="mx-auto max-w-3xl space-y-6">
              <div className="rounded-lg border border-border bg-card p-5">
                <h2 className="text-base font-semibold text-foreground">운영 정책</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-md border border-border p-4">
                    <p className="text-sm font-medium text-foreground">감사 로그 보관 기간</p>
                    <p className="mt-1 text-xs text-muted-foreground">기본값 180일</p>
                    <Badge variant="outline" className="mt-2">180일</Badge>
                  </div>
                  <div className="rounded-md border border-border p-4">
                    <p className="text-sm font-medium text-foreground">자동 비활성화 규칙</p>
                    <p className="mt-1 text-xs text-muted-foreground">90일 미접속 계정 비활성화</p>
                    <Badge variant="outline" className="mt-2">사용 중</Badge>
                  </div>
                  <div className="rounded-md border border-border p-4">
                    <p className="text-sm font-medium text-foreground">웹훅 이벤트 발행</p>
                    <p className="mt-1 text-xs text-muted-foreground">설정 변경 이벤트 외부 전송</p>
                    <Badge variant="outline" className="mt-2">준비 중</Badge>
                  </div>
                  <div className="rounded-md border border-border p-4">
                    <p className="text-sm font-medium text-foreground">프로비저닝 정책</p>
                    <p className="mt-1 text-xs text-muted-foreground">SCIM 기반 계정 동기화</p>
                    <Badge variant="outline" className="mt-2">Enterprise</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
