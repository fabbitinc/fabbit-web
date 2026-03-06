import type { Meta, StoryObj } from "@storybook/react-vite";

import { Slider, Label } from "@fabbit/ui";

const meta = {
  title: "UI/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Slider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[300px]">
      <Slider defaultValue={[50]} max={100} step={1} />
    </div>
  ),
};

export const Showcase: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "300px" }}>
      <div className="space-y-3">
        <Label>가동률 목표 (%)</Label>
        <Slider defaultValue={[90]} max={100} step={1} />
      </div>

      <div className="space-y-3">
        <Label>허용 불량률 (%)</Label>
        <Slider defaultValue={[2]} max={10} step={0.1} />
      </div>

      <div className="space-y-3">
        <Label>알림 임계값 (개)</Label>
        <Slider defaultValue={[50]} max={200} step={10} />
      </div>
    </div>
  ),
};
