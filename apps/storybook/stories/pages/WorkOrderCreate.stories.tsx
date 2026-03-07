import { useState } from "react";
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
  WorkOrderCreateScreen,
  type WorkOrderCreateFormValues,
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

/* ─── mock 옵션 ─── */

const bomOptions = [
  { id: "bom-1", code: "BOM-AX-003", label: "본체 조립 BOM Rev.C" },
  { id: "bom-2", code: "BOM-CV-012", label: "커버 가공 BOM Rev.A" },
  { id: "bom-3", code: "BOM-PCB-007", label: "PCB 모듈 BOM Rev.B" },
  { id: "bom-4", code: "BOM-HS-015", label: "방열판 BOM Rev.B" },
  { id: "bom-5", code: "BOM-MT-002", label: "모터 조립 BOM Rev.A" },
];

const teamOptions = [
  { id: "team-1", name: "1팀" },
  { id: "team-2", name: "2팀" },
  { id: "team-3", name: "3팀" },
  { id: "team-4", name: "품질팀" },
];

const initialValues: WorkOrderCreateFormValues = {
  productName: "",
  bomId: null,
  quantity: "",
  dueDate: "",
  priority: "medium",
  teamId: null,
  note: "",
};

/* ─── 인터랙티브 래퍼 ─── */

function InteractiveCreate() {
  const [values, setValues] = useState<WorkOrderCreateFormValues>(initialValues);
  return (
    <WorkOrderCreateScreen
      formValues={values}
      bomOptions={bomOptions}
      teamOptions={teamOptions}
      onBack={() => {}}
      onChange={setValues}
      onSubmit={() => {}}
    />
  );
}

function FilledCreate() {
  const [values, setValues] = useState<WorkOrderCreateFormValues>({
    productName: "본체 조립",
    bomId: "bom-1",
    quantity: "100",
    dueDate: "2026-03-15",
    priority: "high",
    teamId: "team-1",
    note: "긴급 납기 건. 기준본 변경 금지.",
  });
  return (
    <WorkOrderCreateScreen
      formValues={values}
      bomOptions={bomOptions}
      teamOptions={teamOptions}
      onBack={() => {}}
      onChange={setValues}
      onSubmit={() => {}}
    />
  );
}

/* ─── 스토리 ─── */

const meta = {
  title: "Pages/WorkOrderCreate",
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
      <InteractiveCreate />
    </AppShell>
  ),
};

export const Filled: Story = {
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
      <FilledCreate />
    </AppShell>
  ),
};

export const Submitting: Story = {
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
      <WorkOrderCreateScreen
        formValues={{
          productName: "본체 조립",
          bomId: "bom-1",
          quantity: "100",
          dueDate: "2026-03-15",
          priority: "high",
          teamId: "team-1",
          note: "",
        }}
        bomOptions={bomOptions}
        teamOptions={teamOptions}
        isSubmitting
        onBack={() => {}}
        onChange={() => {}}
        onSubmit={() => {}}
      />
    </AppShell>
  ),
};
