import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Card, CardContent, InlineTabs } from "@fabbit/ui";

const meta = {
  title: "UI/InlineTabs",
  component: InlineTabs,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof InlineTabs>;

export default meta;

type Story = StoryObj<typeof meta>;

const tabItems = [
  { key: "overview", label: "개요" },
  { key: "details", label: "상세" },
  { key: "history", label: "이력" },
] as const;

export const Default: Story = {
  render: () => {
    const [activeKey, setActiveKey] = useState("overview");

    return (
      <div className="w-[420px] space-y-4">
        <InlineTabs activeKey={activeKey} items={tabItems} onChange={setActiveKey} />
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            현재 선택된 탭: <span className="font-medium text-foreground">{activeKey}</span>
          </CardContent>
        </Card>
      </div>
    );
  },
};

export const Showcase: Story = {
  render: () => (
    <div className="w-[720px] space-y-8">
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">설정 서브탭</p>
        <InlineTabs
          activeKey="users"
          items={[
            { key: "users", label: "사용자" },
            { key: "teams", label: "팀" },
          ]}
          onChange={() => undefined}
        />
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">사용량 서브탭</p>
        <InlineTabs
          activeKey="storage"
          items={[
            { key: "storage", label: "스토리지" },
            { key: "ai", label: "AI 사용량" },
          ]}
          onChange={() => undefined}
        />
      </div>
    </div>
  ),
};
