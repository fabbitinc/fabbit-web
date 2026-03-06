import { useEffect, useState, type ReactNode } from "react";
import { ArrowUpDown, Download, FolderPlus, Search, Sparkles, Upload } from "lucide-react";
import {
  PartsListTable,
  type PartsListTableItem,
  type PartsListTableSortKey,
  type PartsListTableSortOrder,
} from "./parts-list-table";
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fabbit/ui";

export interface PartsListScreenQueryState {
  query: string;
  page: number;
  pageSize: number;
  category: string | null;
  lifecycleState: string | null;
  hasDrawing: boolean | null;
  hasChildren: boolean | null;
  sortKey: PartsListTableSortKey;
  sortOrder: PartsListTableSortOrder;
}

export interface PartsListScreenFilterOptions {
  categories: string[];
  lifecycleStates: string[];
}

export interface PartsListScreenProps {
  filterOptions: PartsListScreenFilterOptions;
  items: PartsListTableItem[];
  linkDialogContent: ReactNode;
  queryState: PartsListScreenQueryState;
  selectedIds: Set<string>;
  totalCount: number;
  isExporting?: boolean;
  isLoading?: boolean;
  onCategoryChange: (category: string | null) => void;
  onClearSelection: () => void;
  onCurrentExportClick: () => void;
  onHasChildrenChange: (hasChildren: boolean | null) => void;
  onHasDrawingChange: (hasDrawing: boolean | null) => void;
  onLifecycleStateChange: (lifecycleState: string | null) => void;
  onLinkClick: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onQueryChange: (query: string) => void;
  onRowClick: (partId: string) => void;
  onSelectedExportClick: () => void;
  onSortChange: (sortKey: PartsListTableSortKey) => void;
  onTemplateAnalysisClick: () => void;
  onToggleSelectAll: () => void;
  onToggleSelectOne: (partId: string) => void;
  onUploadClick: () => void;
}

function PartsQueryInput({
  query,
  onSubmit,
}: {
  query: string;
  onSubmit: (query: string) => void;
}) {
  const [draftQuery, setDraftQuery] = useState(query);

  useEffect(() => {
    setDraftQuery(query);
  }, [query]);

  return (
    <div className="flex flex-1 gap-2">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="품번 또는 품명으로 검색"
          value={draftQuery}
          onChange={(event) => setDraftQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSubmit(draftQuery);
            }
          }}
        />
      </div>
      <Button type="button" onClick={() => onSubmit(draftQuery)}>
        <Search className="size-4" />
        검색
      </Button>
    </div>
  );
}

export function PartsListScreen({
  filterOptions,
  items,
  linkDialogContent,
  queryState,
  selectedIds,
  totalCount,
  isExporting = false,
  isLoading = false,
  onCategoryChange,
  onClearSelection,
  onCurrentExportClick,
  onHasChildrenChange,
  onHasDrawingChange,
  onLifecycleStateChange,
  onLinkClick,
  onPageChange,
  onPageSizeChange,
  onQueryChange,
  onRowClick,
  onSelectedExportClick,
  onSortChange,
  onTemplateAnalysisClick,
  onToggleSelectAll,
  onToggleSelectOne,
  onUploadClick,
}: PartsListScreenProps) {
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
            <Button type="button" variant="outline" onClick={onTemplateAnalysisClick}>
              <Sparkles className="size-4" />
              속성 분석
            </Button>
            <Button type="button" variant="outline" onClick={onUploadClick}>
              <Upload className="size-4" />
              부품 업로드
            </Button>
          </div>
        </div>
      </section>

      <section className="app-panel rounded-[32px] p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <PartsQueryInput query={queryState.query} onSubmit={onQueryChange} />

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
                {filterOptions.categories.map((category) => (
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
                {filterOptions.lifecycleStates.map((state) => (
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
              onValueChange={(value) => onHasDrawingChange(value === "__all__" ? null : value === "with-drawing")}
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
              onValueChange={(value) => onHasChildrenChange(value === "__all__" ? null : value === "with-children")}
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
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-border/60 pt-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="text-sm text-muted-foreground">
            {isLoading ? "불러오는 중..." : `${totalCount.toLocaleString()}개의 부품`}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {selectedIds.size > 0 ? (
              <>
                <Button type="button" variant="outline" onClick={onLinkClick}>
                  <FolderPlus className="size-4" />
                  프로젝트 연결
                </Button>
                <Button disabled={isExporting} type="button" variant="outline" onClick={onSelectedExportClick}>
                  <Download className="size-4" />
                  선택 내보내기
                </Button>
                <Button type="button" variant="ghost" onClick={onClearSelection}>
                  선택 해제
                </Button>
              </>
            ) : null}
            <Button disabled={isExporting} type="button" variant="outline" onClick={onCurrentExportClick}>
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
        isLoading={isLoading}
        items={items}
        page={queryState.page}
        pageSize={queryState.pageSize}
        selectedIds={selectedIds}
        sortKey={queryState.sortKey}
        sortOrder={queryState.sortOrder}
        totalCount={totalCount}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onRowClick={onRowClick}
        onSortChange={onSortChange}
        onToggleSelectAll={onToggleSelectAll}
        onToggleSelectOne={onToggleSelectOne}
      />

      {linkDialogContent}
    </div>
  );
}
