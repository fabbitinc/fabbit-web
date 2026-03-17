import { mutationOptions, queryOptions } from "@tanstack/react-query";
import {
  fetchSettings,
  toSettingsModel,
  updatePartsWorkflowPolicy,
} from "@/features/settings/api/settings.api";
import type { UpdatePartWorkflowPolicyRequest } from "@/features/settings/api/settings.types";

export const settingsKeys = {
  all: () => ["settings"] as const,
  detail: () => ["settings", "detail"] as const,
};

export const settingsQueries = {
  detail: () =>
    queryOptions({
      queryKey: settingsKeys.detail(),
      queryFn: async () => toSettingsModel(await fetchSettings()),
      staleTime: 300_000,
      gcTime: 900_000,
    }),
};

export const settingsMutations = {
  updatePartWorkflowPolicy: () =>
    mutationOptions({
      mutationKey: [...settingsKeys.all(), "update-part-workflow-policy"],
      mutationFn: async (request: UpdatePartWorkflowPolicyRequest) =>
        toSettingsModel(await updatePartsWorkflowPolicy(request)),
    }),
};
