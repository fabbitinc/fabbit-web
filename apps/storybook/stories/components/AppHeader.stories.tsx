import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { User, Building2, Settings } from "lucide-react";

import { AppHeader } from "@fabbit/components";
import { Button } from "@fabbit/ui";

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

const mockUser = {
  name: "문성하",
  email: "seongha@fabbit.io",
};

const mockMenuItems = [
  { id: "profile", label: "개인 설정", icon: User, onClick: () => {} },
  { id: "org", label: "조직 설정", icon: Building2, onClick: () => {} },
  { id: "system", label: "시스템 설정", icon: Settings, onClick: () => {} },
];

export const Default: Story = {
  args: {
    brand: (
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
    ),
    user: mockUser,
    onToggleSidebar: () => {},
    onSearchClick: () => {},
    searchPlaceholder: "품목, 도면, BOM 검색...",
    onNotificationClick: () => {},
    notificationCount: 3,
    menuItems: mockMenuItems,
    onLogout: () => {},
  },
};

export const Minimal: Story = {
  args: {
    brand: <span className="text-sm font-semibold">Fabbit</span>,
    user: mockUser,
    onLogout: () => {},
  },
};

export const WithActions: Story = {
  render: () => (
    <AppHeader
      brand={<span className="text-sm font-semibold">Fabbit MES</span>}
      user={mockUser}
      onToggleSidebar={() => {}}
      onSearchClick={() => {}}
      onNotificationClick={() => {}}
      menuItems={mockMenuItems}
      onLogout={() => {}}
      actions={
        <Button variant="outline" size="sm">
          + 작업지시 생성
        </Button>
      }
    />
  ),
};
