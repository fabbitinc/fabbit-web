import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PartsListScreen as PartsListScreenView } from "@fabbit/components";
import type {
  PartsListScreenMode,
  PartsListScreenPrimaryTab,
  PartsListScreenWorkbenchFilter,
} from "@fabbit/components";
import { ListInProgressPartsStatusesItem } from "@/api/generated/orval/model/listInProgressPartsStatusesItem";
import { LinkPartsToProjectDialog } from "@/features/parts/components/link-parts-to-project-dialog";
import { useExportPartsAction } from "@/features/parts/hooks/use-export-parts-action";
import { usePartFilterOptionsQuery } from "@/features/parts/hooks/use-part-filter-options-query";
import { usePartsListQuery } from "@/features/parts/hooks/use-parts-list-query";
import { buildPartDetailPath } from "@/features/parts/lib/part-route";
import { usePartsUploadStore } from "@/features/parts/stores/parts-upload-store";
import type {
  PartListItemModel,
  PartsListQueryState,
  PartListSortKey,
} from "@/features/parts/types/parts-model";

interface PartsListScreenProps {
  activePrimaryTab: PartsListScreenPrimaryTab;
  activeWorkbenchFilter: PartsListScreenWorkbenchFilter;
  mode: PartsListScreenMode;
  queryState: PartsListQueryState;
  onCategoryChange: (category: string | null) => void;
  onHasChildrenChange: (hasChildren: boolean | null) => void;
  onHasDrawingChange: (hasDrawing: boolean | null) => void;
  onLifecycleStateChange: (lifecycleState: string | null) => void;
  onCursorChange: (cursor: string | null, direction: "next" | "prev" | null) => void;
  onMineOnlyChange: (mineOnly: boolean) => void;
  onPageSizeChange: (pageSize: number) => void;
  onPrimaryTabChange: (tab: PartsListScreenPrimaryTab) => void;
  onQueryChange: (query: string) => void;
  onSortChange: (sortKey: PartListSortKey) => void;
  onWorkbenchFilterChange: (filter: PartsListScreenWorkbenchFilter) => void;
}

function sortParts(
  items: PartListItemModel[],
  sortKey: PartListSortKey,
  sortOrder: "asc" | "desc",
) {
  return [...(items ?? [])].sort((left, right) => {
    const leftValue =
      sortKey === "partNumber"
        ? left.partNumber
        : sortKey === "name"
          ? left.name ?? ""
          : sortKey === "category"
            ? left.category ?? ""
            : sortKey === "revision"
              ? left.revision
              : left.lifecycleState ?? "";
    const rightValue =
      sortKey === "partNumber"
        ? right.partNumber
        : sortKey === "name"
          ? right.name ?? ""
          : sortKey === "category"
            ? right.category ?? ""
            : sortKey === "revision"
              ? right.revision
              : right.lifecycleState ?? "";

    const compared = String(leftValue).localeCompare(String(rightValue), "ko");
    return sortOrder === "asc" ? compared : -compared;
  });
}

