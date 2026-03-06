import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Download,
  Loader2,
  Network,
  Package,
  Search,
  X,
} from "lucide-react";
import {
  Badge,
  Button,
  Input,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fabbit/ui";
import { cn } from "@/lib/utils";
import { useExportPartBomAction } from "@/features/parts/hooks/use-export-part-bom-action";
import { usePartBomTreeQuery } from "@/features/parts/hooks/use-part-bom-tree-query";
import type {
  PartBomDirection,
  PartBomDisplayNodeModel,
  PartBomExploreView,
  PartBomFlatRowModel,
  PartBomTreeNodeModel,
} from "@/features/parts/types/parts-model";

interface BomExploreScreenProps {
  partId: string;
  direction: PartBomDirection;
  viewType: PartBomExploreView;
  searchQuery: string;
  singleLevelRootKey: string;
  onDirectionChange: (direction: PartBomDirection) => void;
  onViewTypeChange: (viewType: PartBomExploreView) => void;
  onSearchChange: (query: string) => void;
  onSingleLevelRootKeyChange: (nodeKey: string) => void;
}

interface PartPreview {
  partId: string | null;
  partNumber: string;
  name: string | null;
  material: string | null;
  revision: string | null;
  lifecycleState: string | null;
  unit: string | null;
  category: string | null;
}

const GRID_COLS = "grid-cols-[48px_minmax(240px,1fr)_80px_64px_120px_64px_80px_100px]";

export function BomExploreScreen({
  partId,
  direction,
  viewType,
  searchQuery,
  singleLevelRootKey,
  onDirectionChange,
  onViewTypeChange,
  onSearchChange,
  onSingleLevelRootKeyChange,
}: BomExploreScreenProps) {
  const navigate = useNavigate();
  const bomTreeQuery = usePartBomTreeQuery(partId, direction);
  const exportBomAction = useExportPartBomAction(partId);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set(["root"]));
  const [previewNode, setPreviewNode] = useState<PartPreview | null>(null);

  const tree = useMemo<PartBomDisplayNodeModel | null>(() => {
    if (!bomTreeQuery.data) {
      return null;
    }

    return toBomDisplayNode(bomTreeQuery.data.root);
  }, [bomTreeQuery.data]);

  useEffect(() => {
    setExpandedKeys(new Set(["root"]));
    setPreviewNode(null);
  }, [direction, partId, viewType]);

  const handleExpandAll = useCallback(() => {
    if (!tree) {
      return;
    }

    setExpandedKeys(new Set(collectAllKeys(tree)));
  }, [tree]);

  const handleCollapseAll = useCallback(() => {
    setExpandedKeys(new Set(["root"]));
  }, []);

  const handleSearchInputChange = useCallback(
    (nextQuery: string) => {
      onSearchChange(nextQuery);

      if (nextQuery && tree) {
        const matchingKeys = getMatchingKeys(tree, nextQuery);
        setExpandedKeys((previous) => new Set([...previous, ...matchingKeys]));
      }
    },
    [onSearchChange, tree],
  );

  if (bomTreeQuery.isLoading) {
    return (
      <section className="app-panel rounded-[32px] p-8 text-center">
        <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">BOM 데이터를 불러오는 중입니다.</p>
      </section>
    );
  }

  if (bomTreeQuery.isError || !tree) {
    return (
      <section className="app-panel rounded-[32px] p-8 text-center">
        <Package className="mx-auto size-6 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">BOM 데이터를 불러올 수 없습니다.</p>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="app-panel rounded-[32px] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Network className="size-3.5" />
              BOM
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">BOM 탐색</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              <span className="font-mono text-foreground">{tree.partNumber}</span>
              {tree.name ? ` · ${tree.name}` : ""} 기준으로 BOM 구조를 탐색합니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate(`/parts/${partId}`)}>
              상세로 돌아가기
            </Button>
          </div>
        </div>
      </section>

      <section className="app-panel rounded-[32px] p-5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-2xl border border-border">
            <button
              type="button"
              onClick={() => onDirectionChange("forward")}
              className={cn(
                "cursor-pointer rounded-l-2xl px-3 py-2 text-xs font-medium transition-colors",
                direction === "forward" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/60",
              )}
            >
              <ChevronRight className="mr-1 inline size-3" />
              정전개
            </button>
            <button
              type="button"
              onClick={() => onDirectionChange("reverse")}
              className={cn(
                "cursor-pointer border-l border-border px-3 py-2 text-xs font-medium transition-colors",
                direction === "reverse" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/60",
              )}
            >
              <ChevronDown className="mr-1 inline size-3 rotate-180" />
              역전개
            </button>
          </div>

          <Select value={viewType} onValueChange={(value) => onViewTypeChange(value as PartBomExploreView)}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multi-level">Multi-Level</SelectItem>
              <SelectItem value="single-level">Single-Level</SelectItem>
              <SelectItem value="flattened">Flattened</SelectItem>
            </SelectContent>
          </Select>

          {viewType === "multi-level" && (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={handleExpandAll}>
                <ChevronsUpDown className="mr-1 size-3.5" />
                모두 펼치기
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCollapseAll}>
                모두 접기
              </Button>
            </div>
          )}

          <div className="relative ml-auto min-w-[220px] flex-1 xl:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => handleSearchInputChange(event.target.value)}
              placeholder="품번 또는 품명 검색"
              className="pl-10"
            />
          </div>

          <span className="text-xs text-muted-foreground">총 {bomTreeQuery.data?.totalCount ?? 0}개 부품</span>

          <Button
            variant="outline"
            size="sm"
            disabled={exportBomAction.isPending}
            onClick={() => exportBomAction.mutate({ direction })}
          >
            {exportBomAction.isPending ? (
              <Loader2 className="mr-1 size-3.5 animate-spin" />
            ) : (
              <Download className="mr-1 size-3.5" />
            )}
            내려받기
          </Button>
        </div>
      </section>

      <div className="flex gap-4">
        <section className="app-panel min-w-0 flex-1 overflow-hidden rounded-[32px]">
          <ScrollArea className="h-[calc(100vh-290px)]">
            {viewType === "multi-level" ? (
              <MultiLevelView
                tree={tree}
                searchQuery={searchQuery}
                expandedKeys={expandedKeys}
                onToggle={(nodeKey) => {
                  setExpandedKeys((previous) => {
                    const next = new Set(previous);
                    if (next.has(nodeKey)) {
                      next.delete(nodeKey);
                    } else {
                      next.add(nodeKey);
                    }
                    return next;
                  });
                }}
                onSelect={setPreviewNode}
              />
            ) : null}

            {viewType === "single-level" ? (
              <SingleLevelView
                tree={tree}
                singleLevelRootKey={singleLevelRootKey}
                searchQuery={searchQuery}
                onDrillDown={onSingleLevelRootKeyChange}
                onSelect={setPreviewNode}
              />
            ) : null}

            {viewType === "flattened" ? (
              <FlattenedView
                tree={tree}
                searchQuery={searchQuery}
                onSelect={setPreviewNode}
              />
            ) : null}
          </ScrollArea>
        </section>

        {previewNode ? (
          <PartPreviewPanel
            data={previewNode}
            onClose={() => setPreviewNode(null)}
            onNavigateDetail={(targetPartId) => navigate(`/parts/${targetPartId}`)}
            onNavigateBom={(targetPartId) => navigate(`/parts/${targetPartId}/bom`)}
          />
        ) : null}
      </div>
    </div>
  );
}

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
  const rows: Array<{ label: string; value: React.ReactNode }> = [
    { label: "품번", value: <span className="font-mono text-xs">{data.partNumber}</span> },
    { label: "품명", value: data.name ?? <Dash /> },
    { label: "리비전", value: data.revision ?? <Dash /> },
    { label: "상태", value: <LifecycleBadge state={data.lifecycleState} /> },
    { label: "카테고리", value: data.category ?? <Dash /> },
    { label: "재질", value: data.material ?? <Dash /> },
    { label: "단위", value: data.unit ?? <Dash /> },
  ];

  return (
    <section className="app-panel w-72 shrink-0 rounded-[32px] p-0">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-medium text-foreground">부품 요약</h3>
        <button
          type="button"
          onClick={onClose}
          className="flex size-7 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <table className="w-full">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-border/50 last:border-b-0">
              <td className="w-20 py-2 pl-4 pr-2 text-[11px] text-muted-foreground">{row.label}</td>
              <td className="py-2 pr-4 text-sm text-foreground">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {data.partId ? (
        <div className="flex flex-col gap-2 p-4">
          <Button variant="outline" size="sm" className="justify-start" onClick={() => onNavigateDetail(data.partId!)}>
            <Package className="size-4" />
            상세 페이지로 이동
          </Button>
          <Button variant="outline" size="sm" className="justify-start" onClick={() => onNavigateBom(data.partId!)}>
            <Network className="size-4" />
            이 부품 기준 BOM 전개
          </Button>
        </div>
      ) : null}
    </section>
  );
}

