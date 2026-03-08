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
  ProductionResultDetailScreen,
  ActivityList,
  type ProductionResultDetailData,
} from "@fabbit/components";
import { Card, CardContent, CardHeader, CardTitle } from "@fabbit/ui";

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

const mockResult: ProductionResultDetailData = {
  id: "1",
  orderNumber: "WO-240301",
  productName: "본체 조립 (EV 모터 컨트롤러)",
  plannedQuantity: 100,
  goodQuantity: 40,
  defectQuantity: 2,
  workStartTime: "09:00",
  workEndTime: "12:20",
  workDuration: "03:20",
  recorder: "김현장",
  team: "1팀",
  recordedAt: "2026-03-07 14:30",
  memo: "조립 완료, 체결 불량 2건",
  defectRecordCount: 1,
  lastUpdatedAt: "2026-03-07 14:35",
};

const mockCompletedResult: ProductionResultDetailData = {
  id: "2",
  orderNumber: "WO-240302",
  productName: "커버 가공",
  plannedQuantity: 50,
  goodQuantity: 50,
  defectQuantity: 0,
  workStartTime: "08:00",
  workEndTime: "10:10",
  workDuration: "02:10",
  recorder: "박리더",
  team: "2팀",
  recordedAt: "2026-03-07 12:00",
  memo: "",
  defectRecordCount: 0,
  lastUpdatedAt: "2026-03-07 12:00",
};

/* ─── 탭 콘텐츠 mock ─── */

function HistoryTabContent() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">수정 이력</CardTitle>
      </CardHeader>
      <CardContent>
        <ActivityList
          items={[
            {
              id: "h1",
              title: "불량 수량 수정: 3 → 2",
              subtitle: "김현장 · 2026-03-07 14:35",
              status: { text: "수정", variant: "outline" },
              onClick: () => {},
            },
            {
              id: "h2",
              title: "실적 최초 등록",
              subtitle: "김현장 · 2026-03-07 14:30",
              status: { text: "등록", variant: "outline" },
              onClick: () => {},
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}

function DefectsTabContent() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">불량 기록</CardTitle>
      </CardHeader>
      <CardContent>
        <ActivityList
          items={[
            {
              id: "d1",
              title: "DF-240301-001 체결 불량",
              subtitle: "김현장 · 2건 · 2026-03-07 14:32",
              status: { text: "불량", variant: "outline" },
              onClick: () => {},
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}

function EmptyDefectsTabContent() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">불량 기록</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="py-6 text-center text-sm text-muted-foreground">
          연결된 불량 기록이 없습니다
        </p>
      </CardContent>
    </Card>
  );
}

/* ─── 스토리 ─── */

const meta = {
  title: "Pages/ProductionResultDetail",
  component: AppShell,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof AppShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithDefects: Story = {
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
      <ProductionResultDetailScreen
        result={mockResult}
        activeTab="history"
        tabContent={<HistoryTabContent />}
        onBack={() => {}}
        onTabChange={() => {}}
        onEdit={() => {}}
        onCreateDefectRecord={() => {}}
      />
    </AppShell>
  ),
};

export const DefectsTab: Story = {
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
      <ProductionResultDetailScreen
        result={mockResult}
        activeTab="defects"
        tabContent={<DefectsTabContent />}
        onBack={() => {}}
        onTabChange={() => {}}
        onEdit={() => {}}
        onCreateDefectRecord={() => {}}
      />
    </AppShell>
  ),
};

export const Completed: Story = {
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
      <ProductionResultDetailScreen
        result={mockCompletedResult}
        activeTab="defects"
        tabContent={<EmptyDefectsTabContent />}
        onBack={() => {}}
        onTabChange={() => {}}
        onEdit={() => {}}
        onCreateDefectRecord={() => {}}
      />
    </AppShell>
  ),
};
