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
  FileText,
  Network,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

// --- Mock 데이터 ---

interface PartSummary {
  part_number: string;
  name: string;
  revision: string;
  material: string | null;
  category: string;
  drawing_count: number;
  child_count: number;
}

const PARTS_MOCK_ITEMS: PartSummary[] = [
  { part_number: "BRK-001", name: "브라켓 A", revision: "A", material: "SUS304", category: "기구부품", drawing_count: 2, child_count: 5 },
  { part_number: "BRK-002", name: "브라켓 B", revision: "B", material: "SUS316", category: "기구부품", drawing_count: 1, child_count: 3 },
  { part_number: "GR-001", name: "스퍼 기어", revision: "A", material: "SCM440", category: "구동부품", drawing_count: 1, child_count: 0 },
  { part_number: "GR-002", name: "헬리컬 기어", revision: "C", material: "SCM440", category: "구동부품", drawing_count: 2, child_count: 0 },
  { part_number: "MTR-001", name: "스텝 모터 42", revision: "A", material: null, category: "전자부품", drawing_count: 0, child_count: 3 },
  { part_number: "MTR-002", name: "서보 모터 60", revision: "B", material: null, category: "전자부품", drawing_count: 1, child_count: 4 },
  { part_number: "SFT-001", name: "구동축", revision: "A", material: "S45C", category: "구동부품", drawing_count: 1, child_count: 0 },
  { part_number: "SFT-002", name: "종동축", revision: "A", material: "S45C", category: "구동부품", drawing_count: 1, child_count: 0 },
  { part_number: "PLT-001", name: "베이스 플레이트", revision: "D", material: "AL6061", category: "기구부품", drawing_count: 3, child_count: 8 },
  { part_number: "PLT-002", name: "커버 플레이트", revision: "B", material: "AL5052", category: "기구부품", drawing_count: 1, child_count: 0 },
  { part_number: "HSG-001", name: "모터 하우징", revision: "A", material: "AL6061", category: "기구부품", drawing_count: 2, child_count: 6 },
  { part_number: "HSG-002", name: "기어박스 하우징", revision: "C", material: "FC250", category: "기구부품", drawing_count: 3, child_count: 12 },
  { part_number: "BRG-001", name: "볼 베어링 6205", revision: "A", material: null, category: "구매부품", drawing_count: 0, child_count: 0 },
  { part_number: "BRG-002", name: "볼 베어링 6208", revision: "A", material: null, category: "구매부품", drawing_count: 0, child_count: 0 },
  { part_number: "BLT-001", name: "육각 볼트 M8x25", revision: "A", material: "SUS304", category: "구매부품", drawing_count: 0, child_count: 0 },
  { part_number: "BLT-002", name: "육각 볼트 M10x30", revision: "A", material: "SUS304", category: "구매부품", drawing_count: 0, child_count: 0 },
  { part_number: "NUT-001", name: "육각 너트 M8", revision: "A", material: "SUS304", category: "구매부품", drawing_count: 0, child_count: 0 },
  { part_number: "PCB-001", name: "메인 제어보드", revision: "B", material: null, category: "전자부품", drawing_count: 1, child_count: 7 },
  { part_number: "PCB-002", name: "드라이버 보드", revision: "A", material: null, category: "전자부품", drawing_count: 1, child_count: 5 },
  { part_number: "SNS-001", name: "근접 센서", revision: "A", material: null, category: "전자부품", drawing_count: 0, child_count: 0 },
  { part_number: "SNS-002", name: "엔코더 센서", revision: "B", material: null, category: "전자부품", drawing_count: 0, child_count: 0 },
  { part_number: "CBL-001", name: "전원 케이블", revision: "A", material: null, category: "전자부품", drawing_count: 0, child_count: 0 },
  { part_number: "SPR-001", name: "인장 스프링", revision: "A", material: "SWP", category: "기구부품", drawing_count: 1, child_count: 0 },
  { part_number: "PIN-001", name: "다웰 핀 Ø6x20", revision: "A", material: "SUJ2", category: "구매부품", drawing_count: 0, child_count: 0 },
  { part_number: "GSK-001", name: "오링 P20", revision: "A", material: "NBR", category: "구매부품", drawing_count: 0, child_count: 0 },
  { part_number: "FRM-001", name: "프레임 조립체", revision: "B", material: "SPHC", category: "기구부품", drawing_count: 2, child_count: 15 },
];

