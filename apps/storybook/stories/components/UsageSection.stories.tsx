import type { Meta, StoryObj } from "@storybook/react-vite";
import { UsageSection } from "@fabbit/components";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@fabbit/ui";

const storageContent = (
  <Card className="border-border/70">
    <CardHeader>
      <CardTitle>스토리지 사용량</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">총 사용량</span>
        <Badge variant="secondary">412 GB / 1 TB</Badge>
      </div>
      <p className="text-sm text-muted-foreground">도면 원본, 가공 이력, BOM 산출물이 스토리지 사용량에 반영됩니다.</p>
    </CardContent>
  </Card>
);

const aiContent = (
  <Card className="border-border/70">
    <CardHeader>
      <CardTitle>AI 사용량</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">월간 크레딧</span>
        <Badge variant="accent">1,240 / 2,000</Badge>
      </div>
      <p className="text-sm text-muted-foreground">도면 분석, 템플릿 매핑, 요약 생성에 사용된 크레딧을 확인할 수 있습니다.</p>
    </CardContent>
  </Card>
);

const meta = {
  title: "Components/UsageSection",
  component: UsageSection,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    activeSubTab: "storage",
    storageContent,
    aiContent,
    onSubTabChange: () => undefined,
  },
} satisfies Meta<typeof UsageSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Storage: Story = {};

export const AI: Story = {
  args: {
    activeSubTab: "ai",
  },
};
