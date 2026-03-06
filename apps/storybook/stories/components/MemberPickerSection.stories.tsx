import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemberPickerSection } from "@fabbit/components";

const availableMembers = [
  { id: "u1", name: "문서연", email: "seoyeon.moon@fabbit.dev" },
  { id: "u2", name: "김하준", email: "hajun.kim@fabbit.dev" },
  { id: "u3", name: "이수진", email: "sujin.lee@fabbit.dev" },
  { id: "u4", name: "박도현", email: "dohyun.park@fabbit.dev" },
];

const meta = {
  title: "Components/MemberPickerSection",
  component: MemberPickerSection,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="w-70"><Story /></div>],
  args: {
    label: "담당자",
    applyLabel: "담당자 적용",
    availableMembers,
    selectedIds: ["u1"],
    displayItems: [
      { id: "u1", name: "문서연", profileImageUrl: null },
    ],
    onSync: (ids: string[]) => console.log("sync:", ids),
    onRequestMembers: () => console.log("request members"),
  },
} satisfies Meta<typeof MemberPickerSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MultipleSelected: Story = {
  args: {
    selectedIds: ["u1", "u2"],
    displayItems: [
      { id: "u1", name: "문서연", profileImageUrl: null },
      { id: "u2", name: "김하준", profileImageUrl: null },
    ],
  },
};

export const ReadOnly: Story = {
  args: {
    onSync: undefined,
    displayItems: [
      { id: "u1", name: "문서연", profileImageUrl: null },
    ],
  },
};

export const Empty: Story = {
  args: {
    selectedIds: [],
    displayItems: [],
  },
};
