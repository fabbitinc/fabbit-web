import type { Meta, StoryObj } from "@storybook/react-vite";
import { LabelPickerSection } from "@fabbit/components";

const availableLabels = [
  { id: "l1", name: "긴급", colorHex: "#ef4444" },
  { id: "l2", name: "양산 영향", colorHex: "#2563eb" },
  { id: "l3", name: "설계변경", colorHex: "#10b981" },
  { id: "l4", name: "공급사", colorHex: "#f59e0b" },
  { id: "l5", name: "시험검증", colorHex: "#6b7280" },
];

const meta = {
  title: "Components/LabelPickerSection",
  component: LabelPickerSection,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="w-70"><Story /></div>],
  args: {
    availableLabels,
    selectedIds: ["l1", "l3"],
    displayLabels: [
      { id: "l1", name: "긴급", colorHex: "#ef4444" },
      { id: "l3", name: "설계변경", colorHex: "#10b981" },
    ],
    onSync: (ids: string[]) => console.log("sync:", ids),
    onRequestLabels: () => console.log("request labels"),
  },
} satisfies Meta<typeof LabelPickerSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ManyLabels: Story = {
  args: {
    selectedIds: ["l1", "l2", "l3", "l4", "l5"],
    displayLabels: availableLabels,
  },
};

export const ReadOnly: Story = {
  args: {
    onSync: undefined,
    displayLabels: [
      { id: "l1", name: "긴급", colorHex: "#ef4444" },
    ],
  },
};

export const Empty: Story = {
  args: {
    selectedIds: [],
    displayLabels: [],
  },
};
