import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import {
  PartsListTable,
  type PartsListTableItem,
  type PartsListTableSortKey,
  type PartsListTableSortOrder,
} from "@fabbit/components";

const sampleItems = [
  {
    id: "part-1",
    partNumber: "DRV-PLATE-0142",
    name: "드라이브 유닛 베이스 플레이트",
    category: "기구",
    revision: "C",
    lifecycleState: "양산",
    drawingNumber: "DWG-0142",
    childrenCount: 14,
  },
  {
    id: "part-2",
    partNumber: "CTRL-PCB-0207",
    name: "모터 제어 PCB",
    category: "전장",
    revision: "F",
    lifecycleState: "시제품",
    drawingNumber: null,
    childrenCount: 0,
  },
  {
    id: "part-3",
    partNumber: "HAR-CONN-0081",
    name: "메인 하네스 커넥터",
    category: "하네스",
    revision: "B",
    lifecycleState: "중단",
    drawingNumber: "DWG-0081",
    childrenCount: 2,
  },
] satisfies PartsListTableItem[];

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

function PartsListTableStory({
  initialItems = sampleItems,
  isLoading = false,
  totalCount = sampleItems.length,
}: {
  initialItems?: PartsListTableItem[];
  isLoading?: boolean;
  totalCount?: number;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortKey, setSortKey] = useState<PartsListTableSortKey>("partNumber");
  const [sortOrder, setSortOrder] = useState<PartsListTableSortOrder>("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const items = useMemo(() => sortItems(initialItems, sortKey, sortOrder), [initialItems, sortKey, sortOrder]);

  return (
    <PartsListTable
      isLoading={isLoading}
      items={items}
      page={page}
      pageSize={pageSize}
      selectedIds={selectedIds}
      sortKey={sortKey}
      sortOrder={sortOrder}
      totalCount={totalCount}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      onRowClick={() => undefined}
      onSortChange={(nextSortKey) => {
        setSortOrder((current) => (sortKey === nextSortKey && current === "asc" ? "desc" : "asc"));
        setSortKey(nextSortKey);
      }}
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
    />
  );
}

const meta = {
  title: "Components/PartsListTable",
  component: PartsListTableStory,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof PartsListTableStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <PartsListTableStory />,
};

export const Loading: Story = {
  render: () => <PartsListTableStory isLoading />,
};

export const EmptyState: Story = {
  render: () => <PartsListTableStory initialItems={[]} totalCount={0} />,
};

export const Showcase: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">기본 목록</p>
        <PartsListTableStory />
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">로딩 상태</p>
        <PartsListTableStory isLoading />
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">빈 상태</p>
        <PartsListTableStory initialItems={[]} totalCount={0} />
      </div>
    </div>
  ),
};
