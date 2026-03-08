import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  LayoutDashboard,
  FolderKanban,
  GitPullRequestArrow,
  Package,
  Factory,
  User,
  Building2,
} from "lucide-react";
import {
  AppShell,
  AppHeader,
  AppSidebar,
  WorkOrderListScreen,
  type WorkOrderListItem,
} from "@fabbit/components";

/* ─── 공통 레이아웃 mock ─── */

const brand = (
  <div className="flex items-center gap-2">
    <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    </div>
    <span className="text-sm font-semibold">Fabbit</span>
  </div>
);

const mockUser = { name: "김태현", email: "taehyun@fabbit.io" };
const mockMenuItems = [
  { id: "profile", label: "개인 설정", icon: User, onClick: () => {} },
  { id: "org", label: "조직 설정", icon: Building2, onClick: () => {} },
];

const navSections = [
  {
    id: "main",
    items: [
      {
        id: "dashboard",
        label: "대시보드",
        icon: LayoutDashboard,
        onClick: () => {},
      },
      {
        id: "projects",
        label: "프로젝트",
        icon: FolderKanban,
        onClick: () => {},
      },
      {
        id: "changes",
        label: "변경 관리",
        icon: GitPullRequestArrow,
        onClick: () => {},
      },
      { id: "parts", label: "부품 관리", icon: Package, onClick: () => {} },
      {
        id: "production",
        label: "생산",
        icon: Factory,
        active: true,
        onClick: () => {},
      },
    ],
  },
];

/* ─── mock 데이터 ─── */

const mockItems: WorkOrderListItem[] = [
  {
    id: "1",
    orderNumber: "WO-240301",
    productName: "본체 조립",
    quantity: 100,
    dueDate: "2026-03-10",
    priority: "high",
    status: "in_progress",
    assignee: { name: "박준서", profileImageUrl: null },
    team: "1팀",
    commentsCount: 3,
    bomReference: "BOM-AX-003",
  },
  {
    id: "2",
    orderNumber: "WO-240302",
    productName: "커버 가공",
    quantity: 50,
    dueDate: "2026-03-11",
    priority: "medium",
    status: "released",
    assignee: { name: "이수진", profileImageUrl: null },
    team: "2팀",
    commentsCount: 0,
    bomReference: "BOM-CV-012",
  },
  {
    id: "3",
    orderNumber: "WO-240303",
    productName: "최종 검사",
    quantity: 30,
    dueDate: "2026-03-05",
    priority: "high",
    status: "in_progress",
    assignee: { name: "정하은", profileImageUrl: null },
    team: "품질팀",
    commentsCount: 5,
    bomReference: "BOM-QC-001",
  },
  {
    id: "4",
    orderNumber: "WO-240304",
    productName: "PCB 납땜",
    quantity: 200,
    dueDate: "2026-03-12",
    priority: "low",
    status: "draft",
    assignee: { name: "최민정", profileImageUrl: null },
    team: "3팀",
    commentsCount: 0,
    bomReference: "BOM-PCB-007",
  },
  {
    id: "5",
    orderNumber: "WO-240305",
    productName: "방열판 CNC 가공",
    quantity: 80,
    dueDate: "2026-03-08",
    priority: "medium",
    status: "done",
    assignee: { name: "김태현", profileImageUrl: null },
    team: "1팀",
    commentsCount: 2,
    bomReference: "BOM-HS-015",
  },
  {
    id: "6",
    orderNumber: "WO-240306",
    productName: "하우징 사출",
    quantity: 150,
    dueDate: "2026-03-09",
    priority: "high",
    status: "cancelled",
    assignee: { name: "박준서", profileImageUrl: null },
    team: "2팀",
    commentsCount: 1,
    bomReference: "BOM-HS-018",
  },
  {
    id: "7",
    orderNumber: "WO-240307",
    productName: "모터 조립",
    quantity: 60,
    dueDate: "2026-03-15",
    priority: "medium",
    status: "released",
    assignee: { name: "이수진", profileImageUrl: null },
    team: "1팀",
    commentsCount: 0,
    bomReference: "BOM-MT-002",
  },
];

/* ─── 스토리 ─── */

const meta = {
  title: "Pages/WorkOrderList",
  component: AppShell,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof AppShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <AppShell
      header={
        <AppHeader
          brand={brand}
          user={mockUser}
          onToggleSidebar={() => {}}
          search={{
            triggerLabel: "검색",
            dialogPlaceholder: "작업번호, 품목명 검색...",
          }}
          menuItems={mockMenuItems}
          onLogout={() => {}}
        />
      }
      sidebar={<AppSidebar isDesktop sections={navSections} />}
      isDesktop
      mainClassName="p-6"
    >
      <WorkOrderListScreen
        items={mockItems}
        queryState={{
          query: "",
          page: 1,
          pageSize: 20,
          status: "all",
          team: null,
          priority: null,
        }}
        totalCount={mockItems.length}
        teams={["1팀", "2팀", "3팀", "품질팀"]}
        onCreateClick={() => {}}
        onItemClick={() => {}}
        onPageChange={() => {}}
        onQueryChange={() => {}}
        onStatusChange={() => {}}
        onTeamChange={() => {}}
        onPriorityChange={() => {}}
      />
    </AppShell>
  ),
};

export const Loading: Story = {
  render: () => (
    <AppShell
      header={
        <AppHeader
          brand={brand}
          user={mockUser}
          onToggleSidebar={() => {}}
          search={{
            triggerLabel: "검색",
            dialogPlaceholder: "작업번호, 품목명 검색...",
          }}
          menuItems={mockMenuItems}
          onLogout={() => {}}
        />
      }
      sidebar={<AppSidebar isDesktop sections={navSections} />}
      isDesktop
      mainClassName="p-6"
    >
      <WorkOrderListScreen
        items={[]}
        queryState={{
          query: "",
          page: 1,
          pageSize: 20,
          status: "all",
          team: null,
          priority: null,
        }}
        totalCount={0}
        teams={["1팀", "2팀", "3팀", "품질팀"]}
        isLoading
        onCreateClick={() => {}}
        onItemClick={() => {}}
        onPageChange={() => {}}
        onQueryChange={() => {}}
        onStatusChange={() => {}}
        onTeamChange={() => {}}
        onPriorityChange={() => {}}
      />
    </AppShell>
  ),
};

export const Empty: Story = {
  render: () => (
    <AppShell
      header={
        <AppHeader
          brand={brand}
          user={mockUser}
          onToggleSidebar={() => {}}
          search={{
            triggerLabel: "검색",
            dialogPlaceholder: "작업번호, 품목명 검색...",
          }}
          menuItems={mockMenuItems}
          onLogout={() => {}}
        />
      }
      sidebar={<AppSidebar isDesktop sections={navSections} />}
      isDesktop
      mainClassName="p-6"
    >
      <WorkOrderListScreen
        items={[]}
        queryState={{
          query: "",
          page: 1,
          pageSize: 20,
          status: "all",
          team: null,
          priority: null,
        }}
        totalCount={0}
        teams={["1팀", "2팀", "3팀", "품질팀"]}
        onCreateClick={() => {}}
        onItemClick={() => {}}
        onPageChange={() => {}}
        onQueryChange={() => {}}
        onStatusChange={() => {}}
        onTeamChange={() => {}}
        onPriorityChange={() => {}}
      />
    </AppShell>
  ),
};
