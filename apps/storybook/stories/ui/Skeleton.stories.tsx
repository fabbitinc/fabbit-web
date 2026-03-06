import type { Meta, StoryObj } from "@storybook/react-vite";

import { Skeleton, Card, CardHeader, CardContent } from "@fabbit/ui";

const meta = {
  title: "UI/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  ),
};

export const Showcase: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* 프로필 스켈레톤 */}
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">프로필</p>
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[180px]" />
            <Skeleton className="h-3 w-[120px]" />
          </div>
        </div>
      </div>

      {/* 카드 스켈레톤 */}
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">카드 로딩</p>
        <Card className="w-[350px]">
          <CardHeader className="gap-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-4/5" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>

      {/* KPI 카드 스켈레톤 */}
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">KPI 카드 로딩</p>
        <div className="flex gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="w-[180px]">
              <CardHeader className="gap-2 pb-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-7 w-16" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-5 w-14 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 테이블 스켈레톤 */}
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">테이블 로딩</p>
        <div className="w-[500px] space-y-3">
          <Skeleton className="h-8 w-full" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-6 w-[100px]" />
              <Skeleton className="h-6 w-[80px]" />
              <Skeleton className="h-6 flex-1" />
              <Skeleton className="h-6 w-[80px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};
