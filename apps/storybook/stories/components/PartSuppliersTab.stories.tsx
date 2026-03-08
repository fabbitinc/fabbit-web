import type { Meta, StoryObj } from "@storybook/react-vite";
import { PartSuppliersTab } from "@fabbit/components";

const sampleSuppliers = [
  {
    id: "supplier-1",
    companyName: "한빛정밀",
    code: "HBP-204",
    country: "대한민국",
    unitCost: 12500,
  },
  {
    id: "supplier-2",
    companyName: "Shinwa Components",
    code: "SW-88",
    country: "일본",
    unitCost: 14800,
  },
];

const meta = {
  title: "Components/PartSuppliersTab",
  component: PartSuppliersTab,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    suppliers: sampleSuppliers,
    isLoading: false,
  },
} satisfies Meta<typeof PartSuppliersTab>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    suppliers: [],
  },
};

export const Showcase: Story = {
  render: (args) => (
    <div className="space-y-8">
      <PartSuppliersTab {...args} />
      <PartSuppliersTab {...args} suppliers={[]} isLoading={true} />
    </div>
  ),
};
