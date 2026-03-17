import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import {
  PartsListScreen,
  type PartsListScreenFilterOptions,
  type PartsListScreenMode,
  type PartsListScreenPrimaryTab,
  type PartsListScreenQueryState,
  type PartsListScreenWorkbenchFilter,
  type PartsListTableItem,
  type PartsListTableSortKey,
  type PartsListTableSortOrder,
} from "@fabbit/components";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@fabbit/ui";

interface StoryPartRecord extends PartsListTableItem {
  bucket: "master" | PartsListScreenWorkbenchFilter;
  ownedByMe: boolean;
}

const sampleRecords = [
  {
    bucket: "master",
    category: "기구",
    childrenCount: 14,
    drawingId: "drawing-1",
    id: "part-1",
    lifecycleState: "양산",
    name: "드라이브 유닛 베이스 플레이트",
    ownedByMe: true,
    partNumber: "DRV-PLATE-0142",
    revision: "C",
  },
  {
    bucket: "master",
    category: "전장",
    childrenCount: 0,
    drawingId: "drawing-2",
    id: "part-2",
    lifecycleState: "양산",
    name: "로봇 암 전원 분배 PCB",
    ownedByMe: false,
    partNumber: "PWR-PCB-0207",
    revision: "B",
  },
  {
    bucket: "draft",
    category: "전장",
    childrenCount: 3,
    drawingId: null,
    id: "part-3",
    lifecycleState: "초안",
    name: "모터 제어 PCB",
    ownedByMe: true,
    partNumber: "CTRL-PCB-0207",
    revision: "F",
  },
  {
    bucket: "reviewing",
    category: "하네스",
    childrenCount: 2,
    drawingId: "drawing-3",
    id: "part-4",
    lifecycleState: "검토중",
    name: "메인 하네스 커넥터",
    ownedByMe: false,
    partNumber: "HAR-CONN-0081",
    revision: "B",
  },
  {
    bucket: "approved",
    category: "기구",
    childrenCount: 6,
    drawingId: "drawing-4",
    id: "part-5",
    lifecycleState: "승인완료",
    name: "지그 고정 브래킷",
    ownedByMe: true,
    partNumber: "JIG-BRKT-0311",
    revision: "A",
  },
] satisfies StoryPartRecord[];

const filterOptions = {
  categories: ["기구", "전장", "하네스"],
  lifecycleStates: ["양산", "초안", "검토중", "승인완료"],
} satisfies PartsListScreenFilterOptions;

