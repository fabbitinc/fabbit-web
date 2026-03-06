import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button, Input, Label } from "@fabbit/ui";
import { useAcceptInvitationAction } from "@/features/auth/hooks/use-accept-invitation-action";
import { useInvitationQuery } from "@/features/auth/hooks/use-invitation-query";
import { extractApiError } from "@/lib/api-error";

const ROLE_LABELS: Record<string, string> = {
  OWNER: "소유자",
  ADMIN: "관리자",
  MEMBER: "사용자",
  VIEWER: "뷰어",
};

export function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const invitationQuery = useInvitationQuery(token, Boolean(token));
  const acceptInvitationAction = useAcceptInvitationAction();
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const invitation = invitationQuery.data;
  const roleLabel = useMemo(
    () => (invitation ? ROLE_LABELS[invitation.role.toUpperCase()] ?? invitation.role : ""),
    [invitation],
  );

  const handleAccept = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setError("");

    if (!invitation || !token) {
      return;
    }

    if (!invitation.is_existing_user) {
      if (!fullName.trim()) {
        setError("이름을 입력해 주세요.");
        return;
      }

      if (password.length < 8) {
        setError("비밀번호는 8자 이상 입력해 주세요.");
        return;
      }

      if (password !== confirmPassword) {
        setError("비밀번호가 일치하지 않습니다.");
        return;
      }
    }

    try {
      const result = await acceptInvitationAction.mutateAsync({
        token,
        ...(invitation.is_existing_user ? {} : { fullName: fullName.trim(), password }),
      });

      window.location.href = result.redirectUrl;
    } catch (acceptError) {
      setError(extractApiError(acceptError, "초대 수락에 실패했습니다."));
    }
  };

  if (!token) {
    return (
      <section className="app-panel rounded-[32px] p-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">초대 링크가 올바르지 않습니다</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">URL에 토큰이 누락되어 있습니다.</p>
      </section>
    );
  }

  if (invitationQuery.isLoading) {
    return (
      <section className="app-panel flex min-h-[400px] items-center justify-center rounded-[32px] p-8">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          초대 정보를 확인하고 있습니다...
        </div>
      </section>
    );
  }

  if (invitationQuery.isError || !invitation) {
    return (
      <section className="app-panel rounded-[32px] p-8 text-center">
        <AlertCircle className="mx-auto size-9 text-destructive" />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">초대를 확인할 수 없습니다</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          초대 링크가 만료되었거나 더 이상 유효하지 않습니다.
        </p>
      </section>
    );
  }

  return (
    <section className="app-panel rounded-[32px] p-6 sm:p-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-muted-foreground">초대 수락</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">팀에 합류합니다</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          조직과 역할을 확인한 뒤 초대를 수락해 주세요.
        </p>
      </div>

      <div className="space-y-3 rounded-[24px] border border-border/70 bg-muted/35 p-5 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">조직</span>
          <span className="font-medium text-foreground">{invitation.org_name}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">초대자</span>
          <span className="font-medium text-foreground">{invitation.inviter_name}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">역할</span>
          <span className="font-medium text-foreground">{roleLabel}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">이메일</span>
          <span className="font-medium text-foreground">{invitation.email}</span>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {invitation.is_existing_user ? (
        <Button
          className="mt-8 h-12 w-full"
          disabled={acceptInvitationAction.isPending}
          onClick={() => void handleAccept()}
        >
          {acceptInvitationAction.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              수락 중...
            </>
          ) : (
            "초대 수락"
          )}
        </Button>
      ) : (
        <form className="mt-8 space-y-5" onSubmit={handleAccept}>
          <div className="space-y-2">
            <Label htmlFor="invite-name">이름</Label>
            <Input
              id="invite-name"
              className="h-12"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-password">비밀번호</Label>
            <div className="relative">
              <Input
                id="invite-password"
                className="h-12 pr-10"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                className="absolute right-3 top-1/2 text-muted-foreground"
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-confirm-password">비밀번호 확인</Label>
            <div className="relative">
              <Input
                id="invite-confirm-password"
                className="h-12 pr-10"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
              <button
                className="absolute right-3 top-1/2 text-muted-foreground"
                type="button"
                onClick={() => setShowConfirmPassword((previous) => !previous)}
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <Button className="h-12 w-full" disabled={acceptInvitationAction.isPending} type="submit">
            {acceptInvitationAction.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                수락 중...
              </>
            ) : (
              "계정 만들고 초대 수락"
            )}
          </Button>
        </form>
      )}
    </section>
  );
}
