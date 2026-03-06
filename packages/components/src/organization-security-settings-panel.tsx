import { Plus, Trash2 } from "lucide-react";
import { Badge, Button, Input, Switch } from "@fabbit/ui";

export interface OrganizationSecurityAllowedIp {
  id: string;
  cidr: string;
}

export interface OrganizationSecuritySettingsPanelProps {
  enforceSso: boolean;
  requireMfa: boolean;
  ipRestrictionEnabled: boolean;
  allowedIps: OrganizationSecurityAllowedIp[];
  newIp: string;
  onEnforceSsoChange: (checked: boolean) => void;
  onRequireMfaChange: (checked: boolean) => void;
  onIpRestrictionEnabledChange: (checked: boolean) => void;
  onNewIpChange: (value: string) => void;
  onAddAllowedIp: () => void;
  onRemoveAllowedIp: (id: string) => void;
}

export function OrganizationSecuritySettingsPanel({
  enforceSso,
  requireMfa,
  ipRestrictionEnabled,
  allowedIps,
  newIp,
  onEnforceSsoChange,
  onRequireMfaChange,
  onIpRestrictionEnabledChange,
  onNewIpChange,
  onAddAllowedIp,
  onRemoveAllowedIp,
}: OrganizationSecuritySettingsPanelProps) {
  const canAddAllowedIp = ipRestrictionEnabled && newIp.trim().length > 0;

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
            <Switch checked={enforceSso} onCheckedChange={onEnforceSsoChange} />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">2단계 인증 필수</p>
              <p className="text-xs text-muted-foreground">모든 사용자에게 MFA 등록을 요구합니다.</p>
            </div>
            <Switch checked={requireMfa} onCheckedChange={onRequireMfaChange} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">IP 제한</h2>
            <p className="mt-1 text-sm text-muted-foreground">허용 목록 기반 IP 제한 정책을 브라우저에 저장합니다.</p>
          </div>
          <Switch checked={ipRestrictionEnabled} onCheckedChange={onIpRestrictionEnabledChange} />
        </div>

        <div className="rounded-[24px] border border-border/70 bg-card p-4">
          <div className="flex gap-2">
            <Input
              disabled={!ipRestrictionEnabled}
              placeholder="예: 203.0.113.0/24"
              value={newIp}
              onChange={(event) => onNewIpChange(event.target.value)}
            />
            <Button className="gap-1" disabled={!canAddAllowedIp} variant="outline" onClick={onAddAllowedIp}>
              <Plus className="size-4" />
              추가
            </Button>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-border/70">
            <div className="grid grid-cols-[1fr_auto] bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
              <p>허용 IP</p>
              <p className="text-right">관리</p>
            </div>
            {allowedIps.map((entry) => (
              <div
                key={entry.id}
                className="grid grid-cols-[1fr_auto] items-center border-t border-border/70 px-3 py-2 text-sm"
              >
                <p className="font-mono text-xs text-foreground">{entry.cidr}</p>
                <div className="flex justify-end">
                  <Button
                    aria-label="허용 IP 제거"
                    disabled={!ipRestrictionEnabled}
                    size="icon"
                    variant="ghost"
                    onClick={() => onRemoveAllowedIp(entry.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            {allowedIps.length === 0 ? (
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
