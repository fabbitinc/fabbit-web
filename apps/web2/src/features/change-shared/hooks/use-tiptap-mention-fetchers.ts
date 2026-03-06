import { useCallback } from "react";
import type { TiptapMentionFetcher } from "@fabbit/ui";
import { useChangeRichTextMentionLogic } from "./use-change-rich-text-mention-logic";

export function useTiptapMentionFetchers() {
  const mentionLogic = useChangeRichTextMentionLogic();

  const userMentionFetcher: TiptapMentionFetcher = useCallback(
    async (query: string) => mentionLogic.lookupMembers(query),
    [mentionLogic],
  );

  const issueMentionFetcher: TiptapMentionFetcher = useCallback(
    async (query: string) => mentionLogic.lookupIssues(query),
    [mentionLogic],
  );

  return { userMentionFetcher, issueMentionFetcher };
}
