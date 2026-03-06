import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpDown, Download, FolderPlus, Search, Sparkles, Upload } from "lucide-react";
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fabbit/ui";
import { LinkPartsToProjectDialog } from "@/features/parts/components/link-parts-to-project-dialog";
import { PartsListTable } from "@/features/parts/components/parts-list-table";
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
  const [draftQuery, setDraftQuery] = useState(queryState.query);
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

  useEffect(() => {
    setDraftQuery(queryState.query);
  }, [queryState.query]);

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
    <div className="space-y-6">
      <section className="app-panel rounded-[32px] p-6 sm:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              Parts
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">부품 관리</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              부품 목록을 검색하고, 프로젝트 연결과 내보내기 흐름을 관리합니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" onClick={() => navigate("/parts/templates")}>
              <Sparkles className="size-4" />
              속성 분석
            </Button>
            <Button type="button" variant="outline" onClick={() => openPartsUploadDialog()}>
              <Upload className="size-4" />
              부품 업로드
            </Button>
          </div>
        </div>
      </section>

      <section className="app-panel rounded-[32px] p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="품번 또는 품명으로 검색"
              value={draftQuery}
              onChange={(event) => setDraftQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onQueryChange(draftQuery);
                }
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={queryState.category ?? "__all__"}
              onValueChange={(value) => onCategoryChange(value === "__all__" ? null : value)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">전체 카테고리</SelectItem>
                {filterOptionsQuery.data?.categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={queryState.lifecycleState ?? "__all__"}
              onValueChange={(value) => onLifecycleStateChange(value === "__all__" ? null : value)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">전체 상태</SelectItem>
                {filterOptionsQuery.data?.lifecycleStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={
                queryState.hasDrawing == null ? "__all__" : queryState.hasDrawing ? "with-drawing" : "without-drawing"
              }
              onValueChange={(value) =>
                onHasDrawingChange(value === "__all__" ? null : value === "with-drawing")
              }
            >
              <SelectTrigger className="w-[132px]">
                <SelectValue placeholder="도면" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">도면 전체</SelectItem>
                <SelectItem value="with-drawing">도면 있음</SelectItem>
                <SelectItem value="without-drawing">도면 없음</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={
                queryState.hasChildren == null ? "__all__" : queryState.hasChildren ? "with-children" : "without-children"
              }
              onValueChange={(value) =>
                onHasChildrenChange(value === "__all__" ? null : value === "with-children")
              }
            >
              <SelectTrigger className="w-[148px]">
                <SelectValue placeholder="하위 부품" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">하위 부품 전체</SelectItem>
                <SelectItem value="with-children">하위 부품 있음</SelectItem>
                <SelectItem value="without-children">하위 부품 없음</SelectItem>
              </SelectContent>
            </Select>

            <Button type="button" onClick={() => onQueryChange(draftQuery)}>
              <Search className="size-4" />
              검색
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-border/60 pt-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="text-sm text-muted-foreground">
            {partsQuery.isLoading ? "불러오는 중..." : `${totalCount.toLocaleString()}개의 부품`}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {selectedIds.size > 0 ? (
              <>
                <Button type="button" variant="outline" onClick={() => setIsLinkDialogOpen(true)}>
                  <FolderPlus className="size-4" />
                  프로젝트 연결
                </Button>
                <Button
                  disabled={exportPartsAction.isPending}
                  type="button"
                  variant="outline"
                  onClick={() => exportPartsAction.mutate({ part_ids: selectedPartIds })}
                >
                  <Download className="size-4" />
                  선택 내보내기
                </Button>
                <Button type="button" variant="ghost" onClick={() => setSelectedIds(new Set())}>
                  선택 해제
                </Button>
              </>
            ) : null}
            <Button
              disabled={exportPartsAction.isPending}
              type="button"
              variant="outline"
              onClick={() =>
                exportPartsAction.mutate({
                  search: queryState.query || undefined,
                  category: queryState.category || undefined,
                  lifecycle_state: queryState.lifecycleState || undefined,
                  has_drawing: queryState.hasDrawing ?? undefined,
                  has_children: queryState.hasChildren ?? undefined,
                })
              }
            >
              <Download className="size-4" />
              현재 조건 내보내기
            </Button>
            <Button type="button" variant="ghost" onClick={() => onSortChange(queryState.sortKey)}>
              <ArrowUpDown className="size-4" />
              정렬 토글
            </Button>
          </div>
        </div>
      </section>

      <PartsListTable
        items={sortedItems}
        isLoading={partsQuery.isLoading}
        page={queryState.page}
        pageSize={queryState.pageSize}
        sortKey={queryState.sortKey}
        sortOrder={queryState.sortOrder}
        totalCount={totalCount}
        selectedIds={selectedIds}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onRowClick={(partId) => navigate(`/parts/${partId}`)}
        onSortChange={onSortChange}
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
      />

      <LinkPartsToProjectDialog
        open={isLinkDialogOpen}
        selectedPartIds={selectedPartIds}
        onComplete={() => setSelectedIds(new Set())}
        onOpenChange={setIsLinkDialogOpen}
      />
    </div>
  );
}
