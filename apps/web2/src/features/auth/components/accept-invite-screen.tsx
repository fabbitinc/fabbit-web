import { useMemo, useState, type FormEvent } from "react";
import { AcceptInviteScreen as AcceptInviteScreenView } from "@fabbit/components";
import { useAcceptInvitationAction } from "@/features/auth/hooks/use-accept-invitation-action";
import { useInvitationQuery } from "@/features/auth/hooks/use-invitation-query";
import { extractApiError } from "@/lib/api-error";

const ROLE_LABELS: Record<string, string> = {
  OWNER: "소유자",
  ADMIN: "관리자",
  MEMBER: "사용자",
  VIEWER: "뷰어",
};

interface AcceptInviteScreenProps {
  token: string;
}

export function AcceptInviteScreen({ token }: AcceptInviteScreenProps) {
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
  const status = !token
    ? "missing-token"
    : invitationQuery.isLoading
      ? "loading"
      : invitationQuery.isError || !invitation
        ? "invalid"
        : "ready";

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

  return (
    <AcceptInviteScreenView
      confirmPassword={confirmPassword}
      errorMessage={error}
      fullName={fullName}
      invitation={
        status === "ready" && invitation
          ? {
              email: invitation.email,
              inviterName: invitation.inviter_name,
              isExistingUser: invitation.is_existing_user,
              organizationName: invitation.org_name,
              roleLabel,
            }
          : undefined
      }
      isSubmitting={acceptInvitationAction.isPending}
      password={password}
      showConfirmPassword={showConfirmPassword}
      showPassword={showPassword}
      status={status}
      onAcceptExistingUser={() => {
        void handleAccept();
      }}
      onConfirmPasswordChange={setConfirmPassword}
      onFullNameChange={setFullName}
      onPasswordChange={setPassword}
      onSubmit={(event) => {
        const submitEvent: FormEvent<HTMLFormElement> = event;
        void handleAccept(submitEvent);
      }}
      onToggleConfirmPasswordVisibility={() => setShowConfirmPassword((previous) => !previous)}
      onTogglePasswordVisibility={() => setShowPassword((previous) => !previous)}
    />
  );
}
