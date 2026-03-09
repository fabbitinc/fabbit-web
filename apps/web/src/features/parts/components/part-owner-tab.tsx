import { PartOwnerTab as PartOwnerTabView } from "@fabbit/components";
import { usePartAssignableMembersQuery } from "@/features/parts/hooks/use-part-assignable-members-query";
import { usePartAssignableTeamsQuery } from "@/features/parts/hooks/use-part-assignable-teams-query";
import { usePartOwnerQuery } from "@/features/parts/hooks/use-part-owner-query";
import { useUpdatePartOwnerAction } from "@/features/parts/hooks/use-update-part-owner-action";

interface PartOwnerTabProps {
  partId: string;
}

export function PartOwnerTab({ partId }: PartOwnerTabProps) {
  const ownerQuery = usePartOwnerQuery(partId);
  const membersQuery = usePartAssignableMembersQuery();
  const teamsQuery = usePartAssignableTeamsQuery();
  const updatePartOwnerAction = useUpdatePartOwnerAction(partId);

  return (
    <PartOwnerTabView
      members={membersQuery.data ?? []}
      owner={
        ownerQuery.data
          ? {
              ownerId: ownerQuery.data.ownerId ?? null,
              ownerImageUrl: ownerQuery.data.owner?.profileImageUrl ?? null,
              ownerName: ownerQuery.data.owner?.fullName ?? null,
              ownerTeamId: ownerQuery.data.ownerTeamId ?? null,
              ownerTeamName: ownerQuery.data.ownerTeamName ?? null,
            }
          : null
      }
      teams={teamsQuery.data ?? []}
      isMembersLoading={membersQuery.isLoading}
      isOwnerLoading={ownerQuery.isLoading}
      isTeamsLoading={teamsQuery.isLoading}
      isUpdating={updatePartOwnerAction.isPending}
      onOwnerChange={(ownerId) => updatePartOwnerAction.mutate({ ownerId })}
      onOwnerTeamChange={(ownerTeamId) => updatePartOwnerAction.mutate({ ownerTeamId })}
    />
  );
}
