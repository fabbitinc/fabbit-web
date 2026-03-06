import type { FormEventHandler } from "react";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button, Input, Label } from "@fabbit/ui";
import { OnboardingScreenShell } from "./onboarding-screen-shell";

export type AcceptInviteScreenStatus = "missing-token" | "loading" | "invalid" | "ready";

export interface AcceptInviteScreenInvitation {
  organizationName: string;
  inviterName: string;
  roleLabel: string;
  email: string;
  isExistingUser: boolean;
}

export interface AcceptInviteScreenProps {
  status: AcceptInviteScreenStatus;
  invitation?: AcceptInviteScreenInvitation;
  fullName: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  errorMessage?: string;
  isSubmitting?: boolean;
  onAcceptExistingUser: () => void;
  onConfirmPasswordChange: (value: string) => void;
  onFullNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onToggleConfirmPasswordVisibility: () => void;
  onTogglePasswordVisibility: () => void;
}

export function AcceptInviteScreen({
  status,
  invitation,
  fullName,
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  errorMessage,
  isSubmitting = false,
  onAcceptExistingUser,
  onConfirmPasswordChange,
  onFullNameChange,
  onPasswordChange,
  onSubmit,
  onToggleConfirmPasswordVisibility,
  onTogglePasswordVisibility,
}: AcceptInviteScreenProps) {
  if (status === "missing-token") {
    return (
      <section className="rounded-lg border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">초대 링크가 올바르지 않습니다</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">URL에 토큰이 누락되어 있습니다.</p>
      </section>
    );
  }

  if (status === "loading") {
    return (
      <section className="flex min-h-[400px] items-center justify-center rounded-lg border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          초대 정보를 확인하고 있습니다...
        </div>
      </section>
    );
  }

  if (status === "invalid" || !invitation) {
    return (
      <section className="rounded-lg border bg-card p-8 text-center shadow-sm">
        <AlertCircle className="mx-auto h-9 w-9 text-destructive" />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">초대를 확인할 수 없습니다</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          초대 링크가 만료되었거나 더 이상 유효하지 않습니다.
        </p>
      </section>
    );
  }

  return (
    <OnboardingScreenShell
      description="아래 조직에 초대되었습니다. 초대를 수락하고 시작하세요."
      eyebrow="초대 수락"
      errorMessage={errorMessage}
      title="팀에 합류하세요"
    >
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
          <span className="text-sm text-muted-foreground">조직</span>
          <span className="text-sm font-medium text-foreground">{invitation.organizationName}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
          <span className="text-sm text-muted-foreground">초대자</span>
          <span className="text-sm font-medium text-foreground">{invitation.inviterName}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
          <span className="text-sm text-muted-foreground">역할</span>
          <span className="text-sm font-medium text-foreground">{invitation.roleLabel}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
          <span className="text-sm text-muted-foreground">이메일</span>
          <span className="text-sm font-medium text-foreground">{invitation.email}</span>
        </div>
      </div>

      {invitation.isExistingUser ? (
        <Button className="h-12 w-full bg-blue-600 text-base font-semibold hover:bg-blue-700" disabled={isSubmitting} onClick={onAcceptExistingUser}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              수락 중...
            </>
          ) : (
            "초대 수락"
          )}
        </Button>
      ) : (
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="invite-name">이름</Label>
            <Input
              id="invite-name"
              className="h-12"
              value={fullName}
              onChange={(event) => onFullNameChange(event.target.value)}
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
                onChange={(event) => onPasswordChange(event.target.value)}
              />
              <button
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                className="absolute right-3 top-1/2 cursor-pointer text-muted-foreground"
                type="button"
                onClick={onTogglePasswordVisibility}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                onChange={(event) => onConfirmPasswordChange(event.target.value)}
              />
              <button
                aria-label={showConfirmPassword ? "비밀번호 확인 숨기기" : "비밀번호 확인 보기"}
                className="absolute right-3 top-1/2 cursor-pointer text-muted-foreground"
                type="button"
                onClick={onToggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button className="h-12 w-full bg-blue-600 text-base font-semibold hover:bg-blue-700" disabled={isSubmitting} type="submit">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                수락 중...
              </>
            ) : (
              "계정 만들고 초대 수락"
            )}
          </Button>
        </form>
      )}
    </OnboardingScreenShell>
  );
}
