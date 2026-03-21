import { useQuery } from "@tanstack/react-query";
import { chatQueries } from "../api/chat.queries";

export function useChatMessagesQuery(threadId: string | null) {
  return useQuery({
    ...chatQueries.messages(threadId ?? ""),
    enabled: threadId !== null,
  });
}
