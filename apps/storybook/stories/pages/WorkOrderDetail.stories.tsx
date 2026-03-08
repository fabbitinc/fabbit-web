import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  CheckCircle2,
  ClipboardList,
  LayoutDashboard,
  FolderKanban,
  GitPullRequestArrow,
  Package,
  Factory,
  History,
  User,
  Building2,
  XCircle,
} from "lucide-react";
import {
  AppShell,
  AppHeader,
  AppSidebar,
  WorkOrderDetailScreen,
  type WorkOrderDetail,
  DescriptionList,
  ActivityList,
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

const mockWorkOrder: WorkOrderDetail = {
  id: "1",
  orderNumber: "WO-240301",
  productName: "본체 조립 (EV 모터 컨트롤러)",
  status: "in_progress",
  quantity: 100,
  dueDate: "2026-03-10",
  priority: "high",
  team: "1팀",
  assigneeName: "박준서",
  createdAt: "2026-03-07 09:00",
  bom: {
    bomCode: "BOM-AX-003",
    drawingCode: "DRW-AX-021",
    drawingRevision: "Rev.C",
    releasedAt: "2026-03-07 09:00",
  },
  progress: {
    startedAt: "09:20",
    completedAt: null,
    goodQuantity: 40,
    defectQuantity: 2,
  },
  links: [
    {
      id: "l1",
      type: "production",
      label: "PR-240301-001 실적 등록 (40개)",
      onClick: () => {},
    },
    {
      id: "l2",
      type: "production",
      label: "PR-240301-002 실적 등록 (20개)",
      onClick: () => {},
    },
    {
      id: "l3",
      type: "defect",
      label: "DF-240301-001 납땜 불량 2건",
      onClick: () => {},
    },
  ],
};

const mockDoneWorkOrder: WorkOrderDetail = {
  id: "2",
  orderNumber: "WO-240305",
  productName: "방열판 CNC 가공",
  status: "done",
  quantity: 80,
  dueDate: "2026-03-08",
  priority: "medium",
  team: "1팀",
  assigneeName: "김태현",
  createdAt: "2026-03-05 14:00",
  bom: {
    bomCode: "BOM-HS-015",
    drawingCode: "DRW-HS-009",
    drawingRevision: "Rev.B",
    releasedAt: "2026-03-05 10:00",
  },
  progress: {
    startedAt: "08:00",
    completedAt: "17:30",
    goodQuantity: 80,
    defectQuantity: 0,
  },
  links: [
    {
      id: "l1",
      type: "production",
      label: "PR-240305-001 실적 등록 (80개)",
      onClick: () => {},
    },
  ],
};

/* ─── 탭 콘텐츠 mock ─── */

function ProgressTabContent() {
  return (
    <ActivityList
      title="생산 실적 이력"
      items={[
        {
          id: "a1",
          icon: CheckCircle2,
          iconClassName: "text-emerald-500",
          title: "양품 20개 등록",
          subtitle: "박준서 · 10:40",
          status: { text: "등록", variant: "outline" },
          onClick: () => {},
        },
        {
          id: "a2",
          icon: CheckCircle2,
          iconClassName: "text-emerald-500",
          title: "양품 20개 등록",
          subtitle: "박준서 · 09:50",
          status: { text: "등록", variant: "outline" },
          onClick: () => {},
        },
        {
          id: "a3",
          icon: XCircle,
          iconClassName: "text-red-500",
          title: "납땜 불량 2건 보고",
          subtitle: "박준서 · 09:35",
          status: { text: "불량", variant: "outline" },
          onClick: () => {},
        },
      ]}
    />
  );
}

function BomTabContent() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">BOM 구성</CardTitle>
      </CardHeader>
      <CardContent>
        <DescriptionList
          columns={2}
          items={[
            { label: "BOM 코드", value: "BOM-AX-003" },
            { label: "도면", value: "DRW-AX-021 Rev.C" },
            { label: "총 하위 부품", value: "24개" },
            { label: "릴리스 일시", value: "2026-03-07 09:00" },
            { label: "작성자", value: "이수진" },
            { label: "상태", value: "Released" },
          ]}
        />
      </CardContent>
    </Card>
  );
}

function HistoryTabContent() {
  return (
    <ActivityList
      title="변경 이력"
      items={[
        {
          id: "h1",
          icon: History,
          iconClassName: "text-blue-500",
          title: "상태 변경: 예정 → 진행 중",
          subtitle: "박준서 · 2026-03-07 09:20",
          onClick: () => {},
        },
        {
          id: "h2",
          icon: ClipboardList,
          iconClassName: "text-emerald-500",
          title: "작업지시 배포",
          subtitle: "김태현 · 2026-03-07 09:00",
          onClick: () => {},
        },
        {
          id: "h3",
          icon: ClipboardList,
          iconClassName: "text-gray-500",
          title: "작업지시 생성",
          subtitle: "김태현 · 2026-03-06 16:30",
          onClick: () => {},
        },
      ]}
    />
  );
}

/* ─── 스토리 ─── */

const meta: Meta = {
  title: "Pages/WorkOrderDetail",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj;

export const InProgress: Story = {
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
      <WorkOrderDetailScreen
        workOrder={mockWorkOrder}
        activeTab="progress"
        tabContent={<ProgressTabContent />}
        onBack={() => {}}
        onTabChange={() => {}}
        onStatusChange={() => {}}
        onDuplicate={() => {}}
        onEdit={() => {}}
      />
    </AppShell>
  ),
};

export const BomTab: Story = {
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
      <WorkOrderDetailScreen
        workOrder={mockWorkOrder}
        activeTab="bom"
        tabContent={<BomTabContent />}
        onBack={() => {}}
        onTabChange={() => {}}
        onStatusChange={() => {}}
        onDuplicate={() => {}}
        onEdit={() => {}}
      />
    </AppShell>
  ),
};

export const HistoryTab: Story = {
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
      <WorkOrderDetailScreen
        workOrder={mockWorkOrder}
        activeTab="history"
        tabContent={<HistoryTabContent />}
        onBack={() => {}}
        onTabChange={() => {}}
        onStatusChange={() => {}}
        onDuplicate={() => {}}
        onEdit={() => {}}
      />
    </AppShell>
  ),
};

export const Done: Story = {
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
      <WorkOrderDetailScreen
        workOrder={mockDoneWorkOrder}
        activeTab="progress"
        tabContent={<ProgressTabContent />}
        onBack={() => {}}
        onTabChange={() => {}}
        onStatusChange={() => {}}
        onDuplicate={() => {}}
        onEdit={() => {}}
      />
    </AppShell>
  ),
};