export function PartsListScreen({
  activePrimaryTab,
  activeWorkbenchFilter,
  mode,
  queryState,
  onCategoryChange,
  onHasChildrenChange,
  onHasDrawingChange,
  onLifecycleStateChange,
  onCursorChange,
  onMineOnlyChange,
  onPageSizeChange,
  onPrimaryTabChange,
  onQueryChange,
  onSortChange,
  onWorkbenchFilterChange,
}: PartsListScreenProps) {
  const navigate = useNavigate();
  const [draftQuery, setDraftQuery] = useState(queryState.query);
  const [pendingSearchQuery, setPendingSearchQuery] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const onQueryChangeRef = useRef(onQueryChange);
  const openPartsUploadDialog = usePartsUploadStore((state) => state.openDialog);

  useEffect(() => {
    onQueryChangeRef.current = onQueryChange;
  }, [onQueryChange]);

  useEffect(() => {
    setDraftQuery(queryState.query);
    setPendingSearchQuery((current) => (current !== null && current !== queryState.query ? null : current));
  }, [queryState.query]);

  useEffect(() => {
    const normalizedDraftQuery = draftQuery.trim();

    if (normalizedDraftQuery === queryState.query) {
      setPendingSearchQuery((current) => (current === normalizedDraftQuery ? null : current));
      return;
    }

    const timerId = window.setTimeout(() => {
      setPendingSearchQuery(normalizedDraftQuery);
      onQueryChangeRef.current(draftQuery);
    }, 400);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [draftQuery, queryState.query]);

  const workbenchStatuses = useMemo(() => {
    if (activePrimaryTab !== "workbench") {
      return undefined;
    }

    return [ListInProgressPartsStatusesItem.DRAFT];
  }, [activePrimaryTab]);

  const filterOptionsQuery = usePartFilterOptionsQuery();
  const partsQuery = usePartsListQuery({
    source: activePrimaryTab === "workbench" ? "workbench" : "master",
    search: queryState.query || undefined,
    category: queryState.category || undefined,
    lifecycle_state: queryState.lifecycleState || undefined,
    statuses: workbenchStatuses,
    mine_only: activePrimaryTab === "workbench" ? queryState.mineOnly : undefined,
    has_drawing: queryState.hasDrawing ?? undefined,
    has_children: queryState.hasChildren ?? undefined,
    next_cursor: queryState.cursorDirection === "next" ? queryState.cursor ?? undefined : undefined,
    prev_cursor: queryState.cursorDirection === "prev" ? queryState.cursor ?? undefined : undefined,
    limit: queryState.pageSize,
  });
  const exportPartsAction = useExportPartsAction();

  useEffect(() => {
    if (pendingSearchQuery !== null && queryState.query === pendingSearchQuery && !partsQuery.isFetching) {
      setPendingSearchQuery(null);
    }
  }, [partsQuery.isFetching, pendingSearchQuery, queryState.query]);

  const sortedItems = useMemo(
    () => sortParts(partsQuery.data?.items ?? [], queryState.sortKey, queryState.sortOrder),
    [partsQuery.data?.items, queryState.sortKey, queryState.sortOrder],
  );

  const currentPageIds = sortedItems.map((item) => item.id);
  const allChecked = currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.has(id));
  const selectedPartIds = Array.from(selectedIds);

  return (
    <PartsListScreenView
      activePrimaryTab={activePrimaryTab}
      activeWorkbenchFilter={activeWorkbenchFilter}
      filterOptions={{
        categories: filterOptionsQuery.data?.categories ?? [],
        lifecycleStates: filterOptionsQuery.data?.lifecycleStates ?? [],
      }}
      hasNextPage={Boolean(partsQuery.data?.nextCursor)}
      hasPreviousPage={Boolean(partsQuery.data?.prevCursor)}
      isExporting={exportPartsAction.isPending}
      isLoading={partsQuery.isLoading && !partsQuery.data}
      isSearchPending={pendingSearchQuery !== null}
      items={sortedItems}
      linkDialogContent={(
        <LinkPartsToProjectDialog
          open={isLinkDialogOpen}
          selectedPartIds={selectedPartIds}
          onComplete={() => setSelectedIds(new Set())}
          onOpenChange={setIsLinkDialogOpen}
        />
      )}
      mode={mode}
      onNextPage={() => onCursorChange(partsQuery.data?.nextCursor ?? null, "next")}
      onPrimaryTabChange={onPrimaryTabChange}
      onPreviousPage={() => onCursorChange(partsQuery.data?.prevCursor ?? null, "prev")}
      onWorkbenchFilterChange={onWorkbenchFilterChange}
      queryState={queryState}
      searchValue={draftQuery}
      selectedIds={selectedIds}
      onAllExportClick={() => exportPartsAction.mutate({})}
      onCategoryChange={onCategoryChange}
      onClearSelection={() => setSelectedIds(new Set())}
      onFilteredExportClick={() =>
        exportPartsAction.mutate({
          search: queryState.query || undefined,
          category: queryState.category || undefined,
          lifecycle_state: queryState.lifecycleState || undefined,
          has_drawing: queryState.hasDrawing ?? undefined,
          has_children: queryState.hasChildren ?? undefined,
        })
      }
      onHasChildrenChange={onHasChildrenChange}
      onHasDrawingChange={onHasDrawingChange}
      onLifecycleStateChange={onLifecycleStateChange}
      onLinkClick={() => setIsLinkDialogOpen(true)}
      onMineOnlyChange={onMineOnlyChange}
      onPageSizeChange={onPageSizeChange}
      onQueryChange={onQueryChange}
      onRowClick={(itemId) => {
        const item = sortedItems.find((candidate) => candidate.id === itemId);

        if (!item || !item.revisionId) {
          return;
        }

        navigate(buildPartDetailPath(item.partId, item.revisionId));
      }}
      onSearchValueChange={setDraftQuery}
      onCreateClick={() => navigate("/parts/new")}
      onSelectedExportClick={() => exportPartsAction.mutate({ part_ids: selectedPartIds })}
      onSortChange={onSortChange}
      onTemplateAnalysisClick={() => navigate("/parts/templates")}
      onToggleSelectAll={() => {
        if (allChecked) {
          setSelectedIds((current) => {
            const next = new Set(current);
            currentPageIds.forEach((id) => next.delete(id));
            return next;
          });
          return;
        }

        setSelectedIds((current) => {
          const next = new Set(current);
          currentPageIds.forEach((id) => next.add(id));
          return next;
        });
      }}
      onToggleSelectOne={(partId) =>
        setSelectedIds((current) => {
          const next = new Set(current);
          if (next.has(partId)) {
            next.delete(partId);
          } else {
            next.add(partId);
          }
          return next;
        })
      }
      onUploadClick={() => openPartsUploadDialog()}
    />
  );
}
