import { useMemo, useState, type ComponentType } from "react";
import { ShieldCheck, Building2, ListChecks, History, Tag, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuthStore } from "@/stores/authStore";
import { COLOR_PRESETS, ORG_DEFAULT_LABELS } from "@/constants/labelConfig";
import type { ChangeLabel } from "@/pages/projects/changeRequestMock";

type SettingsTab = "general" | "security" | "labels" | "logs" | "advanced";

interface AllowedIpEntry {
  id: string;
  cidr: string;
}

const settingsTabs: Array<{ id: SettingsTab; label: string; icon: ComponentType<{ className?: string }> }> = [
  { id: "general", label: "일반", icon: Building2 },
  { id: "security", label: "보안", icon: ShieldCheck },
  { id: "labels", label: "라벨", icon: Tag },
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

  const orgName = currentOrg?.name ?? "Fabbit Design Team";
  const slug = currentOrg?.slug ?? "fabbit-design";
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

  // 라벨 탭 상태
  const [orgLabels, setOrgLabels] = useState<ChangeLabel[]>(ORG_DEFAULT_LABELS);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState<ChangeLabel["color"]>(COLOR_PRESETS[0].value);

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
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-foreground">조직 설정</h1>
        <p className="text-sm text-muted-foreground">
          {currentOrg?.name ?? "현재 조직"}의 보안 정책과 운영 설정을 관리합니다.
        </p>
      </div>

      <div className="flex gap-0 rounded-lg border border-border bg-card">
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
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-foreground">기본 정보</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">조직명</p>
                    <Input value={orgName} disabled />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">워크스페이스 슬러그</p>
                    <Input value={slug} disabled />
                  </div>
                </div>
              </div>

              <div>
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

              <div className="flex justify-end">
                <Button onClick={saveSettings}>저장</Button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
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

              <div>
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

          {activeTab === "labels" && (
            <div className="space-y-6">
              {/* 라벨 추가 */}
              <div>
                <h2 className="text-base font-semibold text-foreground">새 라벨 추가</h2>
                <div className="mt-3 space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="라벨 이름"
                      value={newLabelName}
                      onChange={(e) => setNewLabelName(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      className="gap-1"
                      onClick={() => {
                        const trimmed = newLabelName.trim();
                        if (!trimmed) return;
                        if (orgLabels.some((l) => l.name === trimmed)) {
                          toast.info("이미 존재하는 라벨입니다.");
                          return;
                        }
                        setOrgLabels((prev) => [...prev, { name: trimmed, color: newLabelColor }]);
                        setNewLabelName("");
                        toast.success(`"${trimmed}" 라벨을 추가했습니다.`);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      추가
                    </Button>
                  </div>
                  {/* 색상 팔레트 */}
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => setNewLabelColor(preset.value)}
                        className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors ${
                          newLabelColor === preset.value
                            ? "border-foreground/30 bg-muted font-medium"
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <span className={`inline-block h-3 w-3 rounded-full ${preset.value.split(" ")[0]}`} />
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  {/* 미리보기 */}
                  {newLabelName.trim() && (
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">미리보기:</p>
                      <Badge variant="secondary" className={newLabelColor}>
                        {newLabelName.trim()}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* 라벨 목록 */}
              <div>
                <h2 className="text-base font-semibold text-foreground">라벨 목록</h2>
                <div className="mt-3 space-y-2">
                  {orgLabels.map((label) => (
                    <div
                      key={label.name}
                      className="flex items-center gap-3 rounded-md border border-border px-4 py-2.5"
                    >
                      <Badge variant="secondary" className={label.color}>
                        {label.name}
                      </Badge>
                      <span className="flex-1" />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>라벨을 영구 삭제</AlertDialogTitle>
                            <AlertDialogDescription className="space-y-2">
                              <p>이 라벨을 삭제하면 다시 복구할 수 없습니다.</p>
                              <p>삭제 시 모든 이슈 및 변경 요청에서 해당 라벨이 제거됩니다.</p>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => {
                                setOrgLabels((prev) => prev.filter((l) => l.name !== label.name));
                                toast.success(`"${label.name}" 라벨을 삭제했습니다.`);
                              }}
                            >
                              라벨 삭제
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                  {orgLabels.length === 0 && (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      등록된 라벨이 없습니다.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "logs" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">성공 {logSummary.success}</Badge>
                <Badge variant="outline">실패 {logSummary.failed}</Badge>
                <p className="text-sm text-muted-foreground">최근 7일 활동 로그 (목데이터)</p>
              </div>

              <div className="overflow-hidden rounded-md border border-border">
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
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-foreground">운영 정책</h2>
              <div className="grid gap-4 md:grid-cols-2">
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
          )}
        </section>
      </div>
    </div>
  );
}
