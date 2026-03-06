import { useMemo, useState } from "react";
import { Check, ChevronDown, Loader2, User, UsersRound, X } from "lucide-react";
import { Input, Popover, PopoverContent, PopoverTrigger, UserAvatar } from "@fabbit/ui";
import { cn } from "@/lib/utils";
import { usePartAssignableMembersQuery } from "@/features/parts/hooks/use-part-assignable-members-query";
import { usePartAssignableTeamsQuery } from "@/features/parts/hooks/use-part-assignable-teams-query";
import { usePartOwnerQuery } from "@/features/parts/hooks/use-part-owner-query";
import { useUpdatePartOwnerAction } from "@/features/parts/hooks/use-update-part-owner-action";

interface MemberPickerProps {
  selectedMemberId: string | null;
  selectedMemberName: string | null;
  selectedMemberImageUrl: string | null;
  onSelect: (memberId: string | null) => void;
}

function MemberPicker({
  selectedMemberId,
  selectedMemberName,
  selectedMemberImageUrl,
  onSelect,
}: MemberPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const membersQuery = usePartAssignableMembersQuery(open);

  const filteredMembers = useMemo(() => {
    return (membersQuery.data ?? []).filter((member) => {
      if (!query.trim()) {
        return true;
      }

      const normalizedQuery = query.toLowerCase();
      return (
        member.fullName.toLowerCase().includes(normalizedQuery) ||
        member.email.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [membersQuery.data, query]);

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setQuery("");
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 w-full cursor-pointer items-center gap-2 rounded-xl border border-input bg-background px-3 text-sm hover:bg-muted"
        >
          {selectedMemberId ? (
            <>
              <UserAvatar className="h-5 w-5 shrink-0 text-[10px]" imageUrl={selectedMemberImageUrl} name={selectedMemberName ?? ""} />
              <span className="truncate">{selectedMemberName}</span>
            </>
          ) : (
            <span className="truncate text-muted-foreground">미지정</span>
          )}
          <ChevronDown className="ml-auto size-3.5 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-2">
        <Input
          className="mb-2 h-8"
          placeholder="이름 또는 이메일 검색"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="max-h-56 space-y-0.5 overflow-auto">
          {membersQuery.isLoading ? (
            <div className="flex justify-center py-3">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : null}
          {!membersQuery.isLoading && selectedMemberId ? (
            <button
              type="button"
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted"
              onClick={() => {
                onSelect(null);
                setOpen(false);
              }}
            >
              <X className="size-3.5" />
              선택 해제
            </button>
          ) : null}
          {!membersQuery.isLoading
            ? filteredMembers.map((member) => (
                <button
                  key={member.userId}
                  type="button"
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted",
                    member.userId === selectedMemberId ? "bg-muted font-medium" : "",
                  )}
                  onClick={() => {
                    onSelect(member.userId);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("size-3.5 shrink-0", member.userId === selectedMemberId ? "opacity-100" : "opacity-0")} />
                  <UserAvatar className="h-5 w-5 shrink-0 text-[10px]" imageUrl={member.profileImageUrl} name={member.fullName} />
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate">{member.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </button>
              ))
            : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface TeamPickerProps {
  selectedTeamId: string | null;
  selectedTeamName: string | null;
  onSelect: (teamId: string | null) => void;
}

function TeamPicker({ selectedTeamId, selectedTeamName, onSelect }: TeamPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const teamsQuery = usePartAssignableTeamsQuery(open);

  const filteredTeams = useMemo(() => {
    return (teamsQuery.data ?? []).filter((team) => {
      if (!query.trim()) {
        return true;
      }

      return team.name.toLowerCase().includes(query.toLowerCase());
    });
  }, [query, teamsQuery.data]);

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setQuery("");
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 w-full cursor-pointer items-center gap-2 rounded-xl border border-input bg-background px-3 text-sm hover:bg-muted"
        >
          <span className={cn("truncate", !selectedTeamId ? "text-muted-foreground" : "")}>
            {selectedTeamName ?? "미지정"}
          </span>
          <ChevronDown className="ml-auto size-3.5 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        <Input
          className="mb-2 h-8"
          placeholder="팀 검색"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="max-h-56 space-y-0.5 overflow-auto">
          {teamsQuery.isLoading ? (
            <div className="flex justify-center py-3">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : null}
          {!teamsQuery.isLoading && selectedTeamId ? (
            <button
              type="button"
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted"
              onClick={() => {
                onSelect(null);
                setOpen(false);
              }}
            >
              <X className="size-3.5" />
              선택 해제
            </button>
          ) : null}
          {!teamsQuery.isLoading
            ? filteredTeams.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted",
                    team.id === selectedTeamId ? "bg-muted font-medium" : "",
                  )}
                  onClick={() => {
                    onSelect(team.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("size-3.5", team.id === selectedTeamId ? "opacity-100" : "opacity-0")} />
                  <div className="min-w-0 text-left">
                    <p className="truncate">{team.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{team.memberCount}명</p>
                  </div>
                </button>
              ))
            : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface PartOwnerTabProps {
  partId: string;
}

export function PartOwnerTab({ partId }: PartOwnerTabProps) {
  const ownerQuery = usePartOwnerQuery(partId);
  const updatePartOwnerAction = useUpdatePartOwnerAction(partId);

  const owner = ownerQuery.data;

  return (
    <section className="app-panel rounded-lg p-4">
      <div>
        <p className="text-lg font-semibold text-foreground">담당</p>
        <p className="mt-1 text-sm text-muted-foreground">부품 담당자와 담당팀을 설정합니다.</p>
      </div>

      <div className="mt-4 overflow-hidden rounded-md border border-border/70">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-border/60">
              <td className="w-36 bg-muted/20 px-4 py-4">
                <div className="inline-flex items-center gap-2 text-foreground">
                  <User className="size-4 text-muted-foreground" />
                  담당자
                </div>
              </td>
              <td className="px-4 py-4">
                {ownerQuery.isLoading ? (
                  <p className="text-sm text-muted-foreground">담당자 정보를 불러오는 중입니다.</p>
                ) : (
                  <MemberPicker
                    selectedMemberId={owner?.ownerId ?? null}
                    selectedMemberName={owner?.owner?.fullName ?? null}
                    selectedMemberImageUrl={owner?.owner?.profileImageUrl ?? null}
                    onSelect={(memberId) => updatePartOwnerAction.mutate({ ownerId: memberId })}
                  />
                )}
              </td>
            </tr>
            <tr>
              <td className="w-36 bg-muted/20 px-4 py-4">
                <div className="inline-flex items-center gap-2 text-foreground">
                  <UsersRound className="size-4 text-muted-foreground" />
                  담당팀
                </div>
              </td>
              <td className="px-4 py-4">
                {ownerQuery.isLoading ? (
                  <p className="text-sm text-muted-foreground">담당팀 정보를 불러오는 중입니다.</p>
                ) : (
                  <TeamPicker
                    selectedTeamId={owner?.ownerTeamId ?? null}
                    selectedTeamName={owner?.ownerTeamName ?? null}
                    onSelect={(teamId) => updatePartOwnerAction.mutate({ ownerTeamId: teamId })}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
