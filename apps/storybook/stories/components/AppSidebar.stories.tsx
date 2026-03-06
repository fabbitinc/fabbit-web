import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  LayoutDashboard,
  FolderKanban,
  GitPullRequestArrow,
  Package,
  Settings,
  BarChart3,
  ClipboardCheck,
  Wrench,
  Loader2,
} from "lucide-react";

import { AppSidebar } from "@fabbit/components";

const meta = {
  title: "Components/AppSidebar",
  component: AppSidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof AppSidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

const mainSections = [
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

const mesSections = [
  {
    id: "production",
    label: "생산",
    items: [
      { id: "dashboard", label: "대시보드", icon: LayoutDashboard, active: true, onClick: () => {} },
      { id: "work-orders", label: "작업지시", icon: ClipboardCheck, onClick: () => {} },
      { id: "monitoring", label: "실시간 모니터링", icon: BarChart3, onClick: () => {} },
    ],
  },
  {
    id: "quality",
    label: "품질",
    items: [
      { id: "inspection", label: "검사 관리", icon: ClipboardCheck, onClick: () => {} },
      { id: "equipment", label: "설비 관리", icon: Wrench, onClick: () => {} },
    ],
  },
  {
    id: "system",
    label: "시스템",
    items: [
      { id: "settings", label: "설정", icon: Settings, onClick: () => {} },
    ],
  },
];

export const Default: Story = {
  render: () => (
    <div className="h-[500px]">
      <AppSidebar sections={mainSections} />
    </div>
  ),
};

export const Collapsed: Story = {
  render: () => (
    <div className="h-[500px]">
      <AppSidebar sections={mainSections} collapsed />
    </div>
  ),
};

export const WithSections: Story = {
  render: () => (
    <div className="h-[600px]">
      <AppSidebar sections={mesSections} />
    </div>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <div className="h-[500px]">
      <AppSidebar
        sections={mainSections}
        footer={
          <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent px-3 py-2">
            <Loader2 className="size-4 animate-spin text-sidebar-foreground/70" />
            <span className="text-xs font-medium text-sidebar-foreground/70">
              3개 파일 처리 중
            </span>
          </div>
        }
      />
    </div>
  ),
};
