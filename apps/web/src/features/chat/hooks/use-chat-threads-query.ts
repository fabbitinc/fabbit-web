import { useQuery } from "@tanstack/react-query";
import { chatQueries } from "../api/chat.queries";

export function useChatThreadsQuery() {
  return useQuery(chatQueries.threads());
}
