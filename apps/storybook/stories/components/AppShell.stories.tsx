import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  FolderKanban,
  GitPullRequestArrow,
  LayoutDashboard,
  Package,
  User,
  Building2,
} from "lucide-react";
import {
  AppHeader,
  AppShell,
  AppSidebar,
  KpiCard,
  StatGroup,
} from "@fabbit/components";

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

const sections = [
  {
    id: "main",
    items: [
      {
        id: "dashboard",
        label: "대시보드",
        icon: LayoutDashboard,
        active: true,
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
    ],
  },
];

function ShellFrame({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <AppShell
      header={
        <AppHeader
          onToggleSidebar={() => {}}
          primaryAction={{ label: "생성" }}
          organizationMenu={{
            current: {
              id: "org-1",
              slug: "fabbit",
              name: "Fabbit",
              roleLabel: "소유자",
            },
            items: [
              {
                id: "org-1",
                slug: "fabbit",
                name: "Fabbit",
                roleLabel: "소유자",
              },
              {
                id: "org-2",
                slug: "factory-lab",
                name: "Factory Lab",
                roleLabel: "관리자",
              },
            ],
            onSelect: () => {},
          }}
          user={{ name: "문성하", email: "seongha@fabbit.io" }}
          menuItems={[
            {
              id: "profile",
              label: "개인 설정",
              icon: User,
              onClick: () => {},
            },
            {
              id: "organization",
              label: "조직 설정",
              icon: Building2,
              onClick: () => {},
            },
          ]}
          onLogout={() => {}}
        />
      }
      sidebar={
        <AppSidebar
          isDesktop
          collapsed={collapsed}
          sections={sections}
          statusIndicator={{ count: 2 }}
        />
      }
      isDesktop
      isSidebarCollapsed={collapsed}
    >
      <div>
        <h1 className="mb-6 text-2xl font-semibold">대시보드</h1>
        <StatGroup>
          <KpiCard label="가동률" value="94.2%" change="+2.1%" changePositive />
          <KpiCard label="불량률" value="0.6%" change="-0.2%" changePositive />
          <KpiCard
            label="일일 생산량"
            value="1,248개"
            change="+48"
            changePositive
          />
          <KpiCard
            label="설비 가용률"
            value="87.5%"
            change="-1.3%"
            changePositive={false}
          />
        </StatGroup>
      </div>
    </AppShell>
  );
}

export const Default: Story = {
  render: () => <ShellFrame />,
};

export const CollapsedSidebar: Story = {
  render: () => <ShellFrame collapsed />,
};

export const WithBanner: Story = {
  render: () => (
    <AppShell
      header={
        <AppHeader
          onToggleSidebar={() => {}}
          primaryAction={{ label: "생성" }}
          user={{ name: "문성하", email: "seongha@fabbit.io" }}
          menuItems={[
            {
              id: "profile",
              label: "개인 설정",
              icon: User,
              onClick: () => {},
            },
            {
              id: "organization",
              label: "조직 설정",
              icon: Building2,
              onClick: () => {},
            },
          ]}
          onLogout={() => {}}
        />
      }
      sidebar={<AppSidebar isDesktop sections={sections} />}
      banner={
        <div className="flex items-center justify-between border-b border-blue-200 bg-blue-50 px-4">
          <p className="truncate text-sm text-blue-900">
            임시 배너입니다. 공지/안내 용도로 사용하고 나중에 삭제할 수
            있습니다.
          </p>
        </div>
      }
      isDesktop
    >
      <div className="text-sm text-muted-foreground">
        배너가 포함된 앱 셸입니다.
      </div>
    </AppShell>
  ),
};
