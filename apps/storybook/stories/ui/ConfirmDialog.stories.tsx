import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button, ConfirmDialog } from "@fabbit/ui";

const meta = {
  component: ConfirmDialog,
  tags: ["autodocs"],
  args: {
    title: "프로젝트를 삭제할까요?",
    description: "삭제 후에는 연결된 활동 내역과 초대 링크를 복구할 수 없습니다.",
    confirmLabel: "삭제",
    cancelLabel: "취소",
    variant: "destructive",
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => {
    const [openDestructive, setOpenDestructive] = React.useState(false);
    const [openDefault, setOpenDefault] = React.useState(false);

    return (
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <Button variant="destructive" onClick={() => setOpenDestructive(true)}>위험 작업</Button>
        <Button variant="outline" onClick={() => setOpenDefault(true)}>일반 확인</Button>
        <ConfirmDialog
          open={openDestructive}
          onOpenChange={setOpenDestructive}
          onConfirm={() => setOpenDestructive(false)}
          title="프로젝트를 삭제할까요?"
          description="삭제 후에는 복구할 수 없습니다."
          confirmLabel="삭제"
          variant="destructive"
        />
        <ConfirmDialog
          open={openDefault}
          onOpenChange={setOpenDefault}
          onConfirm={() => setOpenDefault(false)}
          title="멤버를 제거할까요?"
          description="접근 권한이 즉시 해제됩니다."
          confirmLabel="제거"
          variant="default"
        />
      </div>
    );
  },
};

export const Preview: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <Button variant="outline" onClick={() => setOpen(true)}>
          다이얼로그 열기
        </Button>
        <ConfirmDialog
          {...args}
          open={open}
          onOpenChange={setOpen}
          onConfirm={() => setOpen(false)}
        />
      </div>
    );
  },
};

export const DefaultTone: Story = {
  args: {
    title: "멤버를 제거할까요?",
    description: "멤버를 제거하면 프로젝트 접근 권한이 즉시 해제됩니다.",
    confirmLabel: "제거",
    variant: "default",
  },
  render: (args) => {
    const [open, setOpen] = React.useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <Button variant="outline" onClick={() => setOpen(true)}>
          다이얼로그 열기
        </Button>
        <ConfirmDialog
          {...args}
          open={open}
          onOpenChange={setOpen}
          onConfirm={() => setOpen(false)}
        />
      </div>
    );
  },
};
