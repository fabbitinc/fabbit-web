import type { Meta, StoryObj } from "@storybook/react-vite";

import { RadioGroup, RadioGroupItem, Label } from "@fabbit/ui";

const meta = {
  title: "UI/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option-1">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-1" id="r1" />
        <Label htmlFor="r1">자동 배정</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-2" id="r2" />
        <Label htmlFor="r2">수동 배정</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-3" id="r3" />
        <Label htmlFor="r3">우선순위 기반</Label>
      </div>
    </RadioGroup>
  ),
};

export const Showcase: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "300px" }}>
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">작업자 배정 방식</p>
        <RadioGroup defaultValue="auto">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="auto" id="assign-auto" />
            <Label htmlFor="assign-auto">자동 배정</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="manual" id="assign-manual" />
            <Label htmlFor="assign-manual">수동 배정</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="priority" id="assign-priority" />
            <Label htmlFor="assign-priority">우선순위 기반</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">검사 유형</p>
        <RadioGroup defaultValue="incoming">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="incoming" id="qc-incoming" />
            <Label htmlFor="qc-incoming">수입 검사</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="process" id="qc-process" />
            <Label htmlFor="qc-process">공정 검사</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="final" id="qc-final" />
            <Label htmlFor="qc-final">최종 검사</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="outgoing" id="qc-outgoing" />
            <Label htmlFor="qc-outgoing">출하 검사</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  ),
};
