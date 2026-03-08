import type { Meta, StoryObj } from "@storybook/react-vite";
import { PartsTemplateMappingScreenDemo } from "./parts-template-mapping-screen-demo";

const meta = {
  title: "Components/PartsTemplateMappingScreen",
  component: PartsTemplateMappingScreenDemo,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof PartsTemplateMappingScreenDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <PartsTemplateMappingScreenDemo />,
};

export const LoadingRules: Story = {
  render: () => <PartsTemplateMappingScreenDemo isLoadingBoard />,
};

export const DisabledConfirm: Story = {
  render: () => <PartsTemplateMappingScreenDemo scenario="missing-part-merge-key" />,
};

export const EmptyState: Story = {
  render: () => (
    <PartsTemplateMappingScreenDemo
      emptyState={{
        onBackClick: () => undefined,
        onRetryClick: () => undefined,
      }}
    />
  ),
};
