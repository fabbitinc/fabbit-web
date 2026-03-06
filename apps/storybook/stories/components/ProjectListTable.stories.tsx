import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ProjectListTable, type ProjectListTableProps, type ProjectListTableQueryState } from "@fabbit/components";

const sampleProjects = [
  {
    id: "p-1",
    name: "인버터 모듈 개선",
    description: "양산 전 BOM과 도면 정합성을 재검토하는 프로젝트입니다.",
    partCount: 148,
    isArchived: false,
    updatedAt: "2026-03-02T09:30:00Z",
  },
  {
    id: "p-2",
    name: "프레스 금형 전환",
    description: "프레스 라인 금형 교체와 부품 승인 플로우를 정리합니다.",
    partCount: 86,
    isArchived: false,
    updatedAt: "2026-02-25T14:10:00Z",
  },
  {
    id: "p-3",
    name: "공급사 이관 검토",
    description: null,
    partCount: 42,
    isArchived: true,
    updatedAt: "2026-01-18T03:20:00Z",
  },
] satisfies ProjectListTableProps["projects"];

function ProjectListTableStory({
  initialQueryState,
  totalCount = sampleProjects.length,
  projects = sampleProjects,
  isError = false,
  isLoading = false,
}: {
  initialQueryState?: ProjectListTableQueryState;
  totalCount?: number;
  projects?: ProjectListTableProps["projects"];
  isError?: boolean;
  isLoading?: boolean;
}) {
  const [queryState, setQueryState] = useState<ProjectListTableQueryState>(
    initialQueryState ?? {
      query: "",
      page: 1,
      pageSize: 15,
      sortKey: "name",
      sortDirection: "asc",
    },
  );

  return (
    <ProjectListTable
      isError={isError}
      isLoading={isLoading}
      projects={projects}
      queryState={queryState}
      totalCount={totalCount}
      onCreateClick={() => undefined}
      onPageChange={(page) => setQueryState((current) => ({ ...current, page }))}
      onQueryChange={(query) => setQueryState((current) => ({ ...current, query }))}
      onRetry={() => undefined}
      onRowClick={() => undefined}
      onSortChange={(sortKey) =>
        setQueryState((current) => ({
          ...current,
          sortDirection: current.sortKey === sortKey && current.sortDirection === "asc" ? "desc" : "asc",
          sortKey,
        }))
      }
    />
  );
}

const meta = {
  title: "Components/ProjectListTable",
  component: ProjectListTableStory,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof ProjectListTableStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <ProjectListTableStory />,
};

export const EmptyState: Story = {
  render: () => (
    <ProjectListTableStory
      initialQueryState={{
        query: "",
        page: 1,
        pageSize: 15,
        sortKey: "name",
        sortDirection: "asc",
      }}
      projects={[]}
      totalCount={0}
    />
  ),
};

export const ErrorState: Story = {
  render: () => <ProjectListTableStory isError />,
};

export const Showcase: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">기본 목록</p>
        <ProjectListTableStory />
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">검색 결과 없음</p>
        <ProjectListTableStory
          initialQueryState={{
            query: "서보",
            page: 1,
            pageSize: 15,
            sortKey: "name",
            sortDirection: "asc",
          }}
          projects={[]}
          totalCount={0}
        />
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">에러 상태</p>
        <ProjectListTableStory isError />
      </div>
    </div>
  ),
};
