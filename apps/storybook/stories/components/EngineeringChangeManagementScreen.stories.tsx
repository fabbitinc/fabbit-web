import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import {
  ChangeManagementScreen,
  type ChangeManagementScreenItem,
  type ChangeManagementScreenQueryState,
} from "@fabbit/components";

const issueItems = [
  {
    assignees: [{ fullName: "김태현", profileImageUrl: null, userId: "user-1" }],
    commentsCount: 12,
    engineeringChangeState: null,
    createdAt: "2026-03-04T09:10:00.000Z",
    createdBy: "문성하",
    id: "issue-42",
    kind: "issues",
    labels: [{ color: "#0F766E", id: "label-1", name: "간섭" }],
    number: 42,
    state: "OPEN",
    title: "센서 모듈 하우징 간섭 이슈",
    updatedAt: "2026-03-05T09:10:00.000Z",
  },
  {
    assignees: [],
    commentsCount: 3,
    engineeringChangeState: null,
    createdAt: "2026-03-01T11:45:00.000Z",
    createdBy: "이수진",
    id: "issue-51",
    kind: "issues",
    labels: [{ color: "#7C3AED", id: "label-2", name: "전장" }],
    number: 51,
    state: "CLOSED",
    title: "배선 하네스 고정 위치 재검토",
    updatedAt: "2026-03-03T11:45:00.000Z",
  },
] satisfies ChangeManagementScreenItem[];

const requestItems = [
  {
    assignees: [{ fullName: "박준서", profileImageUrl: null, userId: "user-2" }],
    commentsCount: 7,
    engineeringChangeState: "SUBMITTED",
    createdAt: "2026-03-05T07:30:00.000Z",
    createdBy: "문성하",
    id: "request-15",
    kind: "engineering-changes",
    labels: [{ color: "#2563EB", id: "label-3", name: "PCB" }],
    number: 15,
    state: "OPEN",
    title: "PCB 커넥터 핀 배열 변경",
    updatedAt: "2026-03-06T07:30:00.000Z",
  },
  {
    assignees: [],
    commentsCount: 2,
    engineeringChangeState: "MERGED",
    createdAt: "2026-02-27T13:00:00.000Z",
    createdBy: "김태현",
    id: "request-19",
    kind: "engineering-changes",
    labels: [{ color: "#DC2626", id: "label-4", name: "긴급" }],
    number: 19,
    state: "CLOSED",
    title: "방열판 재질 전환 검토",
    updatedAt: "2026-03-02T13:00:00.000Z",
  },
] satisfies ChangeManagementScreenItem[];

function ChangeManagementScreenStory() {
  const [queryState, setQueryState] = useState<ChangeManagementScreenQueryState>({
    page: 1,
    pageSize: 20,
    query: "",
    state: "open",
    view: "issues",
  });

  const activeItems = queryState.view === "issues" ? issueItems : requestItems;
  const filteredItems = useMemo(
    () =>
      activeItems.filter((item) => {
        const matchesQuery = item.title.toLowerCase().includes(queryState.query.trim().toLowerCase());
        const matchesState = queryState.state === "open"
          ? item.state !== "CLOSED" && item.engineeringChangeState !== "CLOSED" && item.engineeringChangeState !== "MERGED"
          : item.state === "CLOSED" || item.engineeringChangeState === "CLOSED" || item.engineeringChangeState === "MERGED";

        return matchesQuery && matchesState;
      }),
    [activeItems, queryState.query, queryState.state],
  );

  return (
    <ChangeManagementScreen
      isError={false}
      isLoading={false}
      listData={{
        closedCount:
          activeItems.filter(
            (item) =>
              item.state === "CLOSED" ||
              item.engineeringChangeState === "CLOSED" ||
              item.engineeringChangeState === "MERGED",
          ).length,
        items: filteredItems,
        openCount:
          activeItems.filter(
            (item) =>
              item.state !== "CLOSED" &&
              item.engineeringChangeState !== "CLOSED" &&
              item.engineeringChangeState !== "MERGED",
          ).length,
        total: filteredItems.length,
      }}
      queryState={queryState}
      onCreateClick={() => undefined}
      onItemClick={() => undefined}
      onPageChange={(page) => setQueryState((current) => ({ ...current, page }))}
      onPageSizeChange={(pageSize) => setQueryState((current) => ({ ...current, page: 1, pageSize }))}
      onQueryChange={(query) => setQueryState((current) => ({ ...current, page: 1, query }))}
      onRetry={() => undefined}
      onStateChange={(state) => setQueryState((current) => ({ ...current, page: 1, state }))}
      onViewChange={(view) => setQueryState((current) => ({ ...current, page: 1, view }))}
    />
  );
}

const meta = {
  title: "Components/ChangeManagementScreen",
  component: ChangeManagementScreenStory,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ChangeManagementScreenStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <ChangeManagementScreenStory />,
};
