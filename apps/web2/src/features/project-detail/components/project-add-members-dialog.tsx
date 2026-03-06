import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  UserAvatar,
} from "@fabbit/ui";
import { useAddProjectMembersAction } from "@/features/project-detail/hooks/use-add-project-members-action";
import { useProjectMemberLookupQuery } from "@/features/project-detail/hooks/use-project-member-lookup-query";
import { useProjectDetailStore } from "@/features/project-detail/stores/project-detail-store";
import type { ProjectRole } from "@/features/project-detail/types/project-detail-model";

const roles: ProjectRole[] = ["ADMIN", "MEMBER", "VIEWER"];

interface ProjectAddMembersDialogProps {
  projectId: string;
}

export function ProjectAddMembersDialog({ projectId }: ProjectAddMembersDialogProps) {
  const isOpen = useProjectDetailStore((state) => state.isAddMemberDialogOpen);
  const memberLookupQuery = useProjectDetailStore((state) => state.memberLookupQuery);
  const selectedMemberIds = useProjectDetailStore((state) => state.selectedMemberIds);
  const selectedMemberRole = useProjectDetailStore((state) => state.selectedMemberRole);
  const setMemberLookupQuery = useProjectDetailStore((state) => state.setMemberLookupQuery);
  const toggleSelectedMember = useProjectDetailStore((state) => state.toggleSelectedMember);
  const setSelectedMemberRole = useProjectDetailStore((state) => state.setSelectedMemberRole);
  const resetMemberDialog = useProjectDetailStore((state) => state.resetMemberDialog);

  const [debouncedQuery, setDebouncedQuery] = useState(memberLookupQuery);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(memberLookupQuery.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [memberLookupQuery]);

  const membersLookup = useProjectMemberLookupQuery(
    projectId,
    {
      search: debouncedQuery || undefined,
      limit: 20,
    },
    isOpen,
  );
  const addProjectMembersAction = useAddProjectMembersAction(projectId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? undefined : resetMemberDialog())}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>프로젝트 멤버 추가</DialogTitle>
          <DialogDescription>워크스페이스 멤버를 검색하고 프로젝트 역할을 지정합니다.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="이름으로 멤버 검색"
                value={memberLookupQuery}
                onChange={(event) => setMemberLookupQuery(event.target.value)}
              />
            </div>

            <Select value={selectedMemberRole} onValueChange={(value) => setSelectedMemberRole(value as ProjectRole)}>
              <SelectTrigger>
                <SelectValue placeholder="역할 선택" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="max-h-[360px] space-y-2 overflow-y-auto rounded-lg border border-border/70 bg-muted/20 p-3">
            {membersLookup.isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : null}

            {!membersLookup.isLoading && (membersLookup.data?.length ?? 0) === 0 ? (
              <div className="flex h-40 items-center justify-center px-6 text-center text-sm leading-6 text-muted-foreground">
                검색 조건에 맞는 멤버가 없습니다.
              </div>
            ) : null}

            {membersLookup.data?.map((member) => (
              <label
                key={member.userId}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-border/70 bg-card px-4 py-3"
              >
                <Checkbox checked={selectedMemberIds.includes(member.userId)} onCheckedChange={() => toggleSelectedMember(member.userId)} />
                <UserAvatar imageUrl={member.profileImageUrl} name={member.fullName} />
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{member.fullName}</p>
                  <p className="truncate text-sm text-muted-foreground">{member.email}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={resetMemberDialog}>
            취소
          </Button>
          <Button
            disabled={selectedMemberIds.length === 0 || addProjectMembersAction.isPending}
            type="button"
            onClick={() =>
              addProjectMembersAction.mutate({
                userIds: selectedMemberIds,
                role: selectedMemberRole,
              })
            }
          >
            {addProjectMembersAction.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            선택한 멤버 추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
