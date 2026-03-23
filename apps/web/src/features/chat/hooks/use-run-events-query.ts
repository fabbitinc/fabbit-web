import { useQuery } from "@tanstack/react-query";
import { chatQueries } from "../api/chat.queries";

export function useRunEventsQuery(runId: string | null) {
  return useQuery({
    ...chatQueries.runEvents(runId ?? ""),
    enabled: runId !== null && runId !== "",
  });
}
