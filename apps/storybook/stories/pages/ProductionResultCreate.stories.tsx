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
  ProductionResultCreateScreen,
  type ProductionResultCreateFormValues,
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

const mockWorkOrder = {
  id: "1",
  orderNumber: "WO-240301",
  productName: "본체 조립 (EV 모터 컨트롤러)",
  plannedQuantity: 100,
  assigneeName: "박준서",
};

const initialValues: ProductionResultCreateFormValues = {
  goodQuantity: "",
  defectQuantity: "",
  workStartTime: "",
  workEndTime: "",
  memo: "",
};

/* ─── 인터랙티브 래퍼 ─── */

function InteractiveCreate() {
  const [values, setValues] = useState<ProductionResultCreateFormValues>(initialValues);
  return (
    <ProductionResultCreateScreen
      workOrder={mockWorkOrder}
      formValues={values}
      onBack={() => {}}
      onChange={setValues}
      onSubmit={() => {}}
      onSaveDraft={() => {}}
      onCreateDefectRecord={() => {}}
    />
  );
}

function FilledCreate() {
  const [values, setValues] = useState<ProductionResultCreateFormValues>({
    goodQuantity: "40",
    defectQuantity: "2",
    workStartTime: "09:00",
    workEndTime: "12:20",
    memo: "조립 완료, 체결 불량 2건",
  });
  return (
    <ProductionResultCreateScreen
      workOrder={mockWorkOrder}
      formValues={values}
      onBack={() => {}}
      onChange={setValues}
      onSubmit={() => {}}
      onSaveDraft={() => {}}
      onCreateDefectRecord={() => {}}
    />
  );
}

function OverPlanCreate() {
  const [values, setValues] = useState<ProductionResultCreateFormValues>({
    goodQuantity: "90",
    defectQuantity: "20",
    workStartTime: "08:00",
    workEndTime: "17:00",
    memo: "",
  });
  return (
    <ProductionResultCreateScreen
      workOrder={mockWorkOrder}
      formValues={values}
      onBack={() => {}}
      onChange={setValues}
      onSubmit={() => {}}
      onSaveDraft={() => {}}
      onCreateDefectRecord={() => {}}
    />
  );
}

/* ─── 스토리 ─── */

const meta = {
  title: "Pages/ProductionResultCreate",
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

export const OverPlan: Story = {
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
      <OverPlanCreate />
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
      <ProductionResultCreateScreen
        workOrder={mockWorkOrder}
        formValues={{
          goodQuantity: "40",
          defectQuantity: "2",
          workStartTime: "09:00",
          workEndTime: "12:20",
          memo: "조립 완료",
        }}
        isSubmitting
        onBack={() => {}}
        onChange={() => {}}
        onSubmit={() => {}}
        onSaveDraft={() => {}}
        onCreateDefectRecord={() => {}}
      />
    </AppShell>
  ),
};
