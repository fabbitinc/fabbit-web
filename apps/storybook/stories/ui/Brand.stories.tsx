import type { Meta, StoryObj } from "@storybook/react-vite";

import { BrandMark, BrandLogo } from "@fabbit/ui";

const meta = {
  title: "UI/Brand",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Mark: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <BrandMark size="xs" />
      <BrandMark size="sm" />
      <BrandMark size="md" />
      <BrandMark size="lg" />
      <BrandMark size="xl" />
    </div>
  ),
};

export const Logo: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <BrandLogo size="sm" />
      <BrandLogo size="md" />
      <BrandLogo size="lg" />
      <BrandLogo size="xl" />
    </div>
  ),
};

export const OnDark: Story = {
  render: () => (
    <div className="flex flex-col gap-6 rounded-xl bg-foreground p-8">
      <BrandLogo size="md" textClassName="text-background" />
      <BrandLogo size="lg" textClassName="text-background" />
    </div>
  ),
};

export const Showcase: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">Mark sizes</p>
        <div className="flex items-end gap-4">
          <BrandMark size="xs" />
          <BrandMark size="sm" />
          <BrandMark size="md" />
          <BrandMark size="lg" />
          <BrandMark size="xl" />
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">Logo sizes</p>
        <div className="flex flex-col gap-4">
          <BrandLogo size="sm" />
          <BrandLogo size="md" />
          <BrandLogo size="lg" />
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">On dark</p>
        <div className="rounded-xl bg-foreground p-6">
          <BrandLogo size="md" textClassName="text-background" />
        </div>
      </div>
    </div>
  ),
};
