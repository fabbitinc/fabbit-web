import { useState } from "react";
import { Button, Input, Label } from "@fabbit/ui";
import { Loader2 } from "lucide-react";
import { useChangePasswordAction } from "@/features/user-settings/hooks/use-change-password-action";

export function UserSecuritySettingsTab() {
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
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">비밀번호 변경</h2>
        <p className="mt-1 text-sm text-muted-foreground">기존 비밀번호를 확인한 뒤 새 비밀번호로 교체합니다.</p>
      </div>

      <div className="grid gap-4">
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
    </div>
  );
}
