import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Badge, Button, ConfirmDialog, UserAvatar } from "@fabbit/ui";
import { ProjectAddMembersDialog } from "@/features/project-detail/components/project-add-members-dialog";
import { useProjectMembersQuery } from "@/features/project-detail/hooks/use-project-members-query";
import { useRemoveProjectMembersAction } from "@/features/project-detail/hooks/use-remove-project-members-action";
import { useProjectDetailStore } from "@/features/project-detail/stores/project-detail-store";

const roleVariant = {
  ADMIN: "accent",
  MEMBER: "neutral",
  VIEWER: "outline",
} as const;

interface ProjectSettingsMembersTabProps {
  isReadonly: boolean;
  projectId: string;
}

export function ProjectSettingsMembersTab({ isReadonly, projectId }: ProjectSettingsMembersTabProps) {
  const openAddMemberDialog = useProjectDetailStore((state) => state.openAddMemberDialog);
  const membersQuery = useProjectMembersQuery(projectId);
  const removeProjectMembersAction = useRemoveProjectMembersAction(projectId);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const removingMember = useMemo(
    () => membersQuery.data?.find((member) => member.userId === removingUserId) ?? null,
    [membersQuery.data, removingUserId],
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-foreground">프로젝트 멤버</p>
          <p className="mt-1 text-sm text-muted-foreground">프로젝트 접근 권한을 가진 멤버를 관리합니다.</p>
        </div>
        <Button disabled={isReadonly} type="button" onClick={openAddMemberDialog}>
          <Plus className="size-4" />
          멤버 추가
        </Button>
      </div>

      <div className="space-y-3">
        {membersQuery.data?.map((member) => (
          <div
            key={member.userId}
            className="flex flex-col gap-3 rounded-lg border border-border/70 bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-3">
              <UserAvatar imageUrl={member.profileImageUrl} name={member.fullName} />
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{member.fullName}</p>
                <p className="truncate text-sm text-muted-foreground">{member.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={roleVariant[member.role]}>{member.role}</Badge>
              <Button
                disabled={isReadonly}
                size="sm"
                type="button"
                variant="ghost"
                onClick={() => setRemovingUserId(member.userId)}
              >
                <Trash2 className="size-4" />
                제거
              </Button>
            </div>
          </div>
        ))}

        {membersQuery.isLoading ? (
          <div className="rounded-lg border border-border/70 bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            멤버 목록을 불러오는 중입니다.
          </div>
        ) : null}

        {!membersQuery.isLoading && (membersQuery.data?.length ?? 0) === 0 ? (
          <div className="rounded-lg border border-border/70 bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            프로젝트 멤버가 없습니다.
          </div>
        ) : null}
      </div>

      <ProjectAddMembersDialog projectId={projectId} />

      <ConfirmDialog
        cancelLabel="취소"
        confirmLabel="멤버 제거"
        description={removingMember ? `${removingMember.fullName}님을 프로젝트에서 제거합니다.` : "선택한 멤버를 프로젝트에서 제거합니다."}
        open={Boolean(removingUserId)}
        title="프로젝트 멤버를 제거할까요?"
        variant="destructive"
        onCancel={() => setRemovingUserId(null)}
        onConfirm={() => {
          if (!removingUserId) {
            return;
          }

          removeProjectMembersAction.mutate([removingUserId], {
            onSuccess: () => setRemovingUserId(null),
          });
        }}
        onOpenChange={(open) => {
          if (!open) {
            setRemovingUserId(null);
          }
        }}
      />
    </section>
  );
}
