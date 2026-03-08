import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  FolderKanban,
  GitPullRequestArrow,
  LayoutDashboard,
  Package,
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

export const Default: Story = {
  render: () => (
    <div className="h-[520px]">
      <AppSidebar isDesktop sections={sections} />
    </div>
  ),
};

export const Collapsed: Story = {
  render: () => (
    <div className="h-[520px]">
      <AppSidebar isDesktop collapsed sections={sections} />
    </div>
  ),
};

export const WithStatus: Story = {
  render: () => (
    <div className="h-[520px]">
      <AppSidebar
        isDesktop
        sections={sections}
        statusIndicator={{ count: 3 }}
      />
    </div>
  ),
};