const PAGE_SIZE_OPTIONS = ["15", "30", "50"];

// mock 데이터에서 고유값 추출
const ALL_CATEGORIES = [...new Set(PARTS_MOCK_ITEMS.map((i) => i.category))];
const ALL_MATERIALS = [...new Set(PARTS_MOCK_ITEMS.map((i) => i.material).filter(Boolean))] as string[];

type SortKey = "part_number" | "name" | "category" | "material" | "revision";
type SortDir = "asc" | "desc";

interface Filters {
  search: string;
  categories: Set<string>;
  materials: Set<string>;
  hasDrawing: boolean | null;
  hasBom: boolean | null;
}

const INITIAL_FILTERS: Filters = {
  search: "",
  categories: new Set(),
  materials: new Set(),
  hasDrawing: null,
  hasBom: null,
};

function cloneFilters(f: Filters): Filters {
  return { ...f, categories: new Set(f.categories), materials: new Set(f.materials) };
}

function filtersEqual(a: Filters, b: Filters): boolean {
  if (a.search !== b.search) return false;
  if (a.hasDrawing !== b.hasDrawing) return false;
  if (a.hasBom !== b.hasBom) return false;
  if (a.categories.size !== b.categories.size) return false;
  for (const v of a.categories) if (!b.categories.has(v)) return false;
  if (a.materials.size !== b.materials.size) return false;
  for (const v of a.materials) if (!b.materials.has(v)) return false;
  return true;
}

// --- 메인 컴포넌트 ---

