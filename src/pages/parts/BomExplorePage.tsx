import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ChevronRight,
  ChevronDown,
  Package,
  Loader2,
  X,
  Network,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { usePartBomTree } from "@/api/hooks/useParts";
import type { BomTreeNode } from "@/api/types/parts";
import { BomToolbar } from "./bom/BomToolbar";
import type {
  BomDirection,
  BomViewType,
  BomDisplayNode,
  BomFlatRow,
} from "./bom/types";

// --- 헬퍼 ---

function LifecycleBadge({ state }: { state: string | null }) {
  if (!state) return <span className="text-muted-foreground/40">—</span>;
  const cls =
    state === "양산"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
      : state === "개발"
        ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400"
        : "border-muted bg-muted/50 text-muted-foreground";
  return (
    <Badge variant="outline" className={cn("text-[10px]", cls)}>
      {state}
    </Badge>
  );
}

// --- 사이드 패널용 타입 ---

interface PartPreview {
  partId: string | null;
  part_number: string;
  name: string | null;
  material: string | null;
  revision: string | null;
  lifecycle_state: string | null;
  unit: string | null;
  category: string | null;
}

// --- 사이드 패널 (mock) ---

function PartPreviewPanel({
  data,
  onClose,
  onNavigateDetail,
  onNavigateBom,
}: {
  data: PartPreview;
  onClose: () => void;
  onNavigateDetail: (partId: string) => void;
  onNavigateBom: (partId: string) => void;
}) {
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "품번", value: <span className="font-mono text-xs">{data.part_number}</span> },
    { label: "품명", value: data.name ?? <span className="text-muted-foreground/30">—</span> },
    { label: "리비전", value: data.revision ?? <span className="text-muted-foreground/30">—</span> },
    { label: "상태", value: <LifecycleBadge state={data.lifecycle_state} /> },
    { label: "카테고리", value: data.category ?? <span className="text-muted-foreground/30">—</span> },
    { label: "재질", value: data.material ?? <span className="text-muted-foreground/30">—</span> },
    { label: "단위", value: data.unit ?? <span className="text-muted-foreground/30">—</span> },
  ];

  return (
    <div className="w-72 shrink-0 rounded-lg border bg-card">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-medium text-foreground">부품 요약</h3>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 속성 테이블 */}
      <div className="border-b">
        <table className="w-full">
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-border/40 last:border-b-0">
                <td className="w-16 py-2 pl-4 pr-2 text-[11px] text-muted-foreground">
                  {row.label}
                </td>
                <td className="py-2 pr-4 text-sm text-foreground">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 액션 버튼 */}
      {data.partId && (
        <div className="flex flex-col gap-2 p-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-xs"
            onClick={() => onNavigateDetail(data.partId!)}
          >
            <Package className="h-3.5 w-3.5" />
            상세 페이지로 이동
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-xs"
            onClick={() => onNavigateBom(data.partId!)}
          >
            <Network className="h-3.5 w-3.5" />
            이 부품 기준 BOM 전개
          </Button>
        </div>
      )}
    </div>
  );
}

// API BomTreeNode → UI BomDisplayNode 변환
function toBomDisplayNode(
  node: BomTreeNode,
  keyPrefix = "root",
): BomDisplayNode {
  return {
    nodeKey: keyPrefix,
    partId: node.id,
    part_number: node.part_number,
    name: node.name,
    quantity: node.quantity,
    material: node.material,
    revision: node.revision,
    lifecycle_state: node.lifecycle_state,
    unit: node.unit,
    category: node.category,
    children: node.children.map((child, i) =>
      toBomDisplayNode(child, `${keyPrefix}.${i}`),
    ),
  };
}

// 트리의 모든 nodeKey 수집
function collectAllKeys(node: BomDisplayNode): string[] {
  const keys = [node.nodeKey];
  for (const child of node.children) {
    keys.push(...collectAllKeys(child));
  }
  return keys;
}

// 트리를 평탄화 (level 정보 포함)
interface FlatNode {
  node: BomDisplayNode;
  level: number;
  hasChildren: boolean;
}

