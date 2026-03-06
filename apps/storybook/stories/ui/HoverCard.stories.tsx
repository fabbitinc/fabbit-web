import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarDays } from "lucide-react";

import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
} from "@fabbit/ui";

const meta = {
  title: "UI/HoverCard",
  component: HoverCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof HoverCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">박기계</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex gap-4">
          <Avatar>
            <AvatarFallback>박</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">박기계</h4>
            <p className="text-sm text-muted-foreground">
              CNC 가공팀 수석 기술자. 5축 밀링 전문.
            </p>
            <div className="flex items-center pt-2">
              <CalendarDays className="mr-2 size-4 opacity-70" />
              <span className="text-xs text-muted-foreground">
                입사일 2019-03-15
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const Showcase: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">작업자 정보</p>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link">박기계</Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="flex gap-4">
              <Avatar>
                <AvatarFallback>박</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">박기계</h4>
                <p className="text-sm text-muted-foreground">
                  CNC 가공팀 수석 기술자
                </p>
                <div className="flex items-center pt-2">
                  <CalendarDays className="mr-2 size-4 opacity-70" />
                  <span className="text-xs text-muted-foreground">
                    입사일 2019-03-15
                  </span>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">설비 정보</p>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link">CNC-003</Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">5축 CNC 밀링</h4>
              <p className="text-sm text-muted-foreground">
                DMG MORI DMU 50 3rd Gen
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">가동률</span>
                  <p>94.2%</p>
                </div>
                <div>
                  <span className="font-medium text-foreground">상태</span>
                  <p>가동중</p>
                </div>
                <div>
                  <span className="font-medium text-foreground">최근 정비</span>
                  <p>2026-03-06</p>
                </div>
                <div>
                  <span className="font-medium text-foreground">위치</span>
                  <p>A동 2라인</p>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  ),
};
