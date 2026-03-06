import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import {
  ProjectListScreen,
  type ProjectListScreenProps,
  type ProjectListTableItem,
  type ProjectListTableQueryState,
  type ProjectListTableSortKey,
} from "@fabbit/components";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@fabbit/ui";

const sampleProjects = [
  {
    description: "모터 제어기와 연계되는 전장/기구 부품을 묶어 관리하는 프로젝트입니다.",
    id: "project-1",
    isArchived: false,
    name: "EV 모터 컨트롤러",
    partCount: 128,
    updatedAt: "2026-03-05T14:20:00.000Z",
  },
  {
    description: "배터리 하우징과 냉각 모듈 변경 흐름을 추적합니다.",
    id: "project-2",
    isArchived: false,
    name: "배터리 팩 하우징",
    partCount: 76,
    updatedAt: "2026-03-04T09:10:00.000Z",
  },
  {
    description: null,
    id: "project-3",
    isArchived: true,
    name: "레거시 인버터 플랫폼",
    partCount: 43,
    updatedAt: "2026-02-21T03:35:00.000Z",
  },
] satisfies ProjectListTableItem[];

function sortProjects(items: ProjectListTableItem[], queryState: ProjectListTableQueryState) {
  return [...items].sort((left, right) => {
    if (queryState.sortKey === "part-count") {
      return queryState.sortDirection === "asc"
        ? left.partCount - right.partCount
        : right.partCount - left.partCount;
    }

    const compared = left.name.localeCompare(right.name, "ko");
    return queryState.sortDirection === "asc" ? compared : -compared;
  });
}

function ProjectListScreenStory({
  initialItems = sampleProjects,
}: {
  initialItems?: ProjectListTableItem[];
}) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [queryState, setQueryState] = useState<ProjectListTableQueryState>({
    page: 1,
    pageSize: 15,
    query: "",
    sortDirection: "asc",
    sortKey: "name",
  });

  const filteredProjects = useMemo(() => {
    const normalizedQuery = queryState.query.trim().toLowerCase();
    const items = normalizedQuery
      ? initialItems.filter((item) => item.name.toLowerCase().includes(normalizedQuery))
      : initialItems;

    return sortProjects(items, queryState);
  }, [initialItems, queryState]);

  const args = {
    createDialogContent: isCreateDialogOpen ? (
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>프로젝트 생성</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">생성 다이얼로그는 `web2`에서 연결하고, screen은 위치만 제공합니다.</p>
          <Badge variant="secondary">Dialog Slot</Badge>
        </CardContent>
      </Card>
    ) : null,
    isError: false,
    isLoading: false,
    onCreateClick: () => setIsCreateDialogOpen(true),
    onPageChange: (page: number) => setQueryState((current) => ({ ...current, page })),
    onPageSizeChange: (pageSize: number) => setQueryState((current) => ({ ...current, page: 1, pageSize })),
    onQueryChange: (query: string) => setQueryState((current) => ({ ...current, page: 1, query })),
    onRetry: () => undefined,
    onRowClick: () => undefined,
    onSortChange: (sortKey: ProjectListTableSortKey) =>
      setQueryState((current) => ({
        ...current,
        sortDirection:
          current.sortKey === sortKey && current.sortDirection === "asc" ? "desc" : "asc",
        sortKey,
      })),
    projects: filteredProjects,
    queryState,
    totalCount: filteredProjects.length,
  } satisfies ProjectListScreenProps;

  return <ProjectListScreen {...args} />;
}

const meta = {
  title: "Components/ProjectListScreen",
  component: ProjectListScreenStory,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ProjectListScreenStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <ProjectListScreenStory />,
};

export const EmptyState: Story = {
  render: () => <ProjectListScreenStory initialItems={[]} />,
};
