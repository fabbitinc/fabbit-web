import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PartsListScreen as PartsListScreenView } from "@fabbit/components";
import { LinkPartsToProjectDialog } from "@/features/parts/components/link-parts-to-project-dialog";
import { useExportPartsAction } from "@/features/parts/hooks/use-export-parts-action";
import { usePartFilterOptionsQuery } from "@/features/parts/hooks/use-part-filter-options-query";
import { usePartsListQuery } from "@/features/parts/hooks/use-parts-list-query";
import { usePartsUploadStore } from "@/features/parts/stores/parts-upload-store";
import type { PartListItemModel, PartsListQueryState, PartListSortKey } from "@/features/parts/types/parts-model";

interface PartsListScreenProps {
  queryState: PartsListQueryState;
  onCategoryChange: (category: string | null) => void;
  onHasChildrenChange: (hasChildren: boolean | null) => void;
  onHasDrawingChange: (hasDrawing: boolean | null) => void;
  onLifecycleStateChange: (lifecycleState: string | null) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onQueryChange: (query: string) => void;
  onSortChange: (sortKey: PartListSortKey) => void;
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
  queryState,
  onCategoryChange,
  onHasChildrenChange,
  onHasDrawingChange,
  onLifecycleStateChange,
  onPageChange,
  onPageSizeChange,
  onQueryChange,
  onSortChange,
}: PartsListScreenProps) {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const openPartsUploadDialog = usePartsUploadStore((state) => state.openDialog);

  const filterOptionsQuery = usePartFilterOptionsQuery();
  const partsQuery = usePartsListQuery({
    search: queryState.query || undefined,
    category: queryState.category || undefined,
    lifecycle_state: queryState.lifecycleState || undefined,
    has_drawing: queryState.hasDrawing ?? undefined,
    has_children: queryState.hasChildren ?? undefined,
    offset: (queryState.page - 1) * queryState.pageSize,
    limit: queryState.pageSize,
  });
  const exportPartsAction = useExportPartsAction();

  const totalCount = partsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / queryState.pageSize));

  useEffect(() => {
    if (partsQuery.isSuccess && queryState.page > totalPages) {
      onPageChange(totalPages);
    }
  }, [onPageChange, partsQuery.isSuccess, queryState.page, totalPages]);

  const sortedItems = useMemo(
    () => sortParts(partsQuery.data?.items ?? [], queryState.sortKey, queryState.sortOrder),
    [partsQuery.data?.items, queryState.sortKey, queryState.sortOrder],
  );

  const currentPageIds = sortedItems.map((item) => item.id);
  const allChecked = currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.has(id));
  const selectedPartIds = Array.from(selectedIds);

  return (
    <PartsListScreenView
      filterOptions={{
        categories: filterOptionsQuery.data?.categories ?? [],
        lifecycleStates: filterOptionsQuery.data?.lifecycleStates ?? [],
      }}
      isExporting={exportPartsAction.isPending}
      isLoading={partsQuery.isLoading}
      items={sortedItems}
      linkDialogContent={(
        <LinkPartsToProjectDialog
          open={isLinkDialogOpen}
          selectedPartIds={selectedPartIds}
          onComplete={() => setSelectedIds(new Set())}
          onOpenChange={setIsLinkDialogOpen}
        />
      )}
      queryState={queryState}
      selectedIds={selectedIds}
      totalCount={totalCount}
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
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onQueryChange={onQueryChange}
      onRowClick={(partId) => navigate(`/parts/${partId}`)}
      onCreateClick={() => {}}
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
