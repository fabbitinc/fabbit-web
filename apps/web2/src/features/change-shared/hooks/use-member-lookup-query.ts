import { useQuery } from "@tanstack/react-query";
import { changeSharedQueries } from "@/features/change-shared/api/change-shared.queries";
import type { MemberLookupQueryDto } from "@/features/change-shared/api/change-shared.types";

export function useMemberLookupQuery(query: MemberLookupQueryDto, enabled: boolean) {
  return useQuery({
    ...changeSharedQueries.members(query),
    enabled,
  });
}
