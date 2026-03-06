import { Mail, Trash2, X } from "lucide-react";
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
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  UserAvatar,
} from "@fabbit/ui";
import { useState } from "react";
import { useAuthStore } from "@/features/auth";
import { useCancelOrganizationInvitationAction } from "@/features/organization-settings/hooks/use-cancel-organization-invitation-action";
import { useChangeOrganizationMemberRoleAction } from "@/features/organization-settings/hooks/use-change-organization-member-role-action";
import { useCreateOrganizationInvitationAction } from "@/features/organization-settings/hooks/use-create-organization-invitation-action";
import { useOrganizationInvitationsQuery } from "@/features/organization-settings/hooks/use-organization-invitations-query";
import { useOrganizationMembersQuery } from "@/features/organization-settings/hooks/use-organization-members-query";
import { useRemoveOrganizationMemberAction } from "@/features/organization-settings/hooks/use-remove-organization-member-action";
import type { MemberRoleModel } from "@/features/organization-settings/types/organization-settings-model";

function getRoleBadge(role: string) {
  switch (role.toUpperCase()) {
    case "OWNER":
      return { label: "소유자", variant: "default" as const };
    case "ADMIN":
      return { label: "관리자", variant: "default" as const };
    default:
      return { label: "사용자", variant: "secondary" as const };
  }
}

function isManagerRole(role: string | undefined) {
  const normalizedRole = role?.toUpperCase();
  return normalizedRole === "ADMIN" || normalizedRole === "OWNER";
}

function canRemoveMember(
  currentRole: string | undefined,
  currentUserId: string | undefined,
  targetRole: string,
  targetUserId: string,
) {
  if (targetUserId === currentUserId) {
    return false;
  }

  const normalizedCurrentRole = currentRole?.toUpperCase();
  const normalizedTargetRole = targetRole.toUpperCase();

  if (normalizedCurrentRole === "OWNER") {
    return true;
  }

  if (normalizedCurrentRole === "ADMIN") {
    return normalizedTargetRole === "MEMBER";
  }

  return false;
}

