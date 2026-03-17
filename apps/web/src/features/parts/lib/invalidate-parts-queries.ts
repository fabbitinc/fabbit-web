import type { QueryClient } from "@tanstack/react-query";
import { partsKeys } from "@/features/parts/api/parts.queries";

interface InvalidatePartsQueriesOptions {
  includeList?: boolean;
}

export async function invalidatePartsQueries(
  queryClient: QueryClient,
  partId?: string,
  options?: InvalidatePartsQueriesOptions,
) {
  const tasks: Promise<unknown>[] = [];

  if (options?.includeList) {
    tasks.push(queryClient.invalidateQueries({ queryKey: partsKeys.lists() }));
  }

  if (partId) {
    tasks.push(
      queryClient.invalidateQueries({ queryKey: partsKeys.detail(partId) }),
      queryClient.invalidateQueries({ queryKey: partsKeys.bom(partId) }),
      queryClient.invalidateQueries({ queryKey: partsKeys.files(partId) }),
      queryClient.invalidateQueries({ queryKey: partsKeys.previewSources(partId) }),
      queryClient.invalidateQueries({ queryKey: partsKeys.projects(partId) }),
      queryClient.invalidateQueries({ queryKey: partsKeys.suppliers(partId) }),
    );
  }

  await Promise.all(tasks);
}
