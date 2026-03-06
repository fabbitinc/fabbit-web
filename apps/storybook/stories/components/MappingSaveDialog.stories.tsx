import type { Meta, StoryObj } from "@storybook/react-vite";
import { MappingSaveDialog } from "@fabbit/components";
import { Dialog } from "@fabbit/ui";

const meta = {
  title: "Components/MappingSaveDialog",
  component: MappingSaveDialog,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <Dialog open>
        <Story />
      </Dialog>
    ),
  ],
  args: {
    defaultMappingName: "부품 마스터 템플릿",
    isLoadingMappings: false,
    isSubmitting: false,
    mappings: [
      { id: "mapping-1", name: "부품 마스터 템플릿", version: 3 },
      { id: "mapping-2", name: "부품 상세 템플릿", version: 1 },
    ],
    onConfirm: () => undefined,
    onOpenChange: () => undefined,
  },
} satisfies Meta<typeof MappingSaveDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    isLoadingMappings: true,
  },
};

export const EmptyMappings: Story = {
  args: {
    mappings: [],
  },
};