function flattenTree(node: BomDisplayNode, level = 0): FlatNode[] {
  const result: FlatNode[] = [
    { node, level, hasChildren: node.children.length > 0 },
  ];
  for (const child of node.children) {
    result.push(...flattenTree(child, level + 1));
  }
  return result;
}

// 검색 매칭 노드 + 조상 nodeKey 수집
function getMatchingKeys(
  node: BomDisplayNode,
  query: string,
): Set<string> {
  const matched = new Set<string>();
  const lower = query.toLowerCase();

  function walk(n: BomDisplayNode, ancestors: string[]): boolean {
    const isMatch =
      n.part_number.toLowerCase().includes(lower) ||
      (n.name?.toLowerCase().includes(lower) ?? false);

    let childMatched = false;
    for (const child of n.children) {
      if (walk(child, [...ancestors, n.nodeKey])) {
        childMatched = true;
      }
    }

    if (isMatch || childMatched) {
      matched.add(n.nodeKey);
      for (const a of ancestors) matched.add(a);
      return true;
    }
    return false;
  }

  walk(node, []);
  return matched;
}

// Flattened 뷰용 합산
function flattenBom(node: BomDisplayNode): BomFlatRow[] {
  const map = new Map<string, BomFlatRow>();

  function walk(n: BomDisplayNode, parentQty: number) {
    const totalQty = parentQty * n.quantity;
    const existing = map.get(n.part_number);
    if (existing) {
      existing.totalQuantity += totalQty;
      existing.occurrences += 1;
    } else {
      map.set(n.part_number, {
        part_number: n.part_number,
        partId: n.partId,
        name: n.name,
        totalQuantity: totalQty,
        material: n.material,
        revision: n.revision,
        lifecycle_state: n.lifecycle_state,
        unit: n.unit,
        category: n.category,
        occurrences: 1,
      });
    }
    for (const child of n.children) walk(child, totalQty);
  }

  walk(node, 1);
  return Array.from(map.values());
}

// Single-Level 브레드크럼 경로 빌드
function findNodeByKey(
  root: BomDisplayNode,
  key: string,
): BomDisplayNode | null {
  if (root.nodeKey === key) return root;
  for (const child of root.children) {
    const found = findNodeByKey(child, key);
    if (found) return found;
  }
  return null;
}

function buildBreadcrumb(
  root: BomDisplayNode,
  targetKey: string,
): BomDisplayNode[] {
  const path: BomDisplayNode[] = [];
  function walk(n: BomDisplayNode): boolean {
    path.push(n);
    if (n.nodeKey === targetKey) return true;
    for (const child of n.children) {
      if (walk(child)) return true;
    }
    path.pop();
    return false;
  }
  walk(root);
  return path;
}

// --- 그리드 헤더/행 컬럼 정의 ---

const GRID_COLS =
  "grid-cols-[48px_minmax(240px,1fr)_80px_64px_120px_64px_80px_100px]";

function GridHeader() {
  return (
    <div
      className={cn(
        "sticky top-0 z-10 grid border-b bg-background text-[11px] font-medium text-muted-foreground",
        GRID_COLS,
      )}
    >
      <div className="px-2 py-2.5 text-center">Lv</div>
      <div className="px-3 py-2.5">품목</div>
      <div className="px-2 py-2.5 text-right">수량</div>
      <div className="px-2 py-2.5">단위</div>
      <div className="px-2 py-2.5">재질</div>
      <div className="px-2 py-2.5">Rev</div>
      <div className="px-2 py-2.5">상태</div>
      <div className="px-2 py-2.5">카테고리</div>
    </div>
  );
}

// Flattened 뷰용 헤더 (Lv 대신 출현)
function FlatGridHeader() {
  return (
    <div
      className={cn(
        "sticky top-0 z-10 grid border-b bg-background text-[11px] font-medium text-muted-foreground",
        GRID_COLS,
      )}
    >
      <div className="px-2 py-2.5 text-center">#</div>
      <div className="px-3 py-2.5">품목</div>
      <div className="px-2 py-2.5 text-right">총 수량</div>
      <div className="px-2 py-2.5">단위</div>
      <div className="px-2 py-2.5">재질</div>
      <div className="px-2 py-2.5">Rev</div>
      <div className="px-2 py-2.5">상태</div>
      <div className="px-2 py-2.5">카테고리</div>
    </div>
  );
}

