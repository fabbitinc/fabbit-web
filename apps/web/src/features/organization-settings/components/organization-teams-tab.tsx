import { useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fabbit/ui";
import { ChevronDown, ChevronRight, Loader2, Plus, Trash2, UserMinus, UserPlus } from "lucide-react";
import { useCreateOrganizationTeamAction } from "@/features/organization-settings/hooks/use-create-organization-team-action";
import { useDeleteOrganizationTeamAction } from "@/features/organization-settings/hooks/use-delete-organization-team-action";
import { useAddOrganizationTeamMembersAction } from "@/features/organization-settings/hooks/use-add-organization-team-members-action";
import { useRemoveOrganizationTeamMembersAction } from "@/features/organization-settings/hooks/use-remove-organization-team-members-action";
import { useOrganizationMembersQuery } from "@/features/organization-settings/hooks/use-organization-members-query";
import { useOrganizationTeamMembersQuery } from "@/features/organization-settings/hooks/use-organization-team-members-query";
import { useOrganizationTeamsQuery } from "@/features/organization-settings/hooks/use-organization-teams-query";
import type {
  OrganizationMemberModel,
  OrganizationTeamModel,
} from "@/features/organization-settings/types/organization-settings-model";

export function OrganizationTeamsTab() {
  const teamsQuery = useOrganizationTeamsQuery();
  const membersQuery = useOrganizationMembersQuery();
  const deleteTeamAction = useDeleteOrganizationTeamAction();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">팀 관리</h2>
          <p className="mt-1 text-xs text-muted-foreground">팀을 만들고 조직 멤버를 그룹으로 관리합니다.</p>
        </div>
        <Button className="gap-1" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="size-4" />
          새 팀
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border/70 bg-card">
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col className="w-10" />
            <col className="w-[25%]" />
            <col />
            <col className="w-20" />
            <col className="w-28" />
            <col className="w-16" />
          </colgroup>
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-3">
                <span className="sr-only">펼치기</span>
              </th>
              <th className="px-4 py-3 text-left font-medium">이름</th>
              <th className="px-4 py-3 text-left font-medium">설명</th>
              <th className="px-4 py-3 text-left font-medium">멤버</th>
              <th className="px-4 py-3 text-left font-medium">생성일</th>
              <th className="px-4 py-3 text-center font-medium">삭제</th>
            </tr>
          </thead>
          <tbody>
            {(teamsQuery.data ?? []).map((team) => (
              <TeamRow
                key={team.id}
                isExpanded={expandedTeamId === team.id}
                orgMembers={membersQuery.data?.items ?? []}
                team={team}
                onDelete={() => deleteTeamAction.mutate(team.id)}
                onToggle={() => setExpandedTeamId((current) => (current === team.id ? null : team.id))}
              />
            ))}
            {(teamsQuery.data?.length ?? 0) === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-muted-foreground" colSpan={6}>
                  등록된 팀이 없습니다.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <CreateTeamDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}

function TeamRow({
  team,
  isExpanded,
  onToggle,
  onDelete,
  orgMembers,
}: {
  team: OrganizationTeamModel;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  orgMembers: OrganizationMemberModel[];
}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <tr className="border-t border-border/70 hover:bg-muted/20">
        <td className="px-4 py-3 text-muted-foreground">
          <button
            aria-label={`${team.name} 팀 ${isExpanded ? "접기" : "펼치기"}`}
            type="button"
            className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-muted hover:text-foreground"
            onClick={onToggle}
          >
            {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
        </td>
        <td className="px-4 py-3 font-medium text-foreground">{team.name}</td>
        <td className="px-4 py-3 text-muted-foreground">{team.description || "—"}</td>
        <td className="px-4 py-3">
          <Badge variant="secondary">{team.memberCount}명</Badge>
        </td>
        <td className="px-4 py-3 text-muted-foreground">{new Date(team.createdAt).toLocaleDateString("ko-KR")}</td>
        <td className="px-4 py-3 text-center">
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <button
              aria-label={`${team.name} 팀 삭제`}
              title={`${team.name} 팀 삭제`}
              type="button"
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={(event) => {
                event.stopPropagation();
                setIsDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="size-3.5" />
              <span className="sr-only">삭제</span>
            </button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>팀 삭제</AlertDialogTitle>
                <AlertDialogDescription>
                  &quot;{team.name}&quot; 팀을 삭제하시겠습니까? 소속 멤버 관계도 함께 제거됩니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>닫기</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    setIsDeleteDialogOpen(false);
                    onDelete();
                  }}
                >
                  삭제
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </td>
      </tr>

      {isExpanded ? (
        <tr>
          <td className="border-t border-border/70 bg-muted/10 px-6 py-4" colSpan={6}>
            <TeamMembersPanel orgMembers={orgMembers} teamId={team.id} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function CreateTeamDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createTeamAction = useCreateOrganizationTeamAction();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>새 팀 만들기</DialogTitle>
          <DialogDescription>팀 이름과 설명을 입력하세요.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="organization-team-name">팀 이름</Label>
            <Input
              id="organization-team-name"
              placeholder="예: 디자인팀"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="organization-team-description">설명</Label>
            <Input
              id="organization-team-description"
              placeholder="팀에 대한 간단한 설명"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button
            disabled={!name.trim() || createTeamAction.isPending}
            onClick={() =>
              createTeamAction.mutate(
                {
                  name: name.trim(),
                  description: description.trim() || undefined,
                },
                {
                  onSuccess: () => {
                    setName("");
                    setDescription("");
                    onOpenChange(false);
                  },
                },
              )
            }
          >
            {createTeamAction.isPending ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
            만들기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TeamMembersPanel({
  teamId,
  orgMembers,
}: {
  teamId: string;
  orgMembers: OrganizationMemberModel[];
}) {
  const teamMembersQuery = useOrganizationTeamMembersQuery(teamId);
  const addMembersAction = useAddOrganizationTeamMembersAction(teamId);
  const removeMembersAction = useRemoveOrganizationTeamMembersAction(teamId);
  const [selectedUserId, setSelectedUserId] = useState("");

  const teamMemberIds = useMemo(
    () => new Set((teamMembersQuery.data ?? []).map((member) => member.userId)),
    [teamMembersQuery.data],
  );
  const availableMembers = useMemo(
    () => orgMembers.filter((member) => !teamMemberIds.has(member.userId)),
    [orgMembers, teamMemberIds],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="멤버 선택..." />
          </SelectTrigger>
          <SelectContent>
            {availableMembers.map((member) => (
              <SelectItem key={member.userId} value={member.userId}>
                {member.fullName} ({member.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          className="gap-1"
          disabled={!selectedUserId || addMembersAction.isPending}
          size="sm"
          variant="outline"
          onClick={() =>
            addMembersAction.mutate([selectedUserId], {
              onSuccess: () => setSelectedUserId(""),
            })
          }
        >
          {addMembersAction.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <UserPlus className="size-3.5" />}
          추가
        </Button>
      </div>

      {(teamMembersQuery.data ?? []).length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-border/70">
          <div className="grid grid-cols-[1fr_1fr_auto] bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground">
            <p>이름</p>
            <p>이메일</p>
            <p className="text-right">제거</p>
          </div>
          {(teamMembersQuery.data ?? []).map((member) => (
            <div
              key={member.userId}
              className="grid grid-cols-[1fr_1fr_auto] items-center border-t border-border/70 px-4 py-2.5 text-sm"
            >
              <span className="font-medium text-foreground">{member.fullName}</span>
              <span className="text-muted-foreground">{member.email}</span>
              <div className="flex justify-end">
                <Button
                  aria-label={`${member.fullName} 팀 멤버 제거`}
                  disabled={removeMembersAction.isPending}
                  size="icon"
                  variant="ghost"
                  onClick={() => removeMembersAction.mutate([member.userId])}
                >
                  <UserMinus className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">팀에 소속된 멤버가 없습니다.</p>
      )}
    </div>
  );
}
