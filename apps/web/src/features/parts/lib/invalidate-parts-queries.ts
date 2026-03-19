import type { QueryClient } from "@tanstack/react-query";
import { partsKeys } from "@/features/parts/api/parts.queries";

interface InvalidatePartsQueriesOptions {
  includeList?: boolean;
}

export async function invalidatePartsQueries(
  queryClient: QueryClient,
  partId?: string,
  revisionId?: string,
  options?: InvalidatePartsQueriesOptions,
) {
  const tasks: Promise<unknown>[] = [];

  if (options?.includeList) {
    tasks.push(queryClient.invalidateQueries({ queryKey: partsKeys.lists() }));
  }

  if (partId) {
    tasks.push(queryClient.invalidateQueries({ queryKey: partsKeys.history(partId) }));
  }

  if (partId && revisionId) {
    tasks.push(
      queryClient.invalidateQueries({ queryKey: partsKeys.detail(partId, revisionId) }),
      queryClient.invalidateQueries({ queryKey: partsKeys.bom(partId, revisionId) }),
      queryClient.invalidateQueries({ queryKey: partsKeys.files(partId, revisionId) }),
      queryClient.invalidateQueries({ queryKey: partsKeys.previewSources(partId, revisionId) }),
      queryClient.invalidateQueries({ queryKey: partsKeys.projects(partId, revisionId) }),
      queryClient.invalidateQueries({ queryKey: partsKeys.suppliers(partId, revisionId) }),
      queryClient.invalidateQueries({ queryKey: partsKeys.drawingProcessing(partId, revisionId) }),
    );
  }

  await Promise.all(tasks);
}