// --- 트리 행 ---

function TreeRow({
  node,
  level,
  hasChildren,
  isExpanded,
  isRoot,
  onToggle,
  onSelect,
  highlight,
}: {
  node: BomDisplayNode;
  level: number;
  hasChildren: boolean;
  isExpanded: boolean;
  isRoot: boolean;
  onToggle: () => void;
  onSelect: () => void;
  highlight: boolean;
}) {
  const indent = level * 20 + 12;

  return (
    <div
      className={cn(
        "group relative grid cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/30",
        GRID_COLS,
        isRoot && "bg-muted/20",
        highlight && "bg-yellow-50 dark:bg-yellow-950/20",
      )}
      onClick={onSelect}
    >
      <div className="flex items-center justify-center px-2 py-2 text-xs text-muted-foreground">
        {level}
      </div>
      <div className="flex items-center gap-1 px-3 py-2" style={{ paddingLeft: indent }}>
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-muted"
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}
        <div className="min-w-0">
          <span className="font-mono text-xs font-medium text-foreground">
            {node.part_number}
          </span>
          {node.name && (
            <p className="truncate text-xs text-muted-foreground">
              {node.name}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end px-2 py-2 text-sm font-medium text-foreground">
        {node.quantity}
      </div>
      <div className="flex items-center px-2 py-2 text-xs text-muted-foreground">
        {node.unit ?? "—"}
      </div>
      <div className="flex items-center px-2 py-2 text-xs text-muted-foreground truncate">
        {node.material ?? "—"}
      </div>
      <div className="flex items-center px-2 py-2 text-xs text-muted-foreground">
        {node.revision ?? "—"}
      </div>
      <div className="flex items-center px-2 py-2">
        <LifecycleBadge state={node.lifecycle_state} />
      </div>
      <div className="flex items-center px-2 py-2 text-xs text-muted-foreground">
        {node.category ?? "—"}
      </div>
    </div>
  );
}

// Flattened 행
function FlatRow({
  row,
  index,
  onSelect,
  highlight,
}: {
  row: BomFlatRow;
  index: number;
  onSelect: () => void;
  highlight: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative grid cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/30",
        GRID_COLS,
        highlight && "bg-yellow-50 dark:bg-yellow-950/20",
      )}
      onClick={onSelect}
    >
      <div className="flex items-center justify-center px-2 py-2 text-xs text-muted-foreground">
        {index + 1}
      </div>
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="min-w-0">
          <span className="font-mono text-xs font-medium text-foreground">
            {row.part_number}
          </span>
          {row.name && (
            <p className="truncate text-xs text-muted-foreground">
              {row.name}
            </p>
          )}
        </div>
        {row.occurrences > 1 && (
          <Badge variant="secondary" className="shrink-0 text-[10px]">
            {row.occurrences}곳
          </Badge>
        )}
      </div>
      <div className="flex items-center justify-end px-2 py-2 text-sm font-medium text-foreground">
        {row.totalQuantity}
      </div>
      <div className="flex items-center px-2 py-2 text-xs text-muted-foreground">
        {row.unit ?? "—"}
      </div>
      <div className="flex items-center px-2 py-2 text-xs text-muted-foreground truncate">
        {row.material ?? "—"}
      </div>
      <div className="flex items-center px-2 py-2 text-xs text-muted-foreground">
        {row.revision ?? "—"}
      </div>
      <div className="flex items-center px-2 py-2">
        <LifecycleBadge state={row.lifecycle_state} />
      </div>
      <div className="flex items-center px-2 py-2 text-xs text-muted-foreground">
        {row.category ?? "—"}
      </div>
    </div>
  );
}

// --- Multi-Level 뷰 ---

