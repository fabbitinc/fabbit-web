import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircleDot, GitPullRequestArrow, ArrowRight } from "lucide-react";

import { ActivityList } from "@fabbit/components";
import { Button } from "@fabbit/ui";

const meta = {
  title: "Components/ActivityList",
  component: ActivityList,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof ActivityList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[700px]">
      <ActivityList
        title="내 작업"
        action={
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground">
            전체 보기 <ArrowRight className="size-3" />
          </Button>
        }
        items={[
          {
            id: "1",
            icon: CircleDot,
            iconClassName: "text-emerald-500",
            number: "#42",
            title: "센서 모듈 하우징 간섭 이슈",
            subtitle: "EV 모터 컨트롤러 · 2시간 전",
            label: { name: "긴급", color: "#ef4444" },
            status: { text: "열림", variant: "outline" },
            author: "김태현",
            onClick: () => {},
          },
          {
            id: "2",
            icon: GitPullRequestArrow,
            iconClassName: "text-blue-500",
            number: "#15",
            title: "PCB 커넥터 핀 배열 변경",
            subtitle: "EV 모터 컨트롤러 · 4시간 전",
            label: { name: "설계변경", color: "#3b82f6" },
            status: { text: "검토 중", variant: "outline" },
            author: "이수진",
            onClick: () => {},
          },
          {
            id: "3",
            icon: CircleDot,
            iconClassName: "text-emerald-500",
            number: "#78",
            title: "방열판 재질 SUS304 → AL6061 검토",
            subtitle: "배터리 팩 v2 · 1일 전",
            label: { name: "검토필요", color: "#f59e0b" },
            status: { text: "열림", variant: "outline" },
            author: "박준서",
            onClick: () => {},
          },
        ]}
      />
    </div>
  ),
};