export function OrganizationMembersUsersTab() {
  const currentUser = useAuthStore((state) => state.user);
  const currentRole = useAuthStore((state) => state.currentMembership?.role);
  const membersQuery = useOrganizationMembersQuery();
  const invitationsQuery = useOrganizationInvitationsQuery();
  const createInvitationAction = useCreateOrganizationInvitationAction();
  const cancelInvitationAction = useCancelOrganizationInvitationAction();
  const removeMemberAction = useRemoveOrganizationMemberAction();
  const changeMemberRoleAction = useChangeOrganizationMemberRoleAction();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<MemberRoleModel>("MEMBER");

  const pendingInvitations = (invitationsQuery.data ?? []).filter((invitation) => invitation.status === "PENDING");
  const memberCount = membersQuery.data?.items.length ?? 0;
  const maxMembers = membersQuery.data?.maxMembers ?? 0;
  const isAtLimit = maxMembers > 0 && memberCount >= maxMembers;
  const isOwner = currentRole?.toUpperCase() === "OWNER";

  return (
    <div className="space-y-6">
      {maxMembers > 0 ? (
        <div
          className={`flex items-center justify-between rounded-[24px] border px-4 py-3 ${
            isAtLimit ? "border-destructive/30 bg-destructive/5" : "border-border/70 bg-card"
          }`}
        >
          <div className="flex items-center gap-2">
            <Badge variant="secondary">플랜 기본</Badge>
            <span className="text-sm font-medium text-foreground">
              멤버 {memberCount} / {maxMembers}명
            </span>
          </div>
          {isAtLimit ? <p className="text-xs font-medium text-destructive">최대 인원에 도달했습니다.</p> : null}
        </div>
      ) : null}

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">사용자 초대</h2>
          <p className="mt-1 text-xs text-muted-foreground">이메일로 새 사용자를 초대합니다. 관리자 이상만 초대할 수 있습니다.</p>
        </div>
        <div className="flex flex-col gap-2 xl:flex-row">
          <Input
            className="flex-1"
            disabled={isAtLimit}
            placeholder="초대할 이메일 주소"
            type="email"
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && inviteEmail.trim()) {
                createInvitationAction.mutate(
                  {
                    email: inviteEmail.trim(),
                    role: inviteRole,
                  },
                  {
                    onSuccess: () => {
                      setInviteEmail("");
                      setInviteRole("MEMBER");
                    },
                  },
                );
              }
            }}
          />
          <Select disabled={isAtLimit} value={inviteRole} onValueChange={(value) => setInviteRole(value as MemberRoleModel)}>
            <SelectTrigger className="w-full xl:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MEMBER">사용자</SelectItem>
              <SelectItem value="ADMIN">관리자</SelectItem>
              <SelectItem value="OWNER">소유자</SelectItem>
            </SelectContent>
          </Select>
          <Button
            disabled={isAtLimit || !inviteEmail.trim() || createInvitationAction.isPending}
            onClick={() =>
              createInvitationAction.mutate(
                {
                  email: inviteEmail.trim(),
                  role: inviteRole,
                },
                {
                  onSuccess: () => {
                    setInviteEmail("");
                    setInviteRole("MEMBER");
                  },
                },
              )
            }
          >
            초대
          </Button>
        </div>
      </section>

      {pendingInvitations.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">대기 중인 초대</h2>
          <div className="overflow-hidden rounded-[24px] border border-border/70 bg-card">
            <div className="grid grid-cols-[1fr_100px_auto] bg-muted/40 px-4 py-3 text-xs font-medium text-muted-foreground">
              <p>이메일</p>
              <p>역할</p>
              <p className="text-right">관리</p>
            </div>
            {pendingInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="grid grid-cols-[1fr_100px_auto] items-center border-t border-border/70 px-4 py-2.5 text-sm"
              >
                <div className="flex items-center gap-2">
                  <Mail className="size-3.5 text-muted-foreground" />
                  <span className="text-foreground">{invitation.email}</span>
                </div>
                <Badge className="w-fit" variant="outline">
                  {getRoleBadge(invitation.role).label}
                </Badge>
                <div className="flex justify-end">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <X className="size-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>초대 취소</AlertDialogTitle>
                        <AlertDialogDescription>{invitation.email}에 대한 초대를 취소하시겠습니까?</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>닫기</AlertDialogCancel>
                        <AlertDialogAction onClick={() => cancelInvitationAction.mutate(invitation.id)}>
                          초대 취소
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">사용자 목록</h2>
          {membersQuery.data ? (
            <p className="text-xs text-muted-foreground">
              {membersQuery.data.items.length}
              {maxMembers > 0 ? ` / ${maxMembers}` : ""}명
            </p>
          ) : null}
        </div>
        <div className="overflow-hidden rounded-[24px] border border-border/70 bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">이름</th>
                <th className="px-4 py-3 text-left font-medium">이메일</th>
                <th className="px-4 py-3 text-left font-medium">직무</th>
                <th className="px-4 py-3 text-left font-medium">역할</th>
                {isManagerRole(currentRole) ? (
                  <th className="w-0 px-4 py-3">
                    <span className="sr-only">관리</span>
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {(membersQuery.data?.items ?? []).map((member) => (
                <tr key={member.userId} className="border-t border-border/70">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar className="h-7 w-7" imageUrl={member.profileImageUrl} name={member.fullName} />
                      <span className="font-medium text-foreground">{member.fullName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{member.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{member.jobRole ?? "—"}</td>
                  <td className="px-4 py-3">
                    {isOwner && member.userId !== currentUser?.id ? (
                      <Select
                        value={member.role}
                        onValueChange={(value) =>
                          changeMemberRoleAction.mutate({
                            userId: member.userId,
                            request: { role: value },
                          })
                        }
                      >
                        <SelectTrigger className="h-8 w-28 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MEMBER">사용자</SelectItem>
                          <SelectItem value="ADMIN">관리자</SelectItem>
                          <SelectItem value="OWNER">소유자</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={getRoleBadge(member.role).variant}>{getRoleBadge(member.role).label}</Badge>
                    )}
                  </td>
                  {isManagerRole(currentRole) ? (
                    <td className="px-4 py-3 text-center">
                      {canRemoveMember(currentRole, currentUser?.id, member.role, member.userId) ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button aria-label={`${member.fullName} 사용자 제거`} size="icon" variant="ghost">
                              <Trash2 className="size-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>사용자 제거</AlertDialogTitle>
                              <AlertDialogDescription>
                                {member.fullName}({member.email})을 조직에서 제거하시겠습니까?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>닫기</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeMemberAction.mutate(member.userId)}>
                                제거
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              ))}
              {(membersQuery.data?.items.length ?? 0) === 0 ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                    colSpan={isManagerRole(currentRole) ? 5 : 4}
                  >
                    등록된 사용자가 없습니다.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