function GridHeader() {
  return (
    <div className={cn("sticky top-0 z-10 grid border-b border-border bg-background text-[11px] font-medium text-muted-foreground", GRID_COLS)}>
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

function FlatGridHeader() {
  return (
    <div className={cn("sticky top-0 z-10 grid border-b border-border bg-background text-[11px] font-medium text-muted-foreground", GRID_COLS)}>
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

function MultiLevelView({
  tree,
  searchQuery,
  expandedKeys,
  onToggle,
  onSelect,
}: {
  tree: PartBomDisplayNodeModel;
  searchQuery: string;
  expandedKeys: Set<string>;
  onToggle: (nodeKey: string) => void;
  onSelect: (preview: PartPreview) => void;
}) {
  const matchingKeys = useMemo(
    () => (searchQuery ? getMatchingKeys(tree, searchQuery) : null),
    [searchQuery, tree],
  );
  const flatNodes = useMemo(() => flattenTree(tree), [tree]);

  const visibleNodes = useMemo(() => {
    return flatNodes.filter((flatNode) => {
      if (flatNode.level === 0) {
        return true;
      }

      const parts = flatNode.node.nodeKey.split(".");
      for (let index = 1; index < parts.length - 1; index += 1) {
        const ancestorKey = parts.slice(0, index + 1).join(".");
        if (!expandedKeys.has(ancestorKey)) {
          return false;
        }
      }

      const parentKey = parts.slice(0, -1).join(".");
      if (!expandedKeys.has(parentKey)) {
        return false;
      }

      if (matchingKeys && !matchingKeys.has(flatNode.node.nodeKey)) {
        return false;
      }

      return true;
    });
  }, [expandedKeys, flatNodes, matchingKeys]);

  return (
    <>
      <GridHeader />
      <div>
        {visibleNodes.map((flatNode) => (
          <TreeRow
            key={flatNode.node.nodeKey}
            node={flatNode.node}
            level={flatNode.level}
            hasChildren={flatNode.hasChildren}
            isExpanded={expandedKeys.has(flatNode.node.nodeKey)}
            isRoot={flatNode.level === 0}
            onToggle={() => onToggle(flatNode.node.nodeKey)}
            onSelect={() => onSelect(toPartPreview(flatNode.node))}
            highlight={
              !!searchQuery &&
              (flatNode.node.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (flatNode.node.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false))
            }
          />
        ))}
      </div>
    </>
  );
}

function SingleLevelView({
  tree,
  singleLevelRootKey,
  searchQuery,
  onDrillDown,
  onSelect,
}: {
  tree: PartBomDisplayNodeModel;
  singleLevelRootKey: string;
  searchQuery: string;
  onDrillDown: (nodeKey: string) => void;
  onSelect: (preview: PartPreview) => void;
}) {
  const currentNode = useMemo(
    () => findNodeByKey(tree, singleLevelRootKey) ?? tree,
    [singleLevelRootKey, tree],
  );

  const breadcrumb = useMemo(
    () => buildBreadcrumb(tree, currentNode.nodeKey),
    [currentNode.nodeKey, tree],
  );

  const filteredChildren = useMemo(() => {
    if (!searchQuery) {
      return currentNode.children;
    }

    const lower = searchQuery.toLowerCase();
    return currentNode.children.filter(
      (child) =>
        child.partNumber.toLowerCase().includes(lower) ||
        (child.name?.toLowerCase().includes(lower) ?? false),
    );
  }, [currentNode.children, searchQuery]);

  return (
    <>
      <div className="sticky top-0 z-10 bg-background">
        <div className="flex items-center gap-1 border-b border-border px-3 py-2 text-xs">
          {breadcrumb.map((item, index) => (
            <span key={item.nodeKey} className="flex items-center gap-1">
              {index > 0 ? <ChevronRight className="size-3 text-muted-foreground/50" /> : null}
              <button
                type="button"
                onClick={() => onDrillDown(item.nodeKey)}
                className={cn(
                  "cursor-pointer rounded px-1.5 py-0.5 transition-colors hover:bg-muted",
                  index === breadcrumb.length - 1 ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                <span className="font-mono">{item.partNumber}</span>
                {item.name ? <span className="text-muted-foreground/60"> ({item.name})</span> : null}
              </button>
            </span>
          ))}
        </div>
        <div className={cn("grid border-b border-border text-[11px] font-medium text-muted-foreground", GRID_COLS)}>
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

      {filteredChildren.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
          <Package className="size-4" />
          하위 부품이 없습니다.
        </div>
      ) : (
        filteredChildren.map((child, index) => (
          <div
            key={child.nodeKey}
            className={cn("group relative grid cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/30", GRID_COLS)}
            onClick={() => onSelect(toPartPreview(child))}
          >
            <div className="flex items-center justify-center px-2 py-2 text-xs text-muted-foreground">{index + 1}</div>
            <div className="flex items-center gap-1 px-3 py-2">
              <div className="min-w-0">
                <span className="font-mono text-xs font-medium text-foreground">{child.partNumber}</span>
                {child.name ? <p className="truncate text-xs text-muted-foreground">{child.name}</p> : null}
              </div>
            </div>
            <div className="flex items-center justify-end px-2 py-2 text-sm font-medium text-foreground">{child.quantity}</div>
            <div className="flex items-center px-2 py-2 text-xs text-muted-foreground">{child.unit ?? "—"}</div>
            <div className="flex items-center truncate px-2 py-2 text-xs text-muted-foreground">{child.material ?? "—"}</div>
            <div className="flex items-center px-2 py-2 text-xs text-muted-foreground">{child.revision ?? "—"}</div>
            <div className="flex items-center px-2 py-2">
              <LifecycleBadge state={child.lifecycleState} />
            </div>
            <div className="flex items-center px-2 py-2 text-xs text-muted-foreground">{child.category ?? "—"}</div>
          </div>
        ))
      )}
    </>
  );
}

function FlattenedView({
  tree,
  searchQuery,
  onSelect,
}: {
  tree: PartBomDisplayNodeModel;
  searchQuery: string;
  onSelect: (preview: PartPreview) => void;
}) {
  const rows = useMemo(() => flattenBom(tree), [tree]);

  const filteredRows = useMemo(() => {
    if (!searchQuery) {
      return rows;
    }

    const lower = searchQuery.toLowerCase();
    return rows.filter(
      (row) =>
        row.partNumber.toLowerCase().includes(lower) ||
        (row.name?.toLowerCase().includes(lower) ?? false),
    );
  }, [rows, searchQuery]);

  return (
    <>
      <FlatGridHeader />
      <div>
        {filteredRows.map((row, index) => (
          <div
            key={row.partNumber}
            className={cn("group relative grid cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/30", GRID_COLS)}
            onClick={() => onSelect(toFlatRowPreview(row))}
          >
            <div className="flex items-center justify-center px-2 py-2 text-xs text-muted-foreground">{index + 1}</div>
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="min-w-0">
                <span className="font-mono text-xs font-medium text-foreground">{row.partNumber}</span>
                {row.name ? <p className="truncate text-xs text-muted-foreground">{row.name}</p> : null}
              </div>
              {row.occurrences > 1 ? <Badge variant="secondary">{row.occurrences}곳</Badge> : null}
            </div>
            <div className="flex items-center justify-end px-2 py-2 text-sm font-medium text-foreground">{row.totalQuantity}</div>
            <div className="flex items-center px-2 py-2 text-xs text-muted-foreground">{row.unit ?? "—"}</div>
            <div className="flex items-center truncate px-2 py-2 text-xs text-muted-foreground">{row.material ?? "—"}</div>
            <div className="flex items-center px-2 py-2 text-xs text-muted-foreground">{row.revision ?? "—"}</div>
            <div className="flex items-center px-2 py-2">
              <LifecycleBadge state={row.lifecycleState} />
            </div>
            <div className="flex items-center px-2 py-2 text-xs text-muted-foreground">{row.category ?? "—"}</div>
          </div>
        ))}
      </div>
    </>
  );
}

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
  node: PartBomDisplayNodeModel;
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
        highlight && "bg-primary/5",
      )}
      onClick={onSelect}
    >
      <div className="flex items-center justify-center px-2 py-2 text-xs text-muted-foreground">{level}</div>
      <div className="flex items-center gap-1 px-3 py-2" style={{ paddingLeft: indent }}>
        {hasChildren ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
            }}
            className="flex size-5 cursor-pointer items-center justify-center rounded hover:bg-muted"
          >
            {isExpanded ? (
              <ChevronDown className="size-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="size-3.5 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}
        <div className="min-w-0">
          <span className="font-mono text-xs font-medium text-foreground">{node.partNumber}</span>
          {node.name ? <p className="truncate text-xs text-muted-foreground">{node.name}</p> : null}
        </div>
      </div>
      <div className="flex items-center justify-end px-2 py-2 text-sm font-medium text-foreground">{node.quantity}</div>
      <div className="flex items-center px-2 py-2 text-xs text-muted-foreground">{node.unit ?? "—"}</div>
      <div className="flex items-center truncate px-2 py-2 text-xs text-muted-foreground">{node.material ?? "—"}</div>
      <div className="flex items-center px-2 py-2 text-xs text-muted-foreground">{node.revision ?? "—"}</div>
      <div className="flex items-center px-2 py-2">
        <LifecycleBadge state={node.lifecycleState} />
      </div>
      <div className="flex items-center px-2 py-2 text-xs text-muted-foreground">{node.category ?? "—"}</div>
    </div>
  );
}

function LifecycleBadge({ state }: { state: string | null }) {
  if (!state) {
    return <Dash />;
  }

  const className =
    state === "양산"
      ? "border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success)]"
      : state === "개발"
        ? "border-primary/20 bg-primary/10 text-primary"
        : "border-border bg-muted/40 text-muted-foreground";

  return (
    <Badge variant="outline" className={className}>
      {state}
    </Badge>
  );
}

function Dash() {
  return <span className="text-muted-foreground/40">—</span>;
}

function toBomDisplayNode(node: PartBomTreeNodeModel, keyPrefix = "root"): PartBomDisplayNodeModel {
  return {
    nodeKey: keyPrefix,
    partId: node.id,
    partNumber: node.partNumber,
    name: node.name,
    quantity: node.quantity,
    material: node.material,
    revision: node.revision,
    lifecycleState: node.lifecycleState,
    unit: node.unit,
    category: node.category,
    children: node.children.map((child, index) => toBomDisplayNode(child, `${keyPrefix}.${index}`)),
  };
}

function toPartPreview(node: PartBomDisplayNodeModel): PartPreview {
  return {
    partId: node.partId,
    partNumber: node.partNumber,
    name: node.name,
    material: node.material,
    revision: node.revision,
    lifecycleState: node.lifecycleState,
    unit: node.unit,
    category: node.category,
  };
}

function toFlatRowPreview(row: PartBomFlatRowModel): PartPreview {
  return {
    partId: row.partId,
    partNumber: row.partNumber,
    name: row.name,
    material: row.material,
    revision: row.revision,
    lifecycleState: row.lifecycleState,
    unit: row.unit,
    category: row.category,
  };
}

function collectAllKeys(node: PartBomDisplayNodeModel): string[] {
  const keys = [node.nodeKey];
  for (const child of node.children) {
    keys.push(...collectAllKeys(child));
  }
  return keys;
}

function flattenTree(node: PartBomDisplayNodeModel, level = 0): Array<{ node: PartBomDisplayNodeModel; level: number; hasChildren: boolean }> {
  const result = [{ node, level, hasChildren: node.children.length > 0 }];
  for (const child of node.children) {
    result.push(...flattenTree(child, level + 1));
  }
  return result;
}

function getMatchingKeys(node: PartBomDisplayNodeModel, query: string) {
  const matched = new Set<string>();
  const lower = query.toLowerCase();

  function walk(currentNode: PartBomDisplayNodeModel, ancestors: string[]): boolean {
    const isMatch =
      currentNode.partNumber.toLowerCase().includes(lower) ||
      (currentNode.name?.toLowerCase().includes(lower) ?? false);

    let childMatched = false;
    for (const child of currentNode.children) {
      if (walk(child, [...ancestors, currentNode.nodeKey])) {
        childMatched = true;
      }
    }

    if (isMatch || childMatched) {
      matched.add(currentNode.nodeKey);
      ancestors.forEach((ancestor) => matched.add(ancestor));
      return true;
    }

    return false;
  }

  walk(node, []);
  return matched;
}

function flattenBom(node: PartBomDisplayNodeModel): PartBomFlatRowModel[] {
  const map = new Map<string, PartBomFlatRowModel>();

  function walk(currentNode: PartBomDisplayNodeModel, parentQuantity: number) {
    const totalQuantity = parentQuantity * currentNode.quantity;
    const existing = map.get(currentNode.partNumber);
    if (existing) {
      existing.totalQuantity += totalQuantity;
      existing.occurrences += 1;
    } else {
      map.set(currentNode.partNumber, {
        partNumber: currentNode.partNumber,
        partId: currentNode.partId,
        name: currentNode.name,
        totalQuantity,
        material: currentNode.material,
        revision: currentNode.revision,
        lifecycleState: currentNode.lifecycleState,
        unit: currentNode.unit,
        category: currentNode.category,
        occurrences: 1,
      });
    }

    currentNode.children.forEach((child) => walk(child, totalQuantity));
  }

  walk(node, 1);
  return Array.from(map.values());
}

function findNodeByKey(root: PartBomDisplayNodeModel, key: string): PartBomDisplayNodeModel | null {
  if (root.nodeKey === key) {
    return root;
  }

  for (const child of root.children) {
    const found = findNodeByKey(child, key);
    if (found) {
      return found;
    }
  }

  return null;
}

function buildBreadcrumb(root: PartBomDisplayNodeModel, targetKey: string) {
  const path: PartBomDisplayNodeModel[] = [];

  function walk(node: PartBomDisplayNodeModel): boolean {
    path.push(node);
    if (node.nodeKey === targetKey) {
      return true;
    }

    for (const child of node.children) {
      if (walk(child)) {
        return true;
      }
    }

    path.pop();
    return false;
  }

  walk(root);
  return path;
}
