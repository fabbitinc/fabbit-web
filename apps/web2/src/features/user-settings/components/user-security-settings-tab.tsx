import { useState } from "react";
import { Badge, Button, Input, Label, Switch } from "@fabbit/ui";
import { Loader2, Shield } from "lucide-react";
import { useChangePasswordAction } from "@/features/user-settings/hooks/use-change-password-action";
import { useUserSettingsStore } from "@/features/user-settings/stores/user-settings-store";

export function UserSecuritySettingsTab() {
  const security = useUserSettingsStore((state) => state.security);
  const setSecurity = useUserSettingsStore((state) => state.setSecurity);
  const changePasswordAction = useChangePasswordAction();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isPasswordInvalid = newPassword.length > 0 && newPassword !== confirmPassword;

  function handlePasswordChange() {
    if (!currentPassword || !newPassword || isPasswordInvalid) {
      return;
    }

    changePasswordAction.mutate(
      {
        currentPassword,
        newPassword,
      },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
      },
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">비밀번호 변경</h2>
            <p className="mt-1 text-sm text-muted-foreground">기존 비밀번호를 확인한 뒤 새 비밀번호로 교체합니다.</p>
          </div>
          <Badge variant="info">서버 연동</Badge>
        </div>

        <div className="grid gap-4 rounded-lg border border-border/70 bg-card p-4">
          <div className="space-y-2">
            <Label htmlFor="user-current-password">현재 비밀번호</Label>
            <Input
              id="user-current-password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-new-password">새 비밀번호</Label>
            <Input
              id="user-new-password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-confirm-password">새 비밀번호 확인</Label>
            <Input
              id="user-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            {isPasswordInvalid ? <p className="text-xs text-destructive">새 비밀번호가 일치하지 않습니다.</p> : null}
          </div>
          <div className="flex justify-end">
            <Button
              disabled={!currentPassword || !newPassword || !confirmPassword || isPasswordInvalid || changePasswordAction.isPending}
              onClick={handlePasswordChange}
            >
              {changePasswordAction.isPending ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
              비밀번호 변경
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">로그인 보안</h2>
            <p className="mt-1 text-sm text-muted-foreground">서버 계약이 아직 없는 항목은 로컬 설정으로 유지합니다.</p>
          </div>
          <Badge variant="secondary">로컬 설정</Badge>
        </div>

        <div className="space-y-4 rounded-lg border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
                <Shield className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">2단계 인증</p>
                <p className="text-xs text-muted-foreground">OTP 또는 인증 앱을 통한 추가 인증을 요구합니다.</p>
              </div>
            </div>
            <Switch
              checked={security.mfaEnabled}
              onCheckedChange={(checked) => setSecurity({ mfaEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">새 기기 로그인 알림</p>
              <p className="text-xs text-muted-foreground">새 브라우저 로그인 시 즉시 알림을 표시합니다.</p>
            </div>
            <Switch
              checked={security.loginAlertEnabled}
              onCheckedChange={(checked) => setSecurity({ loginAlertEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">세션 보호 강화</p>
              <p className="text-xs text-muted-foreground">민감 작업 전에 재인증을 요구합니다.</p>
            </div>
            <Switch
              checked={security.sessionProtection}
              onCheckedChange={(checked) => setSecurity({ sessionProtection: checked })}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
