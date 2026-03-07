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
  ProductionResultListScreen,
  type ProductionResultListItem,
} from "@fabbit/components";

/* ─── 공통 레이아웃 mock ─── */

const brand = (
  <div className="flex items-center gap-2">
    <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      { id: "dashboard", label: "대시보드", icon: LayoutDashboard, onClick: () => {} },
      { id: "projects", label: "프로젝트", icon: FolderKanban, onClick: () => {} },
      { id: "changes", label: "변경 관리", icon: GitPullRequestArrow, onClick: () => {} },
      { id: "parts", label: "부품관리", icon: Package, onClick: () => {} },
      { id: "production", label: "생산", icon: Factory, active: true, onClick: () => {} },
    ],
  },
];

/* ─── mock 데이터 ─── */

const mockItems: ProductionResultListItem[] = [
  {
    id: "1",
    orderNumber: "WO-240301",
    productName: "본체 조립",
    goodQuantity: 40,
    defectQuantity: 2,
    plannedQuantity: 100,
    workDuration: "03:20",
    recordedAt: "2026-03-07 14:30",
    recorder: { name: "김현장", profileImageUrl: null },
    team: "1팀",
    hasDefectRecord: true,
  },
  {
    id: "2",
    orderNumber: "WO-240302",
    productName: "커버 가공",
    goodQuantity: 50,
    defectQuantity: 0,
    plannedQuantity: 50,
    workDuration: "02:10",
    recordedAt: "2026-03-07 12:00",
    recorder: { name: "박리더", profileImageUrl: null },
    team: "2팀",
    hasDefectRecord: false,
  },
  {
    id: "3",
    orderNumber: "WO-240303",
    productName: "PCB 납땜",
    goodQuantity: 180,
    defectQuantity: 5,
    plannedQuantity: 200,
    workDuration: "05:40",
    recordedAt: "2026-03-07 17:00",
    recorder: { name: "이수진", profileImageUrl: null },
    team: "3팀",
    hasDefectRecord: true,
  },
  {
    id: "4",
    orderNumber: "WO-240304",
    productName: "방열판 CNC 가공",
    goodQuantity: 80,
    defectQuantity: 0,
    plannedQuantity: 80,
    workDuration: "04:15",
    recordedAt: "2026-03-07 16:20",
    recorder: { name: "정하은", profileImageUrl: null },
    team: "1팀",
    hasDefectRecord: false,
  },
  {
    id: "5",
    orderNumber: "WO-240305",
    productName: "하우징 사출",
    goodQuantity: 60,
    defectQuantity: 3,
    plannedQuantity: 150,
    workDuration: "02:50",
    recordedAt: "2026-03-07 11:30",
    recorder: { name: "최민정", profileImageUrl: null },
    team: "2팀",
    hasDefectRecord: true,
  },
  {
    id: "6",
    orderNumber: "WO-240306",
    productName: "모터 조립",
    goodQuantity: 30,
    defectQuantity: 1,
    plannedQuantity: 60,
    workDuration: "01:45",
    recordedAt: "2026-03-07 10:00",
    recorder: { name: "김태현", profileImageUrl: null },
    team: "1팀",
    hasDefectRecord: false,
  },
];

/* ─── 스토리 ─── */

const meta = {
  title: "Pages/ProductionResultList",
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
      <ProductionResultListScreen
        items={mockItems}
        queryState={{
          query: "",
          page: 1,
          pageSize: 20,
          period: "today",
          team: null,
        }}
        totalCount={mockItems.length}
        teams={["1팀", "2팀", "3팀", "품질팀"]}
        onCreateClick={() => {}}
        onItemClick={() => {}}
        onPageChange={() => {}}
        onQueryChange={() => {}}
        onPeriodChange={() => {}}
        onTeamChange={() => {}}
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
      <ProductionResultListScreen
        items={[]}
        queryState={{
          query: "",
          page: 1,
          pageSize: 20,
          period: "today",
          team: null,
        }}
        totalCount={0}
        teams={["1팀", "2팀", "3팀", "품질팀"]}
        isLoading
        onCreateClick={() => {}}
        onItemClick={() => {}}
        onPageChange={() => {}}
        onQueryChange={() => {}}
        onPeriodChange={() => {}}
        onTeamChange={() => {}}
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
      <ProductionResultListScreen
        items={[]}
        queryState={{
          query: "",
          page: 1,
          pageSize: 20,
          period: "today",
          team: null,
        }}
        totalCount={0}
        teams={["1팀", "2팀", "3팀", "품질팀"]}
        onCreateClick={() => {}}
        onItemClick={() => {}}
        onPageChange={() => {}}
        onQueryChange={() => {}}
        onPeriodChange={() => {}}
        onTeamChange={() => {}}
      />
    </AppShell>
  ),
};