function sortItems(items: PartsListTableItem[], sortKey: PartsListTableSortKey, sortOrder: PartsListTableSortOrder) {
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

function filterItems(items: StoryPartRecord[], queryState: PartsListScreenQueryState) {
  const normalizedQuery = queryState.query.trim().toLowerCase();

  return items.filter((item) => {
    const matchesQuery =
      !normalizedQuery ||
      item.partNumber.toLowerCase().includes(normalizedQuery) ||
      item.name?.toLowerCase().includes(normalizedQuery);
    const matchesCategory = !queryState.category || item.category === queryState.category;
    const matchesLifecycle = !queryState.lifecycleState || item.lifecycleState === queryState.lifecycleState;
    const matchesDrawing =
      queryState.hasDrawing == null ||
      (queryState.hasDrawing ? Boolean(item.drawingId) : !item.drawingId);
    const matchesChildren =
      queryState.hasChildren == null ||
      (queryState.hasChildren ? item.childrenCount > 0 : item.childrenCount === 0);
    const matchesMineOnly = !queryState.mineOnly || item.ownedByMe;

    return matchesQuery && matchesCategory && matchesLifecycle && matchesDrawing && matchesChildren && matchesMineOnly;
  });
}

function PartsListScreenStory({
  initialItems = sampleRecords,
  isLoading = false,
  mode = "change-managed",
}: {
  initialItems?: StoryPartRecord[];
  isLoading?: boolean;
  mode?: PartsListScreenMode;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activePrimaryTab, setActivePrimaryTab] = useState<PartsListScreenPrimaryTab>("master");
  const [activeWorkbenchFilter, setActiveWorkbenchFilter] = useState<PartsListScreenWorkbenchFilter>("draft");
  const [queryState, setQueryState] = useState<PartsListScreenQueryState>({
    category: null,
    cursor: null,
    cursorDirection: null,
    hasChildren: null,
    hasDrawing: null,
    lifecycleState: null,
    mineOnly: false,
    pageSize: 15,
    query: "",
    sortKey: "partNumber",
    sortOrder: "asc",
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const visibleItems = useMemo(
    () => {
      if (activePrimaryTab === "master") {
        return initialItems.filter((item) => item.bucket === "master");
      }

      if (mode === "direct") {
        if (activeWorkbenchFilter === "approved") {
          return initialItems.filter((item) => item.bucket === "approved");
        }

        return initialItems.filter((item) => item.bucket === "draft" || item.bucket === "reviewing");
      }

      return initialItems.filter((item) => item.bucket === activeWorkbenchFilter);
    },
    [activePrimaryTab, activeWorkbenchFilter, initialItems, mode],
  );

  const filteredItems = useMemo(() => filterItems(visibleItems, queryState), [queryState, visibleItems]);
  const items = useMemo(
    () => sortItems(filteredItems, queryState.sortKey, queryState.sortOrder),
    [filteredItems, queryState.sortKey, queryState.sortOrder],
  );

  return (
    <PartsListScreen
      activePrimaryTab={activePrimaryTab}
      activeWorkbenchFilter={activeWorkbenchFilter}
      filterOptions={filterOptions}
      hasNextPage
      hasPreviousPage={Boolean(queryState.cursor)}
      isExporting={false}
      isLoading={isLoading}
      items={items}
      linkDialogContent={
        isDialogOpen ? (
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>프로젝트 연결</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">선택된 부품을 프로젝트에 연결하는 다이얼로그 자리입니다.</p>
              <Badge variant="secondary">{selectedIds.size}건 선택됨</Badge>
            </CardContent>
          </Card>
        ) : null
      }
      mode={mode}
      queryState={queryState}
      selectedIds={selectedIds}
      onAllExportClick={() => undefined}
      onCategoryChange={(category) =>
        setQueryState((current) => ({ ...current, category, cursor: null, cursorDirection: null }))
      }
      onClearSelection={() => setSelectedIds(new Set())}
      onFilteredExportClick={() => undefined}
      onHasChildrenChange={(hasChildren) =>
        setQueryState((current) => ({ ...current, hasChildren, cursor: null, cursorDirection: null }))
      }
      onHasDrawingChange={(hasDrawing) =>
        setQueryState((current) => ({ ...current, hasDrawing, cursor: null, cursorDirection: null }))
      }
      onLifecycleStateChange={(lifecycleState) =>
        setQueryState((current) => ({ ...current, lifecycleState, cursor: null, cursorDirection: null }))
      }
      onLinkClick={() => setIsDialogOpen(true)}
      onMineOnlyChange={(mineOnly) =>
        setQueryState((current) => ({ ...current, mineOnly, cursor: null, cursorDirection: null }))
      }
      onNextPage={() =>
        setQueryState((current) => ({ ...current, cursor: "mock-next-cursor", cursorDirection: "next" }))
      }
      onPrimaryTabChange={(tab) => {
        setActivePrimaryTab(tab);
        setSelectedIds(new Set());
      }}
      onPreviousPage={() =>
        setQueryState((current) => ({ ...current, cursor: null, cursorDirection: null }))
      }
      onWorkbenchFilterChange={(filter) => {
        setActiveWorkbenchFilter(filter);
        setSelectedIds(new Set());
      }}
      onPageSizeChange={(pageSize) =>
        setQueryState((current) => ({ ...current, pageSize, cursor: null, cursorDirection: null }))
      }
      onQueryChange={(query) =>
        setQueryState((current) => ({ ...current, query, cursor: null, cursorDirection: null }))
      }
      onRowClick={() => undefined}
      onCreateClick={() => undefined}
      onSelectedExportClick={() => undefined}
      onSortChange={(sortKey) =>
        setQueryState((current) => ({
          ...current,
          sortKey,
          sortOrder: current.sortKey === sortKey && current.sortOrder === "asc" ? "desc" : "asc",
        }))
      }
      onTemplateAnalysisClick={() => undefined}
      onToggleSelectAll={() => {
        setSelectedIds((current) => {
          if (items.length > 0 && items.every((item) => current.has(item.id))) {
            return new Set<string>();
          }

          return new Set(items.map((item) => item.id));
        });
      }}
      onToggleSelectOne={(partId) => {
        setSelectedIds((current) => {
          const next = new Set(current);
          if (next.has(partId)) {
            next.delete(partId);
          } else {
            next.add(partId);
          }
          return next;
        });
      }}
      onUploadClick={() => undefined}
    />
  );
}

const meta = {
  title: "Components/PartsListScreen",
  component: PartsListScreenStory,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof PartsListScreenStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <PartsListScreenStory />,
};

export const DirectMode: Story = {
  render: () => <PartsListScreenStory mode="direct" />,
};

export const Loading: Story = {
  render: () => <PartsListScreenStory isLoading />,
};

export const EmptyState: Story = {
  render: () => <PartsListScreenStory initialItems={[]} />,
};
