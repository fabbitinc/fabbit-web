import { useQuery } from "@tanstack/react-query";
import { settingsQueries } from "@/features/settings/api/settings.queries";

export function useSettingsQuery() {
  return useQuery(settingsQueries.detail());
}
