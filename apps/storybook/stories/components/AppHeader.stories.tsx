import type { Meta, StoryObj } from "@storybook/react-vite";
import { Building2, User } from "lucide-react";
import { AppHeader } from "@fabbit/components";

const meta = {
  title: "Components/AppHeader",
  component: AppHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof AppHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

const menuItems = [
  { id: "profile", label: "개인 설정", icon: User, onClick: () => {} },
  { id: "organization", label: "조직 설정", icon: Building2, onClick: () => {} },
];

export const Default: Story = {
  args: {
    onToggleSidebar: () => {},
    primaryAction: { label: "생성" },
    search: {
      triggerLabel: "검색",
      dialogPlaceholder: "검색어를 입력하세요...",
      dialogDescription: "품목, 도면, BOM 등을 검색할 수 있습니다.",
    },
    organizationMenu: {
      current: {
        id: "org-1",
        slug: "fabbit",
        name: "Fabbit",
        roleLabel: "소유자",
      },
      items: [
        { id: "org-1", slug: "fabbit", name: "Fabbit", roleLabel: "소유자" },
        { id: "org-2", slug: "factory-lab", name: "Factory Lab", roleLabel: "관리자" },
      ],
      onSelect: () => {},
    },
    user: {
      name: "문성하",
      email: "seongha@fabbit.io",
    },
    menuItems,
    onLogout: () => {},
  },
};
