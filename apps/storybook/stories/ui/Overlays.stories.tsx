import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@fabbit/ui";

const meta = {
  component: Popover,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">팝오버</Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>도면 분석 상태</PopoverTitle>
            <PopoverDescription>12개 파일 중 9개 분석 완료.</PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon"><span className="text-sm font-semibold">N</span></Button>
        </TooltipTrigger>
        <TooltipContent sideOffset={8}>새로운 변경 요청 4건</TooltipContent>
      </Tooltip>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">메뉴</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>결과 다운로드</DropdownMenuItem>
          <DropdownMenuItem>자동화 설정</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">프로젝트 삭제</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};

export const PopoverCard: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">요약 보기</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>도면 분석 상태</PopoverTitle>
          <PopoverDescription>
            12개 파일 중 9개 분석 완료. 3개는 품질 검토 대기 중입니다.
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
};

export const TooltipPreview: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon">
          <span className="text-sm font-semibold">N</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent sideOffset={8}>
        새로운 변경 요청 4건이 도착했습니다.
      </TooltipContent>
    </Tooltip>
  ),
};

export const DropdownMenuPreview: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">작업 메뉴</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <span className="text-xs font-semibold">DL</span>
          결과 다운로드
        </DropdownMenuItem>
        <DropdownMenuItem>
          <span className="text-xs font-semibold">CFG</span>
          자동화 설정
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <span className="text-xs font-semibold">DEL</span>
          프로젝트 삭제
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
