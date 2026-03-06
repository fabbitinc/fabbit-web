import type { Meta, StoryObj } from "@storybook/react-vite";
import { PartPickerSection } from "@fabbit/components";

const searchedParts = [
  { id: "p1", partNumber: "DRV-PLATE-0142", name: "드라이브 유닛 베이스 플레이트" },
  { id: "p2", partNumber: "CTRL-PCB-0207", name: "모터 제어 PCB" },
  { id: "p3", partNumber: "HSG-INV-0089", name: "인버터 하우징" },
  { id: "p4", partNumber: "BRK-ASM-0331", name: "브레이크 조립체" },
];

const meta = {
  title: "Components/PartPickerSection",
  component: PartPickerSection,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="w-70"><Story /></div>],
  args: {
    searchedParts,
    selectedIds: ["p1", "p2"],
    displayParts: [
      { id: "p1", partNumber: "DRV-PLATE-0142", name: "드라이브 유닛 베이스 플레이트", category: "기구" },
      { id: "p2", partNumber: "CTRL-PCB-0207", name: "모터 제어 PCB", category: "전자" },
    ],
    onSync: (ids: string[]) => console.log("sync:", ids),
    onRequestParts: () => console.log("request parts"),
    onSearchChange: (q: string) => console.log("search:", q),
  },
} satisfies Meta<typeof PartPickerSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ReadOnly: Story = {
  args: {
    onSync: undefined,
  },
};

export const Empty: Story = {
  args: {
    selectedIds: [],
    displayParts: [],
    searchedParts: [],
  },
};

export const Searching: Story = {
  args: {
    isSearching: true,
  },
};