function MultiLevelView({
  tree,
  searchQuery,
  expandedKeys,
  onToggle,
  onSelect,
}: {
  tree: BomDisplayNode;
  searchQuery: string;
  expandedKeys: Set<string>;
  onToggle: (key: string) => void;
  onSelect: (data: PartPreview) => void;
}) {
  const matchingKeys = useMemo(
    () => (searchQuery ? getMatchingKeys(tree, searchQuery) : null),
    [tree, searchQuery],
  );

  const flatNodes = useMemo(() => flattenTree(tree), [tree]);

  const visibleNodes = useMemo(() => {
    return flatNodes.filter((fn) => {
      // level 0 (루트의 직접 자식)은 항상 표시
      if (fn.level === 0) return true;

      // 조상이 모두 확장 상태인지 체크
      const parts = fn.node.nodeKey.split(".");
      for (let i = 1; i < parts.length - 1; i++) {
        const ancestorKey = parts.slice(0, i + 1).join(".");
        if (!expandedKeys.has(ancestorKey)) return false;
      }
      // 직접 부모도 확장 상태인지
      const parentKey = parts.slice(0, -1).join(".");
      if (!expandedKeys.has(parentKey)) return false;

      // 검색 필터
      if (matchingKeys && !matchingKeys.has(fn.node.nodeKey)) return false;

      return true;
    });
  }, [flatNodes, expandedKeys, matchingKeys]);

  return (
    <>
      <GridHeader />
      <div>
        {visibleNodes.map((fn) => (
          <TreeRow
            key={fn.node.nodeKey}
            node={fn.node}
            level={fn.level}
            hasChildren={fn.hasChildren}
            isExpanded={expandedKeys.has(fn.node.nodeKey)}
            isRoot={fn.level === 0}
            onToggle={() => onToggle(fn.node.nodeKey)}
            onSelect={() => onSelect(fn.node)}
            highlight={
              !!searchQuery &&
              (fn.node.part_number
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
                (fn.node.name
                  ?.toLowerCase()
                  .includes(searchQuery.toLowerCase()) ??
                  false))
            }
          />
        ))}
      </div>
    </>
  );
}

// --- Single-Level 뷰 ---

