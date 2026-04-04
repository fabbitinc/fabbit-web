import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link2, Trash2 } from "lucide-react";
import { PartsListScreen as PartsListScreenView } from "@fabbit/components";
import { Button, ConfirmDialog } from "@fabbit/ui";
import { PartListInProgressStatusesItem as ListInProgressPartsStatusesItem } from "@/api/generated/orval/model/partListInProgressStatusesItem";
import { ProjectAddPartsDialog } from "@/features/project-detail/components/project-add-parts-dialog";
import { useUnlinkProjectPartsAction } from "@/features/project-detail/hooks/use-unlink-project-parts-action";
import { useProjectDetailStore } from "@/features/project-detail/stores/project-detail-store";
import { useExportPartsAction } from "@/features/parts/hooks/use-export-parts-action";
import { usePartFilterOptionsQuery } from "@/features/parts/hooks/use-part-filter-options-query";
import { usePartsListQuery } from "@/features/parts/hooks/use-parts-list-query";
import { buildPartDetailPath } from "@/features/parts/lib/part-route";
import type {
  PartListItemModel,
  PartsListQueryState,
  PartListSortKey,
} from "@/features/parts/types/parts-model";
import type { PartDetailResponseLifecycleState } from "@/api/generated/orval/model/partDetailResponseLifecycleState";
import { useSettingsQuery } from "@/features/settings";
import type { PartsListScreenPrimaryTab, PartsListScreenWorkbenchFilter } from "@fabbit/components";

interface ProjectPartsTabProps {
  isReadonly: boolean;
  projectId: string;
}

const defaultQueryState: PartsListQueryState = {
  query: "",
  cursor: null,
  cursorDirection: null,
  mineOnly: false,
  category: null,
  lifecycleState: null,
  hasDrawing: null,
  hasChildren: null,
  pageSize: 15,
  sortKey: "partNumber",
  sortOrder: "asc",
};

