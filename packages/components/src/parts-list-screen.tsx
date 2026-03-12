import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ChevronDown,
  Download,
  Link2,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
} from "@fabbit/ui";
import {
  PartsListTable,
  type PartsListTableItem,
  type PartsListTableSortKey,
} from "./parts-list-table";

export interface PartsListScreenQueryState {
  query: string;
  page: number;
  pageSize: number;
  category: string | null;
  lifecycleState: string | null;
  hasDrawing: boolean | null;
  hasChildren: boolean | null;
  sortKey: PartsListTableSortKey;
  sortOrder: "asc" | "desc";
}

export interface PartsListScreenFilterOptions {
  categories: string[];
  lifecycleStates: string[];
}

export interface PartsListScreenProps {
  filterOptions: PartsListScreenFilterOptions;
  isExporting: boolean;
  isLoading: boolean;
  items: PartsListTableItem[];
  linkDialogContent?: ReactNode;
  onFiltersApply?: (queryState: PartsListScreenQueryState) => void;
  queryState: PartsListScreenQueryState;
  selectedIds: Set<string>;
  totalCount: number;
  onAllExportClick: () => void;
  onCategoryChange: (category: string | null) => void;
  onClearSelection: () => void;
  onCreateClick: () => void;
  onFilteredExportClick: () => void;
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

interface FilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

interface DropdownEmptyStateProps {
  message: string;
}

function DropdownEmptyState({ message }: DropdownEmptyStateProps) {
  return (
    <DropdownMenuItem disabled className="text-muted-foreground">
      {message}
    </DropdownMenuItem>
  );
}

function isSameQueryState(left: PartsListScreenQueryState, right: PartsListScreenQueryState) {
  return (
    left.query === right.query &&
    left.category === right.category &&
    left.lifecycleState === right.lifecycleState &&
    left.hasDrawing === right.hasDrawing &&
    left.hasChildren === right.hasChildren
  );
}

export function PartsListScreen({
  filterOptions,
  isExporting,
  isLoading,
  items,
  linkDialogContent,
  onFiltersApply,
  queryState,
  selectedIds,
  totalCount,
  onAllExportClick,
  onCategoryChange,
  onClearSelection,
  onCreateClick,
  onFilteredExportClick,
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
  const [draftState, setDraftState] = useState<PartsListScreenQueryState>(queryState);

  useEffect(() => {
    setDraftState(queryState);
  }, [queryState]);

  const hasPendingChanges = useMemo(() => !isSameQueryState(draftState, queryState), [draftState, queryState]);
  const draftAttributeCount =
    (draftState.hasDrawing !== null ? 1 : 0) + (draftState.hasChildren !== null ? 1 : 0);
  const hasAppliedFilters = Boolean(
    queryState.query.trim() ||
      queryState.category ||
      queryState.lifecycleState ||
      queryState.hasDrawing !== null ||
      queryState.hasChildren !== null,
  );

  const activeChips = useMemo<FilterChip[]>(() => {
    const chips: FilterChip[] = [];

    if (draftState.category) {
      chips.push({
        key: "category",
        label: `카테고리: ${draftState.category}`,
        onRemove: () => setDraftState((current) => ({ ...current, category: null })),
      });
    }

    if (draftState.lifecycleState) {
      chips.push({
        key: "lifecycleState",
        label: `상태: ${draftState.lifecycleState}`,
        onRemove: () => setDraftState((current) => ({ ...current, lifecycleState: null })),
      });
    }

    if (draftState.hasDrawing !== null) {
      chips.push({
        key: "hasDrawing",
        label: `도면 ${draftState.hasDrawing ? "있음" : "없음"}`,
        onRemove: () => setDraftState((current) => ({ ...current, hasDrawing: null })),
      });
    }

    if (draftState.hasChildren !== null) {
      chips.push({
        key: "hasChildren",
        label: `하위 부품 ${draftState.hasChildren ? "있음" : "없음"}`,
        onRemove: () => setDraftState((current) => ({ ...current, hasChildren: null })),
      });
    }

    return chips;
  }, [draftState]);

  function applyFilters() {
    if (!hasPendingChanges) {
      return;
    }

    if (onFiltersApply) {
      onFiltersApply(draftState);
      return;
    }

    onQueryChange(draftState.query);
    onCategoryChange(draftState.category);
    onLifecycleStateChange(draftState.lifecycleState);
    onHasDrawingChange(draftState.hasDrawing);
    onHasChildrenChange(draftState.hasChildren);
    onPageChange(1);
  }

  function clearDraftFilters() {
    setDraftState((current) => ({
      ...current,
      query: "",
      category: null,
      lifecycleState: null,
      hasDrawing: null,
      hasChildren: null,
    }));
  }

  const selectedCount = selectedIds.size;

  return (
    <div className="w-full">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">부품 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">조직의 전체 부품을 관리합니다</p>
        </div>

        <div className="flex items-center gap-2">
          <Button className="ai-outline-btn ai-theme-1" type="button" variant="outline" onClick={onTemplateAnalysisClick}>
            <Sparkles className="ai-outline-btn__icon h-4 w-4" />
            속성 분석
          </Button>
          <Button type="button" variant="outline" onClick={onUploadClick}>
            <Upload className="h-4 w-4" />
            부품 업로드
          </Button>
          <Button type="button" onClick={onCreateClick}>
            <Plus className="h-4 w-4" />
            새 부품
          </Button>
        </div>
      </div>

      <div className="mb-2 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="품번, 품명으로 검색..."
            value={draftState.query}
            onChange={(event) => setDraftState((current) => ({ ...current, query: event.target.value }))}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                applyFilters();
              }
            }}
          />
        </div>
        <Button disabled={!hasPendingChanges} type="button" variant={hasPendingChanges ? "default" : "outline"} onClick={applyFilters}>
          <Search className="h-4 w-4" />
          검색
        </Button>
        <span className="shrink-0 text-sm text-muted-foreground">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span className="font-semibold text-foreground">{totalCount}</span>건
            </>
          )}
        </span>
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-2">
        {selectedCount > 0 ? (
          <>
            <div className="ml-2 flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{selectedCount}건 선택</span>
              <button
                className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground"
                type="button"
                onClick={onClearSelection}
              >
                선택 해제
              </button>
            </div>
            <div className="flex-1" />
            <Button size="sm" type="button" variant="outline" onClick={onLinkClick}>
              <Link2 className="h-3.5 w-3.5" />
              프로젝트 연결
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={isExporting} size="sm" type="button" variant="outline">
                  {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  내려받기
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onSelectedExportClick}>선택 내려받기 ({selectedCount}건)</DropdownMenuItem>
                <DropdownMenuItem onClick={onAllExportClick}>전체 내려받기</DropdownMenuItem>
                {hasAppliedFilters ? (
                  <DropdownMenuItem onClick={onFilteredExportClick}>검색 결과 내려받기</DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className={draftState.category ? "border-primary/50 text-primary" : undefined}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  카테고리
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                <DropdownMenuLabel>카테고리</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {filterOptions.categories.length > 0 ? (
                  filterOptions.categories.map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category}
                      checked={draftState.category === category}
                      onCheckedChange={() =>
                        setDraftState((current) => ({
                          ...current,
                          category: current.category === category ? null : category,
                        }))
                      }
                      onSelect={(event) => event.preventDefault()}
                    >
                      {category}
                    </DropdownMenuCheckboxItem>
                  ))
                ) : (
                  <DropdownEmptyState message="표시할 카테고리가 없습니다." />
                )}
                {draftState.category ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setDraftState((current) => ({ ...current, category: null }))}>
                      선택 해제
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className={draftState.lifecycleState ? "border-primary/50 text-primary" : undefined}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  상태
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                <DropdownMenuLabel>상태</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {filterOptions.lifecycleStates.length > 0 ? (
                  filterOptions.lifecycleStates.map((lifecycleState) => (
                    <DropdownMenuCheckboxItem
                      key={lifecycleState}
                      checked={draftState.lifecycleState === lifecycleState}
                      onCheckedChange={() =>
                        setDraftState((current) => ({
                          ...current,
                          lifecycleState: current.lifecycleState === lifecycleState ? null : lifecycleState,
                        }))
                      }
                      onSelect={(event) => event.preventDefault()}
                    >
                      {lifecycleState}
                    </DropdownMenuCheckboxItem>
                  ))
                ) : (
                  <DropdownEmptyState message="표시할 상태 옵션이 없습니다." />
                )}
                {draftState.lifecycleState ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDraftState((current) => ({ ...current, lifecycleState: null }))}
                    >
                      선택 해제
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className={draftAttributeCount > 0 ? "border-primary/50 text-primary" : undefined}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  속성
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                <DropdownMenuLabel>도면</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={draftState.hasDrawing === true}
                  onCheckedChange={() =>
                    setDraftState((current) => ({
                      ...current,
                      hasDrawing: current.hasDrawing === true ? null : true,
                    }))
                  }
                  onSelect={(event) => event.preventDefault()}
                >
                  도면 있음
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={draftState.hasDrawing === false}
                  onCheckedChange={() =>
                    setDraftState((current) => ({
                      ...current,
                      hasDrawing: current.hasDrawing === false ? null : false,
                    }))
                  }
                  onSelect={(event) => event.preventDefault()}
                >
                  도면 없음
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>하위 부품</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={draftState.hasChildren === true}
                  onCheckedChange={() =>
                    setDraftState((current) => ({
                      ...current,
                      hasChildren: current.hasChildren === true ? null : true,
                    }))
                  }
                  onSelect={(event) => event.preventDefault()}
                >
                  하위 부품 있음
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={draftState.hasChildren === false}
                  onCheckedChange={() =>
                    setDraftState((current) => ({
                      ...current,
                      hasChildren: current.hasChildren === false ? null : false,
                    }))
                  }
                  onSelect={(event) => event.preventDefault()}
                >
                  하위 부품 없음
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex-1" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={isExporting} size="sm" type="button" variant="outline">
                  {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  내려받기
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onAllExportClick}>전체 내려받기</DropdownMenuItem>
                {hasAppliedFilters ? (
                  <DropdownMenuItem onClick={onFilteredExportClick}>검색 결과 내려받기</DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>

      {activeChips.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          {activeChips.map((chip) => (
            <Badge key={chip.key} className="gap-1 pr-1" variant="secondary">
              {chip.label}
              <button
                className="cursor-pointer rounded-full p-0.5 transition-colors hover:bg-foreground/10"
                type="button"
                onClick={chip.onRemove}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          <button
            className="ml-1 cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground"
            type="button"
            onClick={clearDraftFilters}
          >
            모두 지우기
          </button>
        </div>
      ) : null}

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