function SingleLevelView({
  tree,
  singleLevelRootKey,
  onDrillDown,
  searchQuery,
  onSelect,
}: {
  tree: BomDisplayNode;
  singleLevelRootKey: string;
  onDrillDown: (key: string) => void;
  searchQuery: string;
  onSelect: (data: PartPreview) => void;
}) {
  const currentNode = useMemo(
    () => findNodeByKey(tree, singleLevelRootKey) ?? tree,
    [tree, singleLevelRootKey],
  );

  const breadcrumb = useMemo(
    () => buildBreadcrumb(tree, currentNode.nodeKey),
    [tree, currentNode],
  );

  const lower = searchQuery.toLowerCase();
  const children = useMemo(() => {
    if (!searchQuery) return currentNode.children;
    return currentNode.children.filter(
      (c) =>
        c.part_number.toLowerCase().includes(lower) ||
        (c.name?.toLowerCase().includes(lower) ?? false),
    );
  }, [currentNode, searchQuery, lower]);

  return (
    <>
      {/* 브레드크럼 + 헤더 (함께 sticky) */}
      <div className="sticky top-0 z-10 bg-background">
        <div className="flex items-center gap-1 border-b px-3 py-2 text-xs">
          {breadcrumb.map((bc, i) => (
            <span key={bc.nodeKey} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
              )}
              <button
                onClick={() => onDrillDown(bc.nodeKey)}
                className={cn(
                  "rounded px-1.5 py-0.5 transition-colors hover:bg-muted",
                  i === breadcrumb.length - 1
                    ? "font-medium text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <span className="font-mono">{bc.part_number}</span>
                {bc.name && (
                  <span className="text-muted-foreground/60">
                    ({bc.name})
                  </span>
                )}
              </button>
            </span>
          ))}
        </div>
        <div
          className={cn(
            "grid border-b text-[11px] font-medium text-muted-foreground",
            GRID_COLS,
          )}
        >
          <div className="px-2 py-2.5 text-center">#</div>
          <div className="px-3 py-2.5">품목</div>
          <div className="px-2 py-2.5 text-right">수량</div>
          <div className="px-2 py-2.5">단위</div>
          <div className="px-2 py-2.5">재질</div>
          <div className="px-2 py-2.5">Rev</div>
          <div className="px-2 py-2.5">상태</div>
          <div className="px-2 py-2.5">카테고리</div>
        </div>
      </div>
      <div>
        {children.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            하위 부품이 없습니다
          </div>
        ) : (
          children.map((child, index) => (
            <div
              key={child.nodeKey}
              className={cn(
                "group relative grid cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/30",
                GRID_COLS,
              )}
              onClick={() => onSelect(child)}
            >
              <div className="flex items-center justify-center px-2 py-2 text-xs text-muted-foreground">
                {index + 1}
              </div>
              <div className="flex items-center gap-1 px-3 py-2">
                <div className="min-w-0">
                  <span className="font-mono text-xs font-medium text-foreground">
                    {child.part_number}
                  </span>
                  {child.name && (
                    <p className="truncate text-xs text-muted-foreground">
                      {child.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end px-2 py-2 text-sm font-medium text-foreground">
                {child.quantity}
              </div>
              <div className="flex items-center px-2 py-2 text-xs text-muted-foreground">
                {child.unit ?? "—"}
              </div>
              <div className="flex items-center px-2 py-2 text-xs text-muted-foreground truncate">
                {child.material ?? "—"}
              </div>
              <div className="flex items-center px-2 py-2 text-xs text-muted-foreground">
                {child.revision ?? "—"}
              </div>
              <div className="flex items-center px-2 py-2">
                <LifecycleBadge state={child.lifecycle_state} />
              </div>
              <div className="flex items-center px-2 py-2 text-xs text-muted-foreground">
                {child.category ?? "—"}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

// --- Flattened 뷰 ---

function FlattenedView({
  tree,
  searchQuery,
  onSelect,
}: {
  tree: BomDisplayNode;
  searchQuery: string;
  onSelect: (data: PartPreview) => void;
}) {
  const rows = useMemo(() => flattenBom(tree), [tree]);

  const lower = searchQuery.toLowerCase();
  const filtered = useMemo(() => {
    if (!searchQuery) return rows;
    return rows.filter(
      (r) =>
        r.part_number.toLowerCase().includes(lower) ||
        (r.name?.toLowerCase().includes(lower) ?? false),
    );
  }, [rows, searchQuery, lower]);

  return (
    <>
      <FlatGridHeader />
      <div>
        {filtered.map((row, i) => (
          <FlatRow
            key={row.part_number}
            row={row}
            index={i}
            onSelect={() => onSelect(row)}
            highlight={
              !!searchQuery &&
              (row.part_number.toLowerCase().includes(lower) ||
                (row.name?.toLowerCase().includes(lower) ?? false))
            }
          />
        ))}
      </div>
    </>
  );
}

// --- 메인 페이지 ---

export function BomExplorePage() {
  const { partId } = useParams<{ partId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [direction, setDirection] = useState<BomDirection>(
    () => (searchParams.get("direction") === "reverse" ? "reverse" : "forward"),
  );
  const [viewType, setViewType] = useState<BomViewType>("multi-level");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    () => new Set(["root"]),
  );
  const [singleLevelRootKey, setSingleLevelRootKey] = useState("root");
  const [previewNode, setPreviewNode] = useState<PartPreview | null>(null);

  const { data: bomData, isLoading, isError } = usePartBomTree(partId, direction);

  const tree = useMemo<BomDisplayNode | null>(
    () => (bomData ? toBomDisplayNode(bomData.root) : null),
    [bomData],
  );

  const totalCount = bomData?.total_count ?? 0;

  // 방향 전환 시 상태 리셋
  const handleDirectionChange = useCallback(
    (d: BomDirection) => {
      setDirection(d);
      setExpandedKeys(new Set(["root"]));
      setSingleLevelRootKey("root");
      setSearchQuery("");
    },
    [],
  );

  // 뷰 전환 시 상태 리셋
  const handleViewTypeChange = useCallback(
    (v: BomViewType) => {
      setViewType(v);
      setSingleLevelRootKey("root");
      setSearchQuery("");
    },
    [],
  );

  const handleToggle = useCallback((key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    if (tree) setExpandedKeys(new Set(collectAllKeys(tree)));
  }, [tree]);

  const handleCollapseAll = useCallback(() => {
    setExpandedKeys(new Set(["root"]));
  }, []);

  // 검색 시 매칭 노드 조상 자동 확장
  const handleSearchChange = useCallback(
    (q: string) => {
      setSearchQuery(q);
      if (q && tree) {
        const keys = getMatchingKeys(tree, q);
        setExpandedKeys((prev) => new Set([...prev, ...keys]));
      }
    },
    [tree],
  );

  // 로딩
  if (isLoading) {
    return (
      <div className="min-h-full">
        <div className="mb-4 flex items-center gap-1.5 text-sm">
          <button
            onClick={() => navigate("/parts")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            부품 관리
          </button>
          <span className="text-muted-foreground/40">/</span>
          <button
            onClick={() => partId && navigate(`/parts/${partId}`)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ...
          </button>
          <span className="text-muted-foreground/40">/</span>
          <span className="font-medium text-foreground">BOM 전개</span>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 또는 데이터 없음
  if (isError || !tree) {
    return (
      <div className="min-h-full">
        <div className="mb-4 flex items-center gap-1.5 text-sm">
          <button
            onClick={() => navigate("/parts")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            부품 관리
          </button>
          <span className="text-muted-foreground/40">/</span>
          <button
            onClick={() => partId && navigate(`/parts/${partId}`)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            알 수 없음
          </button>
          <span className="text-muted-foreground/40">/</span>
          <span className="font-medium text-foreground">BOM 전개</span>
        </div>
        <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-sm text-muted-foreground">
          <Package className="h-4 w-4" />
          BOM 데이터를 불러올 수 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* 브레드크럼 */}
      <div className="mb-4 flex items-center gap-1.5 text-sm">
        <button
          onClick={() => navigate("/parts")}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          부품 관리
        </button>
        <span className="text-muted-foreground/40">/</span>
        <button
          onClick={() => navigate(`/parts/${partId}`)}
          className="text-muted-foreground hover:text-foreground transition-colors font-mono"
        >
          {tree.part_number}
        </button>
        <span className="text-muted-foreground/40">/</span>
        <span className="font-medium text-foreground">BOM 전개</span>
      </div>

      {/* 툴바 */}
      <div className="mb-4">
        <BomToolbar
          partId={partId!}
          direction={direction}
          onDirectionChange={handleDirectionChange}
          viewType={viewType}
          onViewTypeChange={handleViewTypeChange}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
          totalCount={totalCount}
        />
      </div>

      {/* TreeGrid + 사이드 패널 영역 */}
      <div className="flex gap-4">
        <div className="min-w-0 flex-1 rounded-lg border">
          <ScrollArea className="h-[calc(100vh-280px)]">
            {viewType === "multi-level" && (
              <MultiLevelView
                tree={tree}
                searchQuery={searchQuery}
                expandedKeys={expandedKeys}
                onToggle={handleToggle}
                onSelect={setPreviewNode}
              />
            )}
            {viewType === "single-level" && (
              <SingleLevelView
                tree={tree}
                singleLevelRootKey={singleLevelRootKey}
                onDrillDown={setSingleLevelRootKey}
                searchQuery={searchQuery}
                onSelect={setPreviewNode}
              />
            )}
            {viewType === "flattened" && (
              <FlattenedView
                tree={tree}
                searchQuery={searchQuery}
                onSelect={setPreviewNode}
              />
            )}
          </ScrollArea>
        </div>

        {/* 부품 요약 사이드 패널 */}
        {previewNode && (
          <PartPreviewPanel
            data={previewNode}
            onClose={() => setPreviewNode(null)}
            onNavigateDetail={(id) => navigate(`/parts/${id}`)}
            onNavigateBom={(id) => navigate(`/parts/${id}/bom`)}
          />
        )}
      </div>
    </div>
  );
}
