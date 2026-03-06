import { useState } from "react";
import { Check, ChevronDown, Loader2, X } from "lucide-react";
import { Input, Popover, PopoverContent, PopoverTrigger, UserAvatar } from "@fabbit/ui";
import { cn } from "@/lib/utils";
import { useOrganizationMembersQuery } from "@/features/organization-settings/hooks/use-organization-members-query";
import { useOrganizationTeamsQuery } from "@/features/organization-settings/hooks/use-organization-teams-query";

interface TeamPickerPopoverProps {
  selectedTeamId: string | null;
  selectedTeamName: string | null;
  onSelect: (teamId: string | null) => void;
}

export function TeamPickerPopover({
  selectedTeamId,
  selectedTeamName,
  onSelect,
}: TeamPickerPopoverProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const teamsQuery = useOrganizationTeamsQuery({ enabled: open });

  const filteredTeams = (teamsQuery.data ?? []).filter((team) => {
    if (!query.trim()) {
      return true;
    }

    return team.name.toLowerCase().includes(query.toLowerCase());
  });

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
          className="inline-flex h-9 w-44 items-center rounded-xl border border-input bg-background px-3 text-sm hover:bg-muted"
          type="button"
        >
          <span className={cn("truncate", !selectedTeamId ? "text-muted-foreground" : "")}>
            {selectedTeamName ?? "팀 선택"}
          </span>
          <ChevronDown className="ml-auto size-3.5 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-2">
        <Input
          className="mb-2 h-8"
          placeholder="팀 검색"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="max-h-48 space-y-0.5 overflow-auto">
          {teamsQuery.isLoading ? (
            <div className="flex justify-center py-3">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : null}

          {!teamsQuery.isLoading && selectedTeamId ? (
            <button
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted"
              type="button"
              onClick={() => {
                onSelect(null);
                setOpen(false);
              }}
            >
              <X className="size-3.5" />
              선택 해제
            </button>
          ) : null}

          {!teamsQuery.isLoading &&
            filteredTeams.map((team) => (
              <button
                key={team.id}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted",
                  team.id === selectedTeamId ? "bg-muted font-medium" : "",
                )}
                type="button"
                onClick={() => {
                  onSelect(team.id);
                  setOpen(false);
                }}
              >
                <Check className={cn("size-3.5", team.id === selectedTeamId ? "opacity-100" : "opacity-0")} />
                {team.name}
              </button>
            ))}

          {!teamsQuery.isLoading && filteredTeams.length === 0 ? (
            <p className="px-2 py-2 text-xs text-muted-foreground">검색 결과가 없습니다.</p>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface MemberPickerPopoverProps {
  selectedMemberId: string | null;
  selectedMemberName?: string | null;
  onSelect: (memberId: string | null) => void;
}

export function MemberPickerPopover({
  selectedMemberId,
  selectedMemberName,
  onSelect,
}: MemberPickerPopoverProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const membersQuery = useOrganizationMembersQuery({ enabled: open });

  const filteredMembers = (membersQuery.data?.items ?? []).filter((member) => {
    if (!query.trim()) {
      return true;
    }

    const normalizedQuery = query.toLowerCase();
    return (
      member.fullName.toLowerCase().includes(normalizedQuery) ||
      member.email.toLowerCase().includes(normalizedQuery)
    );
  });

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
          className="inline-flex h-9 w-44 items-center rounded-xl border border-input bg-background px-3 text-sm hover:bg-muted"
          type="button"
        >
          <span className={cn("truncate", !selectedMemberId ? "text-muted-foreground" : "")}>
            {selectedMemberName ?? "미지정"}
          </span>
          <ChevronDown className="ml-auto size-3.5 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        <Input
          className="mb-2 h-8"
          placeholder="이름 또는 이메일 검색"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="max-h-48 space-y-0.5 overflow-auto">
          {membersQuery.isLoading ? (
            <div className="flex justify-center py-3">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : null}

          {!membersQuery.isLoading && selectedMemberId ? (
            <button
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted"
              type="button"
              onClick={() => {
                onSelect(null);
                setOpen(false);
              }}
            >
              <X className="size-3.5" />
              선택 해제
            </button>
          ) : null}

          {!membersQuery.isLoading &&
            filteredMembers.map((member) => (
              <button
                key={member.userId}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted",
                  member.userId === selectedMemberId ? "bg-muted font-medium" : "",
                )}
                type="button"
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
            ))}

          {!membersQuery.isLoading && filteredMembers.length === 0 ? (
            <p className="px-2 py-2 text-xs text-muted-foreground">검색 결과가 없습니다.</p>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
