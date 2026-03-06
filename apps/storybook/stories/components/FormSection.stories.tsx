import type { Meta, StoryObj } from "@storybook/react-vite";

import { FormSection } from "@fabbit/components";
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from "@fabbit/ui";

const meta = {
  title: "Components/FormSection",
  component: FormSection,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof FormSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[500px] space-y-8">
      <FormSection
        title="기본 정보"
        description="작업지시의 기본 항목을 입력하세요."
      >
        <div className="space-y-2">
          <Label htmlFor="wo-number">작업지시 번호</Label>
          <Input id="wo-number" placeholder="WO-2026-0000" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product">생산 품목</Label>
          <Select>
            <SelectTrigger id="product">
              <SelectValue placeholder="품목 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bracket">AL-BRACKET-V3</SelectItem>
              <SelectItem value="housing">MOTOR-HOUSING-A1</SelectItem>
              <SelectItem value="shaft">DRIVE-SHAFT-S2</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="qty">목표 수량</Label>
          <Input id="qty" type="number" placeholder="0" />
        </div>
      </FormSection>

      <FormSection title="비고">
        <div className="space-y-2">
          <Label htmlFor="note">메모</Label>
          <Textarea id="note" placeholder="특이사항을 입력하세요..." />
        </div>
      </FormSection>
    </div>
  ),
};
