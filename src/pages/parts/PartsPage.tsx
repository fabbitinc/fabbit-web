import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Upload,
  Sparkles,
  Network,
  FileText,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePartsUploadStore } from "@/stores/partsUploadStore";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { usePartFilterOptions, useParts } from "@/api";
import type { PartSummary, ListPartsParams } from "@/api";

const PAGE_SIZE_OPTIONS = ["15", "30", "50"];

type SortKey = "part_number" | "name" | "category" | "revision" | "lifecycle_state";
type SortDir = "asc" | "desc";

interface Filters {
  search: string;
  categories: Set<string>;
  lifecycleStates: Set<string>;
  hasDrawing: boolean | null;
  hasChildren: boolean | null;
}

const INITIAL_FILTERS: Filters = {
  search: "",
  categories: new Set(),
  lifecycleStates: new Set(),
  hasDrawing: null,
  hasChildren: null,
};

function cloneFilters(f: Filters): Filters {
  return { ...f, categories: new Set(f.categories), lifecycleStates: new Set(f.lifecycleStates) };
}

function filtersEqual(a: Filters, b: Filters): boolean {
  if (a.search !== b.search) return false;
  if (a.hasDrawing !== b.hasDrawing) return false;
  if (a.hasChildren !== b.hasChildren) return false;
  if (a.categories.size !== b.categories.size) return false;
  for (const v of a.categories) if (!b.categories.has(v)) return false;
  if (a.lifecycleStates.size !== b.lifecycleStates.size) return false;
  for (const v of a.lifecycleStates) if (!b.lifecycleStates.has(v)) return false;
  return true;
}

// --- 메인 컴포넌트 ---

