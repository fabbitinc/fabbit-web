import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bold, Italic, Underline, List, Grid2x2, LayoutList } from "lucide-react";

import { Toggle, ToggleGroup, ToggleGroupItem } from "@fabbit/ui";

const meta = {
  title: "UI/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Toggle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Toggle aria-label="굵게">
      <Bold />
    </Toggle>
  ),
};

export const Outline: Story = {
  render: () => (
    <Toggle variant="outline" aria-label="기울임">
      <Italic />
    </Toggle>
  ),
};

export const Showcase: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">단일 토글</p>
        <div className="flex gap-2">
          <Toggle aria-label="굵게"><Bold /></Toggle>
          <Toggle aria-label="기울임"><Italic /></Toggle>
          <Toggle aria-label="밑줄"><Underline /></Toggle>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">토글 그룹 (단일 선택)</p>
        <ToggleGroup type="single" defaultValue="list" variant="outline">
          <ToggleGroupItem value="list" aria-label="리스트 뷰">
            <LayoutList />
          </ToggleGroupItem>
          <ToggleGroupItem value="grid" aria-label="그리드 뷰">
            <Grid2x2 />
          </ToggleGroupItem>
          <ToggleGroupItem value="board" aria-label="보드 뷰">
            <List />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">토글 그룹 (복수 선택)</p>
        <ToggleGroup type="multiple" variant="outline">
          <ToggleGroupItem value="bold" aria-label="굵게"><Bold /></ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="기울임"><Italic /></ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="밑줄"><Underline /></ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  ),
};