function sortParts(
  items: PartListItemModel[],
  sortKey: PartListSortKey,
  sortOrder: "asc" | "desc",
) {
  return [...items].sort((left, right) => {
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

export function ProjectPartsTab({ isReadonly, projectId }: ProjectPartsTabProps) {
  const navigate = useNavigate();
  const settingsQuery = useSettingsQuery();
  const openAddPartDialog = useProjectDetailStore((state) => state.openAddPartDialog);
  const unlinkProjectPartsAction = useUnlinkProjectPartsAction(projectId);
  const exportPartsAction = useExportPartsAction();
  const filterOptionsQuery = usePartFilterOptionsQuery();
  const [activePrimaryTab, setActivePrimaryTab] = useState<PartsListScreenPrimaryTab>("master");
  const [activeWorkbenchFilter, setActiveWorkbenchFilter] = useState<PartsListScreenWorkbenchFilter>("draft");
  const [queryState, setQueryState] = useState<PartsListQueryState>(defaultQueryState);
  const [draftQuery, setDraftQuery] = useState(defaultQueryState.query);
  const [pendingSearchQuery, setPendingSearchQuery] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isUnlinkConfirmOpen, setIsUnlinkConfirmOpen] = useState(false);
  const onQueryChangeRef = useRef<(query: string) => void>(() => undefined);

  useEffect(() => {
    onQueryChangeRef.current = (query) => {
      setQueryState((previous) => ({
        ...previous,
        query: query.trim(),
        cursor: null,
        cursorDirection: null,
      }));
    };
  }, []);

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

  const partsQuery = usePartsListQuery({
    source: activePrimaryTab,
    project_id: projectId,
    search: queryState.query || undefined,
    category: queryState.category || undefined,
    lifecycle_state: queryState.lifecycleState || undefined,
    statuses: activePrimaryTab === "workbench" ? [ListInProgressPartsStatusesItem.DRAFT] : undefined,
    mine_only: activePrimaryTab === "workbench" ? queryState.mineOnly : undefined,
    has_drawing: queryState.hasDrawing ?? undefined,
    has_children: queryState.hasChildren ?? undefined,
    next_cursor: queryState.cursorDirection === "next" ? queryState.cursor ?? undefined : undefined,
    prev_cursor: queryState.cursorDirection === "prev" ? queryState.cursor ?? undefined : undefined,
    limit: queryState.pageSize,
  });

  useEffect(() => {
    if (pendingSearchQuery !== null && queryState.query === pendingSearchQuery && !partsQuery.isFetching) {
      setPendingSearchQuery(null);
    }
  }, [partsQuery.isFetching, pendingSearchQuery, queryState.query]);

  const mode = settingsQuery.data?.partWorkflowMode === "DIRECT" ? "direct" : "change-managed";
  const sortedItems = useMemo(
    () => sortParts(partsQuery.data?.items ?? [], queryState.sortKey, queryState.sortOrder),
    [partsQuery.data?.items, queryState.sortKey, queryState.sortOrder],
  );
  const currentPageIds = sortedItems.map((item) => item.id);
  const allChecked = currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.has(id));
  const selectedPartIds = Array.from(selectedIds);
  const selectedParts = sortedItems.filter((item) => selectedIds.has(item.id));
  const selectedSummary =
    selectedParts.length === 0
      ? `${selectedPartIds.length}개`
      : selectedParts.length <= 3
      ? selectedParts.map((part) => part.partNumber).join(", ")
      : `${selectedParts.slice(0, 3).map((part) => part.partNumber).join(", ")} 외 ${selectedParts.length - 3}개`;

  return (
    <>
      <PartsListScreenView
        activePrimaryTab={activePrimaryTab}
        activeWorkbenchFilter={activeWorkbenchFilter}
        filterOptions={{
          categories: filterOptionsQuery.data?.categories ?? [],
          lifecycleStates: filterOptionsQuery.data?.lifecycleStates ?? [],
        }}
        hasNextPage={Boolean(partsQuery.data?.nextCursor)}
        hasPreviousPage={Boolean(partsQuery.data?.prevCursor)}
        header={{
          title: "부품 목록",
          description: "이 프로젝트에 연결된 부품을 부품 관리 화면과 같은 기준으로 조회합니다.",
          actions: (
            <Button disabled={isReadonly} type="button" onClick={openAddPartDialog}>
              <Link2 className="h-4 w-4" />
              부품 연결
            </Button>
          ),
        }}
        isExporting={exportPartsAction.isPending}
        isLoading={partsQuery.isLoading && !partsQuery.data}
        isSearchPending={pendingSearchQuery !== null}
        items={sortedItems.map((item) => ({
          id: item.id,
          routeId: item.revisionId ? buildPartDetailPath(item.partId, item.revisionId) : undefined,
          partNumber: item.partNumber,
          name: item.name,
          category: item.category,
          revision: item.revision,
          lifecycleState: item.lifecycleState,
          drawingId: item.drawingId,
          childrenCount: item.childrenCount,
        }))}
        linkDialogContent={<ProjectAddPartsDialog projectId={projectId} />}
        mode={mode}
        queryState={queryState}
        searchValue={draftQuery}
        selectedIds={selectedIds}
        selectedToolbarActions={(
          <Button
            disabled={isReadonly || selectedPartIds.length === 0 || unlinkProjectPartsAction.isPending}
            size="sm"
            type="button"
            variant="outline"
            onClick={() => setIsUnlinkConfirmOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            연결 해제
          </Button>
        )}
        showModeTabs
        onAllExportClick={() => exportPartsAction.mutate({ project_id: projectId })}
        onCategoryChange={(category) =>
          setQueryState((previous) => ({
            ...previous,
            category,
            cursor: null,
            cursorDirection: null,
          }))
        }
        onClearSelection={() => setSelectedIds(new Set())}
        onCreateClick={() => undefined}
        onFilteredExportClick={() =>
          exportPartsAction.mutate({
            project_id: projectId,
            search: queryState.query || undefined,
            category: queryState.category || undefined,
            lifecycle_state: queryState.lifecycleState || undefined,
            has_drawing: queryState.hasDrawing ?? undefined,
            has_children: queryState.hasChildren ?? undefined,
          })
        }
        onHasChildrenChange={(hasChildren) =>
          setQueryState((previous) => ({
            ...previous,
            hasChildren,
            cursor: null,
            cursorDirection: null,
          }))
        }
        onHasDrawingChange={(hasDrawing) =>
          setQueryState((previous) => ({
            ...previous,
            hasDrawing,
            cursor: null,
            cursorDirection: null,
          }))
        }
        onLifecycleStateChange={(lifecycleState) =>
          setQueryState((previous) => ({
            ...previous,
            lifecycleState: lifecycleState as PartDetailResponseLifecycleState | null,
            cursor: null,
            cursorDirection: null,
          }))
        }
        onLinkClick={() => undefined}
        onMineOnlyChange={(mineOnly) =>
          setQueryState((previous) => ({
            ...previous,
            mineOnly,
            cursor: null,
            cursorDirection: null,
          }))
        }
        onNextPage={() =>
          setQueryState((previous) => ({
            ...previous,
            cursor: partsQuery.data?.nextCursor ?? null,
            cursorDirection: "next",
          }))
        }
        onPageSizeChange={(pageSize) =>
          setQueryState((previous) => ({
            ...previous,
            pageSize,
            cursor: null,
            cursorDirection: null,
          }))
        }
        onPrimaryTabChange={(tab) => {
          setActivePrimaryTab(tab);
          setQueryState((previous) => ({
            ...previous,
            mineOnly: tab === "workbench" ? previous.mineOnly : false,
            cursor: null,
            cursorDirection: null,
          }));
        }}
        onPreviousPage={() =>
          setQueryState((previous) => ({
            ...previous,
            cursor: partsQuery.data?.prevCursor ?? null,
            cursorDirection: "prev",
          }))
        }
        onQueryChange={(query) =>
          setQueryState((previous) => ({
            ...previous,
            query: query.trim(),
            cursor: null,
            cursorDirection: null,
          }))
        }
        onRowClick={(routeId) => {
          if (routeId.startsWith("/parts/")) {
            navigate(routeId);
          }
        }}
        onSearchValueChange={setDraftQuery}
        onSelectedExportClick={() => exportPartsAction.mutate({ project_id: projectId, part_ids: selectedPartIds })}
        onSortChange={(sortKey) =>
          setQueryState((previous) => ({
            ...previous,
            sortKey,
            sortOrder:
              previous.sortKey === sortKey && previous.sortOrder === "asc"
                ? "desc"
                : "asc",
          }))
        }
        onTemplateAnalysisClick={() => undefined}
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
        onUploadClick={() => undefined}
        onWorkbenchFilterChange={(filter) => {
          setActiveWorkbenchFilter(filter);
          setQueryState((previous) => ({
            ...previous,
            cursor: null,
            cursorDirection: null,
          }));
        }}
      />

      <ConfirmDialog
        cancelLabel="취소"
        confirmLabel="연결 해제"
        description={
          selectedPartIds.length > 0
            ? `${selectedSummary} 부품의 프로젝트 연결을 해제합니다.`
            : "선택한 부품의 프로젝트 연결을 해제합니다."
        }
        open={isUnlinkConfirmOpen}
        title="선택한 부품 연결을 해제할까요?"
        variant="destructive"
        onCancel={() => setIsUnlinkConfirmOpen(false)}
        onConfirm={() => {
          if (selectedPartIds.length === 0) {
            return;
          }

          unlinkProjectPartsAction.mutate(selectedPartIds, {
            onSuccess: () => {
              setSelectedIds(new Set());
              setIsUnlinkConfirmOpen(false);
            },
          });
        }}
        onOpenChange={setIsUnlinkConfirmOpen}
      />
    </>
  );
}