export function PartsPage() {
  const navigate = useNavigate();
  const openPartsUploadModal = usePartsUploadStore((s) => s.openModal);

  const handleRowClick = useCallback((partId: string) => {
    navigate(`/parts/${partId}`);
  }, [navigate]);

  // 필터 옵션 (카테고리, 수명주기 DISTINCT 값)
  const { data: filterOptions } = usePartFilterOptions();
  const allCategories = filterOptions?.categories ?? [];
  const allLifecycleStates = filterOptions?.lifecycle_states ?? [];

  // draft: UI에서 편집 중인 필터 / applied: 테이블에 실제 적용된 필터
  const [draft, setDraft] = useState<Filters>(INITIAL_FILTERS);
  const [applied, setApplied] = useState<Filters>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sortKey, setSortKey] = useState<SortKey>("part_number");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // applied 필터 → API 쿼리 파라미터 변환 (서버 사이드 페이지네이션)
  // API는 category/lifecycle_state를 단일 값만 지원하므로,
  // 1개 선택 시 서버 필터링, 2개 이상 시 클라이언트 필터링
  const apiParams = useMemo<ListPartsParams>(() => {
    const params: ListPartsParams = {
      offset: (page - 1) * pageSize,
      limit: pageSize,
    };
    if (applied.search) params.search = applied.search.trim();
    if (applied.categories.size === 1) params.category = [...applied.categories][0];
    if (applied.lifecycleStates.size === 1) params.lifecycle_state = [...applied.lifecycleStates][0];
    if (applied.hasDrawing !== null) params.has_drawing = applied.hasDrawing;
    if (applied.hasChildren !== null) params.has_children = applied.hasChildren;
    return params;
  }, [applied, page, pageSize]);

  const { data: partsData, isLoading } = useParts(apiParams);
  const apiItems = partsData?.items ?? [];
  const totalCount = partsData?.total ?? 0;

  // draft와 applied가 다른지 (= 미적용 변경사항 있음)
  const hasPendingChanges = useMemo(() => !filtersEqual(draft, applied), [draft, applied]);

  // 적용된 필터 칩 목록 (applied 기준)
  // draft 기준 칩: X 누르면 칩 즉시 사라지고 검색 버튼 활성화
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];
    for (const cat of draft.categories) {
      chips.push({
        key: `cat-${cat}`,
        label: `카테고리: ${cat}`,
        onRemove: () => {
          setDraft((prev) => ({ ...prev, categories: toggleSetItem(prev.categories, cat) }));
        },
      });
    }
    for (const state of draft.lifecycleStates) {
      chips.push({
        key: `lcs-${state}`,
        label: `상태: ${state}`,
        onRemove: () => {
          setDraft((prev) => ({ ...prev, lifecycleStates: toggleSetItem(prev.lifecycleStates, state) }));
        },
      });
    }
    if (draft.hasDrawing !== null) {
      chips.push({
        key: "drawing",
        label: `도면 ${draft.hasDrawing ? "있음" : "없음"}`,
        onRemove: () => {
          setDraft((prev) => ({ ...prev, hasDrawing: null }));
        },
      });
    }
    if (draft.hasChildren !== null) {
      chips.push({
        key: "children",
        label: `하위 부품 ${draft.hasChildren ? "있음" : "없음"}`,
        onRemove: () => {
          setDraft((prev) => ({ ...prev, hasChildren: null }));
        },
      });
    }
    return chips;
  }, [draft]);

  // API 결과에 대한 클라이언트 보조 필터링 (multi-select 대응)
  const filtered = useMemo(() => {
    return apiItems.filter((item) => {
      // 카테고리 multi-select: API에서 처리 못한 경우만 클라이언트 필터
      if (applied.categories.size > 1 && (!item.category || !applied.categories.has(item.category))) return false;
      // 수명주기 multi-select
      if (applied.lifecycleStates.size > 1 && (!item.lifecycle_state || !applied.lifecycleStates.has(item.lifecycle_state))) return false;
      return true;
    });
  }, [apiItems, applied.categories, applied.lifecycleStates]);

  // 정렬 (현재 페이지 내)
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const valA = a[sortKey] ?? "";
      const valB = b[sortKey] ?? "";
      const cmp = String(valA).localeCompare(String(valB), "ko");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // 페이지네이션 (서버 사이드)
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);
  const emptyRowCount = Math.max(0, pageSize - sorted.length);

  // draft 업데이트 (UI만, 테이블 반영 안 됨)
  function updateDraft<K extends keyof Filters>(key: K, value: Filters[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function toggleSetItem(set: Set<string>, item: string): Set<string> {
    const next = new Set(set);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    return next;
  }

  // 결과 업데이트: draft → applied
  function applyFilters() {
    setApplied(cloneFilters(draft));
    setPage(1);
  }

  function clearAllFilters() {
    setDraft(INITIAL_FILTERS);
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  const draftAttrCount = (draft.hasDrawing !== null ? 1 : 0) + (draft.hasChildren !== null ? 1 : 0);

  return (
    <div className="min-h-full">
      <div className="w-full">
        {/* 헤더 */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">부품 관리</h1>
            <p className="mt-1 text-sm text-muted-foreground">조직의 전체 부품을 관리합니다</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate("/parts/templates")}
              variant="outline"
              className="ai-outline-btn ai-theme-1"
            >
              <Sparkles className="ai-outline-btn__icon h-4 w-4" />
              속성 분석
            </Button>
            <Button variant="outline" onClick={() => openPartsUploadModal()}>
              <Upload className="h-4 w-4" />
              부품 업로드
            </Button>
            <Button>
              <Plus />
              새 부품
            </Button>
          </div>
        </div>

        {/* 1행: 검색바 + 검색 버튼 + 총 건수 */}
        <div className="mb-2 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="품번, 품명으로 검색..."
              value={draft.search}
              onChange={(e) => updateDraft("search", e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") applyFilters(); }}
              className="pl-10"
            />
          </div>
          <Button
            variant={hasPendingChanges ? "default" : "outline"}
            disabled={!hasPendingChanges}
            onClick={applyFilters}
          >
            <Search className="h-4 w-4" />
            검색
          </Button>
          <span className="shrink-0 text-sm text-muted-foreground">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <><span className="font-semibold text-foreground">{totalCount}</span>건</>
            )}
          </span>
        </div>

        {/* 2행: 필터 드롭다운 + 결과 업데이트 버튼 */}
        <div className="mb-2 flex items-center gap-2">
          {/* 카테고리 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={draft.categories.size > 0 ? "border-primary/50 text-primary" : ""}
              >
                카테고리
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuLabel>카테고리</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allCategories.map((cat) => (
                <DropdownMenuCheckboxItem
                  key={cat}
                  checked={draft.categories.has(cat)}
                  onCheckedChange={() => updateDraft("categories", toggleSetItem(draft.categories, cat))}
                  onSelect={(e) => e.preventDefault()}
                >
                  {cat}
                </DropdownMenuCheckboxItem>
              ))}
              {draft.categories.size > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <button
                    onClick={() => updateDraft("categories", new Set())}
                    className="w-full px-2 py-1.5 text-left text-sm text-muted-foreground hover:text-foreground"
                  >
                    선택 해제
                  </button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 상태 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={draft.lifecycleStates.size > 0 ? "border-primary/50 text-primary" : ""}
              >
                상태
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuLabel>상태</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allLifecycleStates.map((state) => (
                <DropdownMenuCheckboxItem
                  key={state}
                  checked={draft.lifecycleStates.has(state)}
                  onCheckedChange={() => updateDraft("lifecycleStates", toggleSetItem(draft.lifecycleStates, state))}
                  onSelect={(e) => e.preventDefault()}
                >
                  {state}
                </DropdownMenuCheckboxItem>
              ))}
              {draft.lifecycleStates.size > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <button
                    onClick={() => updateDraft("lifecycleStates", new Set())}
                    className="w-full px-2 py-1.5 text-left text-sm text-muted-foreground hover:text-foreground"
                  >
                    선택 해제
                  </button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 속성 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={draftAttrCount > 0 ? "border-primary/50 text-primary" : ""}
              >
                속성
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuLabel>도면</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={draft.hasDrawing === true}
                onCheckedChange={() => updateDraft("hasDrawing", draft.hasDrawing === true ? null : true)}
                onSelect={(e) => e.preventDefault()}
              >
                도면 있음
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={draft.hasDrawing === false}
                onCheckedChange={() => updateDraft("hasDrawing", draft.hasDrawing === false ? null : false)}
                onSelect={(e) => e.preventDefault()}
              >
                도면 없음
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>하위 부품</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={draft.hasChildren === true}
                onCheckedChange={() => updateDraft("hasChildren", draft.hasChildren === true ? null : true)}
                onSelect={(e) => e.preventDefault()}
              >
                하위 부품 있음
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={draft.hasChildren === false}
                onCheckedChange={() => updateDraft("hasChildren", draft.hasChildren === false ? null : false)}
                onSelect={(e) => e.preventDefault()}
              >
                하위 부품 없음
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>

        {/* 적용된 필터 칩 */}
        {activeChips.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            {activeChips.map((chip) => (
              <Badge
                key={chip.key}
                variant="secondary"
                className="gap-1 pr-1"
              >
                {chip.label}
                <button
                  onClick={chip.onRemove}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <button
              onClick={clearAllFilters}
              className="ml-1 text-xs text-muted-foreground hover:text-foreground"
            >
              모두 지우기
            </button>
          </div>
        )}

        {/* 테이블 */}
        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col style={{ width: "12%" }} />
                <col />
                <col style={{ width: "10%" }} />
                <col style={{ width: "5%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "5%" }} />
                <col style={{ width: "8%" }} />
              </colgroup>
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <SortableHeader column="part_number" label="품번" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortableHeader column="name" label="품명" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortableHeader column="category" label="카테고리" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="center" />
                  <SortableHeader column="revision" label="Rev" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="center" />
                  <SortableHeader column="lifecycle_state" label="상태" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} align="center" />
                  <th className="py-3 px-2 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    도면
                  </th>
                  <th className="py-3 px-2 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    하위 부품
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">불러오는 중...</p>
                      </div>
                    </td>
                  </tr>
                ) : sorted.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <Search className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">검색 결과가 없습니다</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            다른 검색어를 입력하거나 필터를 조정해 보세요
                          </p>
                        </div>
                        {activeChips.length > 0 && (
                          <Button variant="outline" size="sm" onClick={clearAllFilters}>
                            필터 초기화
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {sorted.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => handleRowClick(item.id)}
                        className="group h-[45px] border-b border-border/50 transition-colors hover:bg-muted/50 cursor-pointer"
                      >
                        <td className="py-2 pl-4 pr-2 font-mono text-xs font-medium text-primary">
                          {item.part_number}
                        </td>
                        <td className="py-2 pl-4 pr-2 text-foreground">
                          {item.name ?? <span className="text-muted-foreground/40">—</span>}
                        </td>
                        <td className="py-2 px-2 text-center text-muted-foreground">
                          {item.category ?? <span className="text-muted-foreground/40">—</span>}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {item.revision ? (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-muted text-[11px] font-medium text-muted-foreground">
                              {item.revision}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {item.lifecycle_state ? (
                            <Badge
                              variant="outline"
                              className={
                                item.lifecycle_state === "양산"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                                  : item.lifecycle_state === "개발"
                                    ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400"
                                    : "border-muted bg-muted/50 text-muted-foreground"
                              }
                            >
                              {item.lifecycle_state}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {item.drawing_number ? (
                            <FileText className="mx-auto h-4 w-4 text-muted-foreground" />
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {item.children_count > 0 ? (
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                              <Network className="h-3.5 w-3.5" />
                              <span className="text-xs">{item.children_count}</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {Array.from({ length: emptyRowCount }).map((_, idx) => (
                      <tr key={`empty-row-${idx}`} className="h-[45px] border-b border-border/50">
                        <td colSpan={7} className="px-0 py-0" />
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[80px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={n}>{n}개씩</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">
                {totalCount > 0
                  ? `${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, totalCount)} / ${totalCount}건`
                  : "0건"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
              >
                <ChevronLeft />
              </Button>
              {getPageNumbers(safePage, totalPages).map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground">
                    ...
                  </span>
                ) : (
                  <Button
                    key={p}
                    variant={p === safePage ? "default" : "ghost"}
                    size="icon-sm"
                    onClick={() => setPage(p as number)}
                    className="text-xs"
                  >
                    {p}
                  </Button>
                ),
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 서브 컴포넌트 ---

// 정렬 가능한 테이블 헤더
function SortableHeader({
  column,
  label,
  sortKey,
  sortDir,
  onSort,
  align,
}: {
  column: SortKey;
  label: string;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  align?: "left" | "center";
}) {
  const isActive = sortKey === column;
  const Icon = isActive
    ? sortDir === "asc" ? ArrowUp : ArrowDown
    : ArrowUpDown;

  return (
    <th className={`py-3 px-2 ${align === "center" ? "text-center" : "pl-4"}`}>
      <button
        onClick={() => onSort(column)}
        className={`inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider transition-colors ${
          isActive
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {label}
        <Icon className={`h-3 w-3 ${isActive ? "text-primary" : "text-muted-foreground/50"}`} />
      </button>
    </th>
  );
}

// 페이지 번호 생성 (생략 부호 포함)
function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}
