import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Progress,
} from "@fabbit/ui";

const meta = {
  component: Progress,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Progress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ProgressStates: Story = {
  render: () => (
    <div className="flex min-w-[360px] flex-col gap-4 rounded-xl border p-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>도면 업로드</span>
          <span className="text-muted-foreground">24%</span>
        </div>
        <Progress value={24} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>BOM 분석</span>
          <span className="text-muted-foreground">66%</span>
        </div>
        <Progress value={66} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>검토 체크리스트</span>
          <span className="text-muted-foreground">100%</span>
        </div>
        <Progress value={100} />
      </div>
    </div>
  ),
};

export const Showcase: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "360px" }}>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>도면 업로드</span>
          <span className="text-muted-foreground">24%</span>
        </div>
        <Progress value={24} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>BOM 분석</span>
          <span className="text-muted-foreground">66%</span>
        </div>
        <Progress value={66} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>검토 체크리스트</span>
          <span className="text-muted-foreground">100%</span>
        </div>
        <Progress value={100} />
      </div>
    </div>
  ),
};

export const AlertDialogPreview: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <Button variant="outline" onClick={() => setOpen(true)}>
          위험 작업 확인
        </Button>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>연동을 해제할까요?</AlertDialogTitle>
              <AlertDialogDescription>
                해제하면 자동 동기화가 멈추고, 수동 업로드만 가능해집니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={() => setOpen(false)}>
                해제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  },
};
