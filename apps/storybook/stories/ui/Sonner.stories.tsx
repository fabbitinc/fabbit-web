import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { toast } from "sonner";

import { Button, Toaster } from "@fabbit/ui";

const meta = {
  title: "UI/Sonner",
  component: Toaster,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster position="bottom-right" richColors />
      </>
    ),
  ],
} satisfies Meta<typeof Toaster>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Button variant="outline" onClick={() => toast("기본 알림입니다.")}>
      기본 토스트
    </Button>
  ),
};

export const Success: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => toast.success("변경 사항이 저장되었습니다.")}
    >
      성공 토스트
    </Button>
  ),
};

export const Error: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => toast.error("저장에 실패했습니다. 다시 시도해 주세요.")}
    >
      에러 토스트
    </Button>
  ),
};

export const Warning: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => toast.warning("저장 공간이 80%를 초과했습니다.")}
    >
      경고 토스트
    </Button>
  ),
};

export const Info: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => toast.info("새로운 업데이트가 있습니다.")}
    >
      정보 토스트
    </Button>
  ),
};

export const WithDescription: Story = {
  name: "설명 포함",
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toast.success("도면 업로드 완료", {
          description: "3개 파일이 성공적으로 업로드되었습니다.",
        })
      }
    >
      설명 포함 토스트
    </Button>
  ),
};

export const WithAction: Story = {
  name: "액션 버튼",
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toast("부품이 삭제되었습니다.", {
          action: {
            label: "되돌리기",
            onClick: () => toast.success("삭제가 취소되었습니다."),
          },
        })
      }
    >
      액션 포함 토스트
    </Button>
  ),
};

export const Promise: Story = {
  name: "비동기 처리",
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toast.promise(
          new window.Promise<{ name: string }>((resolve) =>
            setTimeout(() => resolve({ name: "BOM-2024-001" }), 2000),
          ),
          {
            loading: "BOM을 분석하고 있습니다...",
            success: (data) => `${data.name} 분석이 완료되었습니다.`,
            error: "BOM 분석에 실패했습니다.",
          },
        )
      }
    >
      비동기 토스트
    </Button>
  ),
};

export const AllVariants: Story = {
  name: "모든 변형",
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => toast("기본 알림")}>
        기본
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.success("성공했습니다.")}
      >
        성공
      </Button>
      <Button variant="outline" onClick={() => toast.error("실패했습니다.")}>
        에러
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.warning("주의가 필요합니다.")}
      >
        경고
      </Button>
      <Button variant="outline" onClick={() => toast.info("참고 사항입니다.")}>
        정보
      </Button>
    </div>
  ),
};
