import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import {
  PartsListScreen,
  type PartsListScreenFilterOptions,
  type PartsListScreenQueryState,
  type PartsListTableItem,
  type PartsListTableSortKey,
  type PartsListTableSortOrder,
} from "@fabbit/components";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@fabbit/ui";

const sampleItems = [
  {
    category: "기구",
    childrenCount: 14,
    drawingNumber: "DWG-0142",
    id: "part-1",
    lifecycleState: "양산",
    name: "드라이브 유닛 베이스 플레이트",
    partNumber: "DRV-PLATE-0142",
    revision: "C",
  },
  {
    category: "전장",
    childrenCount: 0,
    drawingNumber: null,
    id: "part-2",
    lifecycleState: "시제품",
    name: "모터 제어 PCB",
    partNumber: "CTRL-PCB-0207",
    revision: "F",
  },
  {
    category: "하네스",
    childrenCount: 2,
    drawingNumber: "DWG-0081",
    id: "part-3",
    lifecycleState: "중단",
    name: "메인 하네스 커넥터",
    partNumber: "HAR-CONN-0081",
    revision: "B",
  },
] satisfies PartsListTableItem[];

const filterOptions = {
  categories: ["기구", "전장", "하네스"],
  lifecycleStates: ["양산", "시제품", "중단"],
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

function PartsListScreenStory({
  initialItems = sampleItems,
  isLoading = false,
}: {
  initialItems?: PartsListTableItem[];
  isLoading?: boolean;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [queryState, setQueryState] = useState<PartsListScreenQueryState>({
    category: null,
    hasChildren: null,
    hasDrawing: null,
    lifecycleState: null,
    page: 1,
    pageSize: 15,
    query: "",
    sortKey: "partNumber",
    sortOrder: "asc",
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const items = useMemo(
    () => sortItems(initialItems, queryState.sortKey, queryState.sortOrder),
    [initialItems, queryState.sortKey, queryState.sortOrder],
  );

  return (
    <PartsListScreen
      filterOptions={filterOptions}
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
      queryState={queryState}
      selectedIds={selectedIds}
      totalCount={items.length}
      onAllExportClick={() => undefined}
      onCategoryChange={(category) => setQueryState((current) => ({ ...current, category }))}
      onClearSelection={() => setSelectedIds(new Set())}
      onFilteredExportClick={() => undefined}
      onHasChildrenChange={(hasChildren) => setQueryState((current) => ({ ...current, hasChildren }))}
      onHasDrawingChange={(hasDrawing) => setQueryState((current) => ({ ...current, hasDrawing }))}
      onLifecycleStateChange={(lifecycleState) => setQueryState((current) => ({ ...current, lifecycleState }))}
      onLinkClick={() => setIsDialogOpen(true)}
      onPageChange={(page) => setQueryState((current) => ({ ...current, page }))}
      onPageSizeChange={(pageSize) => setQueryState((current) => ({ ...current, pageSize }))}
      onQueryChange={(query) => setQueryState((current) => ({ ...current, page: 1, query }))}
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

export const Loading: Story = {
  render: () => <PartsListScreenStory isLoading />,
};

export const EmptyState: Story = {
  render: () => <PartsListScreenStory initialItems={[]} />,
};
