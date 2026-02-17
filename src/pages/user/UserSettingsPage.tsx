import { useState, type ComponentType } from "react";
import { User, Shield, Bell, Palette, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";

type UserSettingsTab = "profile" | "security" | "notifications" | "preferences";

const tabs: Array<{ id: UserSettingsTab; label: string; icon: ComponentType<{ className?: string }> }> = [
  { id: "profile", label: "프로필", icon: User },
  { id: "security", label: "보안", icon: Shield },
  { id: "notifications", label: "알림", icon: Bell },
  { id: "preferences", label: "개인화", icon: Palette },
];

export function UserSettingsPage() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<UserSettingsTab>("profile");

  const [name, setName] = useState(user?.name ?? "홍길동");
  const [email, setEmail] = useState(user?.email ?? "hong@example.com");
  const [phone, setPhone] = useState("010-1234-5678");
  const [department, setDepartment] = useState("제품기획팀");

  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [loginAlertEnabled, setLoginAlertEnabled] = useState(true);
  const [sessionProtection, setSessionProtection] = useState(true);

  const [emailNotification, setEmailNotification] = useState(true);
  const [mentionNotification, setMentionNotification] = useState(true);
  const [digestNotification, setDigestNotification] = useState(false);

  const [compactMode, setCompactMode] = useState(false);
  const [autoSaveDraft, setAutoSaveDraft] = useState(true);

  const handleSave = () => {
    toast.success("사용자 설정을 저장했습니다. (목데이터)");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-foreground">사용자 설정</h1>
            <p className="text-sm text-muted-foreground">내 계정 정보와 알림/보안 설정을 관리합니다.</p>
          </div>
          <Button className="gap-2" onClick={handleSave}>
            <Save className="h-4 w-4" />
            설정 저장
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-56 border-r border-border bg-muted/30 p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => (
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
          {activeTab === "profile" && (
            <div className="mx-auto max-w-3xl space-y-6">
              <div className="rounded-lg border border-border bg-card p-5">
                <h2 className="text-base font-semibold text-foreground">기본 프로필</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">이름</p>
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">이메일</p>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">연락처</p>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">부서</p>
                    <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-5">
                <h2 className="text-base font-semibold text-foreground">계정 상태</h2>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="secondary">활성 상태</Badge>
                  <Badge variant="outline">최근 로그인 2026-02-18 09:12</Badge>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="mx-auto max-w-3xl space-y-6">
              <div className="rounded-lg border border-border bg-card p-5">
                <h2 className="text-base font-semibold text-foreground">로그인 보안</h2>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">2단계 인증</p>
                      <p className="text-xs text-muted-foreground">OTP 또는 인증 앱으로 추가 인증을 수행합니다.</p>
                    </div>
                    <Switch checked={mfaEnabled} onCheckedChange={setMfaEnabled} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">새 기기 로그인 알림</p>
                      <p className="text-xs text-muted-foreground">신규 브라우저 로그인 시 메일 알림을 전송합니다.</p>
                    </div>
                    <Switch checked={loginAlertEnabled} onCheckedChange={setLoginAlertEnabled} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">세션 보호 강화</p>
                      <p className="text-xs text-muted-foreground">민감 작업 전에 재인증을 요구합니다.</p>
                    </div>
                    <Switch checked={sessionProtection} onCheckedChange={setSessionProtection} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="mx-auto max-w-3xl space-y-6">
              <div className="rounded-lg border border-border bg-card p-5">
                <h2 className="text-base font-semibold text-foreground">알림 채널</h2>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">이메일 알림</p>
                      <p className="text-xs text-muted-foreground">중요 공지, 보안 이벤트 메일 수신</p>
                    </div>
                    <Switch checked={emailNotification} onCheckedChange={setEmailNotification} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">멘션 알림</p>
                      <p className="text-xs text-muted-foreground">댓글/작업에서 @멘션된 경우 즉시 알림</p>
                    </div>
                    <Switch checked={mentionNotification} onCheckedChange={setMentionNotification} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">일일 요약 리포트</p>
                      <p className="text-xs text-muted-foreground">하루 활동 요약을 오전 9시에 수신</p>
                    </div>
                    <Switch checked={digestNotification} onCheckedChange={setDigestNotification} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="mx-auto max-w-3xl space-y-6">
              <div className="rounded-lg border border-border bg-card p-5">
                <h2 className="text-base font-semibold text-foreground">사용 환경</h2>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">컴팩트 모드</p>
                      <p className="text-xs text-muted-foreground">리스트/테이블 행 간격을 줄여 표시합니다.</p>
                    </div>
                    <Switch checked={compactMode} onCheckedChange={setCompactMode} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">작성 중 자동 저장</p>
                      <p className="text-xs text-muted-foreground">폼 입력 중 임시 저장을 자동으로 수행합니다.</p>
                    </div>
                    <Switch checked={autoSaveDraft} onCheckedChange={setAutoSaveDraft} />
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
