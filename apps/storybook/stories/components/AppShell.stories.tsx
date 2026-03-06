import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  LayoutDashboard,
  FolderKanban,
  GitPullRequestArrow,
  Package,
  User,
  Building2,
  AlertTriangle,
  X,
} from "lucide-react";

import { AppShell, AppHeader, AppSidebar, StatGroup, KpiCard } from "@fabbit/components";
import { Button } from "@fabbit/ui";

const meta = {
  title: "Components/AppShell",
  component: AppShell,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof AppShell>;

export default meta;

type Story = StoryObj<typeof meta>;

const navSections = [
  {
    id: "main",
    items: [
      { id: "dashboard", label: "대시보드", icon: LayoutDashboard, active: true, onClick: () => {} },
      { id: "projects", label: "프로젝트", icon: FolderKanban, onClick: () => {} },
      { id: "changes", label: "변경 관리", icon: GitPullRequestArrow, onClick: () => {} },
      { id: "parts", label: "부품관리", icon: Package, onClick: () => {} },
    ],
  },
];

const mockUser = {
  name: "문성하",
  email: "seongha@fabbit.io",
};

const mockMenuItems = [
  { id: "profile", label: "개인 설정", icon: User, onClick: () => {} },
  { id: "org", label: "조직 설정", icon: Building2, onClick: () => {} },
];

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

export const Default: Story = {
  render: () => (
    <AppShell
      header={
        <AppHeader
          brand={brand}
          user={mockUser}
          onToggleSidebar={() => {}}
          onSearchClick={() => {}}
          searchPlaceholder="품목, 도면, BOM 검색..."
          onNotificationClick={() => {}}
          notificationCount={2}
          menuItems={mockMenuItems}
          onLogout={() => {}}
        />
      }
      sidebar={<AppSidebar sections={navSections} />}
    >
      <div className="p-6">
        <h1 className="mb-6 text-2xl font-semibold">대시보드</h1>
        <StatGroup>
          <KpiCard label="가동률" value="94.2%" change="+2.1%" changePositive />
          <KpiCard label="불량률" value="0.6%" change="-0.2%" changePositive />
          <KpiCard label="일일 생산량" value="1,248개" change="+48" changePositive />
          <KpiCard label="설비 가용률" value="87.5%" change="-1.3%" changePositive={false} />
        </StatGroup>
      </div>
    </AppShell>
  ),
};

export const CollapsedSidebar: Story = {
  render: () => (
    <AppShell
      header={
        <AppHeader
          brand={brand}
          user={mockUser}
          onToggleSidebar={() => {}}
          onSearchClick={() => {}}
          menuItems={mockMenuItems}
          onLogout={() => {}}
        />
      }
      sidebar={<AppSidebar sections={navSections} collapsed />}
      sidebarCollapsed
    >
      <div className="p-6">
        <h1 className="text-2xl font-semibold">대시보드</h1>
        <p className="mt-2 text-muted-foreground">사이드바가 접힌 상태입니다.</p>
      </div>
    </AppShell>
  ),
};

export const WithBanner: Story = {
  render: () => (
    <AppShell
      header={
        <AppHeader
          brand={brand}
          user={mockUser}
          onToggleSidebar={() => {}}
          onSearchClick={() => {}}
          menuItems={mockMenuItems}
          onLogout={() => {}}
        />
      }
      sidebar={<AppSidebar sections={navSections} />}
      banner={
        <div className="flex items-center justify-between border-b bg-warning/10 px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-warning">
            <AlertTriangle className="size-4" />
            시스템 점검 예정: 03/10(월) 02:00~06:00 서비스 일시 중단
          </div>
          <Button variant="ghost" size="icon" className="size-6">
            <X className="size-3" />
          </Button>
        </div>
      }
    >
      <div className="p-6">
        <h1 className="text-2xl font-semibold">대시보드</h1>
      </div>
    </AppShell>
  ),
};

export const NoSidebar: Story = {
  render: () => (
    <AppShell
      header={
        <AppHeader
          brand={brand}
          user={mockUser}
          menuItems={mockMenuItems}
          onLogout={() => {}}
        />
      }
    >
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-semibold">온보딩</h1>
        <p className="mt-2 text-muted-foreground">
          사이드바 없는 전체 너비 레이아웃입니다.
        </p>
      </div>
    </AppShell>
  ),
};
