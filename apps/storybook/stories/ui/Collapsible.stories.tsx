import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChevronsUpDown } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger, Button } from "@fabbit/ui";

const meta = {
  title: "UI/Collapsible",
  component: Collapsible,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Collapsible>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <Collapsible open={open} onOpenChange={setOpen} className="w-[350px] space-y-2">
        <div className="flex items-center justify-between rounded-md border px-4 py-2">
          <h4 className="text-sm font-semibold">상세 필터</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronsUpDown className="size-4" />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border px-4 py-2 text-sm">공정: CNC 밀링</div>
          <div className="rounded-md border px-4 py-2 text-sm">설비: CNC-001 ~ CNC-005</div>
          <div className="rounded-md border px-4 py-2 text-sm">기간: 2026-03-01 ~ 2026-03-07</div>
        </CollapsibleContent>
      </Collapsible>
    );
  },
};

export const Showcase: Story = {
  render: () => {
    const [filter, setFilter] = useState(false);
    const [detail, setDetail] = useState(true);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "350px" }}>
        <div>
          <p className="mb-3 text-sm font-medium text-muted-foreground">필터 패널</p>
          <Collapsible open={filter} onOpenChange={setFilter} className="space-y-2">
            <div className="flex items-center justify-between rounded-md border px-4 py-2">
              <h4 className="text-sm font-semibold">상세 필터</h4>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronsUpDown className="size-4" />
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-2">
              <div className="rounded-md border px-4 py-2 text-sm">공정: CNC 밀링</div>
              <div className="rounded-md border px-4 py-2 text-sm">설비: CNC-001 ~ CNC-005</div>
              <div className="rounded-md border px-4 py-2 text-sm">기간: 2026-03-01 ~ 2026-03-07</div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-muted-foreground">부가 정보 (기본 열림)</p>
          <Collapsible open={detail} onOpenChange={setDetail} className="space-y-2">
            <div className="flex items-center justify-between rounded-md border px-4 py-2">
              <h4 className="text-sm font-semibold">검사 이력</h4>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronsUpDown className="size-4" />
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-2">
              <div className="rounded-md border px-4 py-2 text-sm">
                <p className="font-medium">수입 검사 #QC-0412</p>
                <p className="text-muted-foreground">2026-03-05 합격 (전량)</p>
              </div>
              <div className="rounded-md border px-4 py-2 text-sm">
                <p className="font-medium">공정 검사 #QC-0415</p>
                <p className="text-muted-foreground">2026-03-06 합격 (샘플링 n=5)</p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    );
  },
};
