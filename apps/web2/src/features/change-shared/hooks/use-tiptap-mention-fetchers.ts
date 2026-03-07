import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { TiptapMentionFetcher } from "@fabbit/ui";
import { changeSharedQueries } from "@/features/change-shared/api/change-shared.queries";

export function useTiptapMentionFetchers() {
  const queryClient = useQueryClient();

  const userMentionFetcher: TiptapMentionFetcher = useCallback(
    async (query: string, limit: number) => {
      const members = await queryClient.fetchQuery(
        changeSharedQueries.members({
          search: query || undefined,
          limit,
        }),
      );

      return members.map((member) => ({
        id: member.userId,
        label: member.fullName,
        profileImageUrl: member.profileImageUrl,
      }));
    },
    [queryClient],
  );

  const issueMentionFetcher: TiptapMentionFetcher = useCallback(
    async (query: string, limit: number) => {
      const issues = await queryClient.fetchQuery(
        changeSharedQueries.issues({
          search: query || undefined,
          limit,
        }),
      );

      return issues.map((issue) => ({
        id: issue.id,
        label: issue.title,
        number: issue.number,
        state: issue.state,
        issueType: issue.type,
      }));
    },
    [queryClient],
  );

  return { userMentionFetcher, issueMentionFetcher };
}
