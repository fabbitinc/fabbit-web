import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProjectSettingsLabelsTab } from "@fabbit/components";

const meta = {
  title: "Components/ProjectSettingsLabelsTab",
  component: ProjectSettingsLabelsTab,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof ProjectSettingsLabelsTab>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomLink: Story = {
  args: {
    href: "/organization/settings?menu=labels",
  },
};
