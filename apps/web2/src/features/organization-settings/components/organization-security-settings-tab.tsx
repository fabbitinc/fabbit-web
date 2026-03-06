import { useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Input, Switch } from "@fabbit/ui";
import { Plus, Trash2 } from "lucide-react";
import { useOrganizationSettingsStore } from "@/features/organization-settings/stores/organization-settings-store";

export function OrganizationSecuritySettingsTab() {
  const security = useOrganizationSettingsStore((state) => state.security);
  const setSecurity = useOrganizationSettingsStore((state) => state.setSecurity);
  const addAllowedIp = useOrganizationSettingsStore((state) => state.addAllowedIp);
  const removeAllowedIp = useOrganizationSettingsStore((state) => state.removeAllowedIp);
  const [newIp, setNewIp] = useState("");

  function handleAddAllowedIp() {
    const nextValue = newIp.trim();
    if (!nextValue) {
      return;
    }

    addAllowedIp(nextValue);
    setNewIp("");
    toast.success("허용 IP를 추가했습니다.");
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">접근 보안</h2>
            <p className="mt-1 text-sm text-muted-foreground">보안 정책 API가 아직 없어 현재는 브라우저 로컬 정책으로 보관합니다.</p>
          </div>
          <Badge variant="secondary">로컬 설정</Badge>
        </div>

        <div className="space-y-4 rounded-[24px] border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">SSO 강제</p>
              <p className="text-xs text-muted-foreground">일반 로그인 대신 조직 SSO 로그인만 허용합니다.</p>
            </div>
            <Switch checked={security.enforceSso} onCheckedChange={(checked) => setSecurity({ enforceSso: checked })} />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">2단계 인증 필수</p>
              <p className="text-xs text-muted-foreground">모든 사용자에게 MFA 등록을 요구합니다.</p>
            </div>
            <Switch checked={security.requireMfa} onCheckedChange={(checked) => setSecurity({ requireMfa: checked })} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">IP 제한</h2>
            <p className="mt-1 text-sm text-muted-foreground">허용 목록 기반 IP 제한 정책을 브라우저에 저장합니다.</p>
          </div>
          <Switch
            checked={security.ipRestrictionEnabled}
            onCheckedChange={(checked) => setSecurity({ ipRestrictionEnabled: checked })}
          />
        </div>

        <div className="rounded-[24px] border border-border/70 bg-card p-4">
          <div className="flex gap-2">
            <Input
              disabled={!security.ipRestrictionEnabled}
              placeholder="예: 203.0.113.0/24"
              value={newIp}
              onChange={(event) => setNewIp(event.target.value)}
            />
            <Button
              className="gap-1"
              disabled={!security.ipRestrictionEnabled || !newIp.trim()}
              variant="outline"
              onClick={handleAddAllowedIp}
            >
              <Plus className="size-4" />
              추가
            </Button>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-border/70">
            <div className="grid grid-cols-[1fr_auto] bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
              <p>허용 IP</p>
              <p className="text-right">관리</p>
            </div>
            {security.allowedIps.map((entry) => (
              <div
                key={entry.id}
                className="grid grid-cols-[1fr_auto] items-center border-t border-border/70 px-3 py-2 text-sm"
              >
                <p className="font-mono text-xs text-foreground">{entry.cidr}</p>
                <div className="flex justify-end">
                  <Button
                    disabled={!security.ipRestrictionEnabled}
                    size="icon"
                    variant="ghost"
                    onClick={() => removeAllowedIp(entry.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            {security.allowedIps.length === 0 ? (
              <div className="border-t border-border/70 px-3 py-6 text-center text-sm text-muted-foreground">
                등록된 허용 IP가 없습니다.
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
