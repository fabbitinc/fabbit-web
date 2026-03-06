import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { changeSharedQueries } from "@/features/change-shared/api/change-shared.queries";
import type { ChangeRichTextMentionLookup } from "@/features/change-shared/types/change-rich-text-mention";

const MENTION_LOOKUP_LIMIT = 5;

export function useChangeRichTextMentionLogic(): ChangeRichTextMentionLookup {
  const queryClient = useQueryClient();

  const lookupMembers = useCallback<ChangeRichTextMentionLookup["lookupMembers"]>(
    async (query) => {
      const members = await queryClient.fetchQuery(
        changeSharedQueries.members({
          search: query || undefined,
          limit: MENTION_LOOKUP_LIMIT,
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

  const lookupIssues = useCallback<ChangeRichTextMentionLookup["lookupIssues"]>(
    async (query) => {
      const issues = await queryClient.fetchQuery(
        changeSharedQueries.issues({
          search: query || undefined,
          limit: MENTION_LOOKUP_LIMIT,
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

  return useMemo(
    () => ({
      lookupMembers,
      lookupIssues,
    }),
    [lookupIssues, lookupMembers],
  );
}
