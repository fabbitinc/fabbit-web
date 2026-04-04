import { useMemo, type ReactNode } from "react";
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
  DropdownMenuEmptyState,
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
import {
  PartsListModeTabs,
  type PartsListScreenMode,
  type PartsListScreenPrimaryTab,
  type PartsListScreenWorkbenchFilter,
} from "./parts-list-mode-tabs";

export interface PartsListScreenQueryState {
  query: string;
  cursor: string | null;
  cursorDirection: "next" | "prev" | null;
  pageSize: number;
  mineOnly: boolean;
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
  activePrimaryTab?: PartsListScreenPrimaryTab;
  activeWorkbenchFilter?: PartsListScreenWorkbenchFilter;
  filterOptions: PartsListScreenFilterOptions;
  header?: {
    title: string;
    description: string;
    actions?: ReactNode;
  } | null;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  isExporting: boolean;
  isLoading: boolean;
  isSearchPending?: boolean;
  items: PartsListTableItem[];
  linkDialogContent?: ReactNode;
  mode?: PartsListScreenMode;
  selectedToolbarActions?: ReactNode;
  showModeTabs?: boolean;
  onNextPage: () => void;
  onPrimaryTabChange?: (tab: PartsListScreenPrimaryTab) => void;
  onPreviousPage: () => void;
  onWorkbenchFilterChange?: (filter: PartsListScreenWorkbenchFilter) => void;
  queryState: PartsListScreenQueryState;
  searchValue?: string;
  selectedIds: Set<string>;
  onAllExportClick: () => void;
  onCategoryChange: (category: string | null) => void;
  onClearSelection: () => void;
  onCreateClick: () => void;
  onFilteredExportClick: () => void;
  onHasChildrenChange: (hasChildren: boolean | null) => void;
  onHasDrawingChange: (hasDrawing: boolean | null) => void;
  onLifecycleStateChange: (lifecycleState: string | null) => void;
  onLinkClick: () => void;
  onMineOnlyChange: (mineOnly: boolean) => void;
  onPageSizeChange: (pageSize: number) => void;
  onQueryChange: (query: string) => void;
  onRowClick: (partId: string) => void;
  onSearchValueChange?: (query: string) => void;
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

export function PartsListScreen({
  activePrimaryTab = "master",
  activeWorkbenchFilter = "draft",
  filterOptions,
  header,
  hasNextPage,
  hasPreviousPage,
  isExporting,
  isLoading,
  isSearchPending = false,
  items,
  linkDialogContent,
  mode = "change-managed",
  selectedToolbarActions,
  showModeTabs = true,
  onNextPage,
  onPrimaryTabChange,
  onPreviousPage,
  onWorkbenchFilterChange,
  queryState,
  searchValue = queryState.query,
  selectedIds,
  onAllExportClick,
  onCategoryChange,
  onClearSelection,
  onCreateClick,
  onFilteredExportClick,
  onHasChildrenChange,
  onHasDrawingChange,
  onLifecycleStateChange,
  onLinkClick,
  onMineOnlyChange,
  onPageSizeChange,
  onQueryChange,
  onRowClick,
  onSearchValueChange,
  onSelectedExportClick,
  onSortChange,
  onTemplateAnalysisClick,
  onToggleSelectAll,
  onToggleSelectOne,
  onUploadClick,
}: PartsListScreenProps) {
  const isWorkbench = activePrimaryTab === "workbench";
  const activeAttributeCount =
    (queryState.hasDrawing !== null ? 1 : 0) + (queryState.hasChildren !== null ? 1 : 0);
  const hasAppliedFilters = Boolean(
    queryState.query.trim() ||
      queryState.category ||
      queryState.lifecycleState ||
      queryState.hasDrawing !== null ||
      queryState.hasChildren !== null ||
      (isWorkbench && queryState.mineOnly),
  );

  const activeChips = useMemo<FilterChip[]>(() => {
    const chips: FilterChip[] = [];

    if (queryState.category) {
      chips.push({
        key: "category",
        label: `카테고리: ${queryState.category}`,
        onRemove: () => onCategoryChange(null),
      });
    }

    if (queryState.lifecycleState) {
      chips.push({
        key: "lifecycleState",
        label: `상태: ${queryState.lifecycleState}`,
        onRemove: () => onLifecycleStateChange(null),
      });
    }

    if (queryState.hasDrawing !== null) {
      chips.push({
        key: "hasDrawing",
        label: `도면 ${queryState.hasDrawing ? "있음" : "없음"}`,
        onRemove: () => onHasDrawingChange(null),
      });
    }

    if (queryState.hasChildren !== null) {
      chips.push({
        key: "hasChildren",
        label: `하위 부품 ${queryState.hasChildren ? "있음" : "없음"}`,
        onRemove: () => onHasChildrenChange(null),
      });
    }

    if (isWorkbench && queryState.mineOnly) {
      chips.push({
        key: "mineOnly",
        label: "내 작업만",
        onRemove: () => onMineOnlyChange(false),
      });
    }

    return chips;
  }, [
    isWorkbench,
    onCategoryChange,
    onHasChildrenChange,
    onHasDrawingChange,
    onLifecycleStateChange,
    onMineOnlyChange,
    queryState.category,
    queryState.hasChildren,
    queryState.hasDrawing,
    queryState.lifecycleState,
    queryState.mineOnly,
  ]);

  function clearDraftFilters() {
    onQueryChange("");
    onCategoryChange(null);
    onLifecycleStateChange(null);
    onHasDrawingChange(null);
    onHasChildrenChange(null);
    onMineOnlyChange(false);
  }

  const selectedCount = selectedIds.size;
  const resolvedHeader =
    header === undefined
      ? {
          title: "부품 관리",
          description: "조직의 전체 부품을 관리합니다",
          actions: (
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
          ),
        }
      : header;

  return (
    <div className="w-full">
      {resolvedHeader ? (
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">{resolvedHeader.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{resolvedHeader.description}</p>
          </div>
          {resolvedHeader.actions ?? null}
        </div>
      ) : null}

      {showModeTabs ? (
        <div className="mb-4">
          <PartsListModeTabs
            activePrimaryTab={activePrimaryTab}
            activeWorkbenchFilter={activeWorkbenchFilter}
            isMineOnly={queryState.mineOnly}
            mode={mode}
            onMineOnlyChange={onMineOnlyChange}
            onPrimaryTabChange={onPrimaryTabChange ?? (() => undefined)}
            onWorkbenchFilterChange={onWorkbenchFilterChange ?? (() => undefined)}
          />
        </div>
      ) : null}

      <div className="mb-2 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10 pr-10"
            placeholder="품번, 품명으로 검색..."
            value={searchValue}
            onChange={(event) => (onSearchValueChange ?? onQueryChange)(event.target.value)}
          />
          {isSearchPending ? (
            <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : null}
        </div>
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
            {selectedToolbarActions ?? (
              <>
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
            )}
          </>
        ) : (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className={queryState.category ? "border-primary/50 text-primary" : undefined}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  카테고리
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuLabel>카테고리</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {filterOptions.categories.length > 0 ? (
                  filterOptions.categories.map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category}
                      checked={queryState.category === category}
                      onCheckedChange={() =>
                        onCategoryChange(queryState.category === category ? null : category)
                      }
                      onSelect={(event) => event.preventDefault()}
                    >
                      {category}
                    </DropdownMenuCheckboxItem>
                  ))
                ) : (
                  <DropdownMenuEmptyState>
                    표시할 카테고리가 없습니다.
                  </DropdownMenuEmptyState>
                )}
                {queryState.category ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onCategoryChange(null)}>
                      선택 해제
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className={queryState.lifecycleState ? "border-primary/50 text-primary" : undefined}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  상태
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuLabel>상태</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {filterOptions.lifecycleStates.length > 0 ? (
                  filterOptions.lifecycleStates.map((lifecycleState) => (
                    <DropdownMenuCheckboxItem
                      key={lifecycleState}
                      checked={queryState.lifecycleState === lifecycleState}
                      onCheckedChange={() =>
                        onLifecycleStateChange(queryState.lifecycleState === lifecycleState ? null : lifecycleState)
                      }
                      onSelect={(event) => event.preventDefault()}
                    >
                      {lifecycleState}
                    </DropdownMenuCheckboxItem>
                  ))
                ) : (
                  <DropdownMenuEmptyState>
                    표시할 상태 옵션이 없습니다.
                  </DropdownMenuEmptyState>
                )}
                {queryState.lifecycleState ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onLifecycleStateChange(null)}>
                      선택 해제
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className={activeAttributeCount > 0 ? "border-primary/50 text-primary" : undefined}
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
                  checked={queryState.hasDrawing === true}
                  onCheckedChange={() => onHasDrawingChange(queryState.hasDrawing === true ? null : true)}
                  onSelect={(event) => event.preventDefault()}
                >
                  도면 있음
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={queryState.hasDrawing === false}
                  onCheckedChange={() => onHasDrawingChange(queryState.hasDrawing === false ? null : false)}
                  onSelect={(event) => event.preventDefault()}
                >
                  도면 없음
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>하위 부품</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={queryState.hasChildren === true}
                  onCheckedChange={() => onHasChildrenChange(queryState.hasChildren === true ? null : true)}
                  onSelect={(event) => event.preventDefault()}
                >
                  하위 부품 있음
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={queryState.hasChildren === false}
                  onCheckedChange={() => onHasChildrenChange(queryState.hasChildren === false ? null : false)}
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
        pageSize={queryState.pageSize}
        selectedIds={selectedIds}
        sortKey={queryState.sortKey}
        sortOrder={queryState.sortOrder}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onNextPage={onNextPage}
        onPageSizeChange={onPageSizeChange}
        onPreviousPage={onPreviousPage}
        onRowClick={onRowClick}
        onSortChange={onSortChange}
        onToggleSelectAll={onToggleSelectAll}
        onToggleSelectOne={onToggleSelectOne}
      />

      {linkDialogContent}
    </div>
  );
}