export function PartsPage() {
  const navigate = useNavigate();

  const handleRowClick = useCallback((partNumber: string) => {
    navigate(`/parts/${partNumber}`);
  }, [navigate]);

  // draft: UI에서 편집 중인 필터 / applied: 테이블에 실제 적용된 필터
  const [draft, setDraft] = useState<Filters>(INITIAL_FILTERS);
  const [applied, setApplied] = useState<Filters>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sortKey, setSortKey] = useState<SortKey>("part_number");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

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
    for (const mat of draft.materials) {
      chips.push({
        key: `mat-${mat}`,
        label: `재질: ${mat}`,
        onRemove: () => {
          setDraft((prev) => ({ ...prev, materials: toggleSetItem(prev.materials, mat) }));
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
    if (draft.hasBom !== null) {
      chips.push({
        key: "bom",
        label: `BOM ${draft.hasBom ? "있음" : "없음"}`,
        onRemove: () => {
          setDraft((prev) => ({ ...prev, hasBom: null }));
        },
      });
    }
    return chips;
  }, [draft]);

  // 테이블은 applied 기준으로 필터링
  const filtered = useMemo(() => {
    return PARTS_MOCK_ITEMS.filter((item) => {
      if (applied.search) {
        const q = applied.search.trim().toLowerCase();
        if (
          !item.part_number.toLowerCase().includes(q) &&
          !item.name.toLowerCase().includes(q) &&
          !(item.material?.toLowerCase().includes(q))
        ) return false;
      }
      if (applied.categories.size > 0 && !applied.categories.has(item.category)) return false;
      if (applied.materials.size > 0 && (!item.material || !applied.materials.has(item.material))) return false;
      if (applied.hasDrawing === true && item.drawing_count === 0) return false;
      if (applied.hasDrawing === false && item.drawing_count > 0) return false;
      if (applied.hasBom === true && item.child_count === 0) return false;
      if (applied.hasBom === false && item.child_count > 0) return false;
      return true;
    });
  }, [applied]);

  // 정렬
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const valA = a[sortKey] ?? "";
      const valB = b[sortKey] ?? "";
      const cmp = String(valA).localeCompare(String(valB), "ko");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // 페이지네이션
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);
  const emptyRowCount = Math.max(0, pageSize - paged.length);

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

  const draftAttrCount = (draft.hasDrawing !== null ? 1 : 0) + (draft.hasBom !== null ? 1 : 0);

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
              onClick={() => navigate("/parts/templates?scope=master")}
              variant="outline"
              className="ai-outline-btn ai-theme-1"
            >
              <Sparkles className="ai-outline-btn__icon h-4 w-4" />
              속성 분석
            </Button>
            <Button variant="outline" onClick={() => navigate("/parts/upload?scope=master")}>
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
              placeholder="품번, 품명, 재질로 검색..."
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
            <span className="font-semibold text-foreground">{filtered.length}</span>건
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
              {ALL_CATEGORIES.map((cat) => (
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

          {/* 재질 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={draft.materials.size > 0 ? "border-primary/50 text-primary" : ""}
              >
                재질
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuLabel>재질</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ALL_MATERIALS.map((mat) => (
                <DropdownMenuCheckboxItem
                  key={mat}
                  checked={draft.materials.has(mat)}
                  onCheckedChange={() => updateDraft("materials", toggleSetItem(draft.materials, mat))}
                  onSelect={(e) => e.preventDefault()}
                >
                  {mat}
                </DropdownMenuCheckboxItem>
              ))}
              {draft.materials.size > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <button
                    onClick={() => updateDraft("materials", new Set())}
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
              <DropdownMenuLabel>BOM</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={draft.hasBom === true}
                onCheckedChange={() => updateDraft("hasBom", draft.hasBom === true ? null : true)}
                onSelect={(e) => e.preventDefault()}
              >
                BOM 있음
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={draft.hasBom === false}
                onCheckedChange={() => updateDraft("hasBom", draft.hasBom === false ? null : false)}
                onSelect={(e) => e.preventDefault()}
              >
                BOM 없음
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
                <col style={{ width: "14%" }} />
                <col />
                <col style={{ width: "12%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "7%" }} />
                <col style={{ width: "7%" }} />
                <col style={{ width: "7%" }} />
              </colgroup>
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <SortableHeader column="part_number" label="품번" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortableHeader column="name" label="품명" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortableHeader column="category" label="카테고리" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortableHeader column="material" label="재질" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortableHeader column="revision" label="Rev" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <th className="py-3 pl-4 pr-2 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    도면
                  </th>
                  <th className="py-3 pl-4 pr-2 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    BOM
                  </th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
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
                    {paged.map((item) => (
                      <tr
                        key={item.part_number}
                        onClick={() => handleRowClick(item.part_number)}
                        className="group h-[45px] border-b border-border/50 transition-colors hover:bg-muted/50 cursor-pointer"
                      >
                        <td className="py-2 pl-4 pr-2 font-mono text-xs font-medium text-primary">
                          {item.part_number}
                        </td>
                        <td className="py-2 pl-4 pr-2 text-foreground">
                          {item.name}
                        </td>
                        <td className="py-2 pl-4 pr-2 text-muted-foreground">
                          {item.category}
                        </td>
                        <td className="py-2 pl-4 pr-2 text-muted-foreground">
                          {item.material ?? <span className="text-muted-foreground/40">—</span>}
                        </td>
                        <td className="py-2 pl-4 pr-2 text-center">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-muted text-[11px] font-medium text-muted-foreground">
                            {item.revision}
                          </span>
                        </td>
                        <td className="py-2 pl-4 pr-2 text-center">
                          {item.drawing_count > 0 ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex items-center gap-1 text-muted-foreground">
                                  <FileText className="h-3.5 w-3.5" />
                                  <span className="text-xs">{item.drawing_count}</span>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>도면 {item.drawing_count}건</TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </td>
                        <td className="py-2 pl-4 pr-2 text-center">
                          {item.child_count > 0 ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex items-center gap-1 text-muted-foreground">
                                  <Network className="h-3.5 w-3.5" />
                                  <span className="text-xs">{item.child_count}</span>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>하위 부품 {item.child_count}건</TooltipContent>
                            </Tooltip>
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
                {sorted.length > 0
                  ? `${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, sorted.length)} / ${sorted.length}건`
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
}: {
  column: SortKey;
  label: string;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const isActive = sortKey === column;
  const Icon = isActive
    ? sortDir === "asc" ? ArrowUp : ArrowDown
    : ArrowUpDown;

  return (
    <th className="py-3 pl-4 pr-2">
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
