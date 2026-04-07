import type { Meta, StoryObj } from "@storybook/react-vite";
import { EngineeringChangeCreateScreen } from "@fabbit/components";

const members = [
  { id: "user-1", name: "김태현", email: "taehyun.kim@fabbit.io", profileImageUrl: null },
  { id: "user-2", name: "이수진", email: "soojin.lee@fabbit.io", profileImageUrl: null },
  { id: "user-3", name: "박준서", email: "junseo.park@fabbit.io", profileImageUrl: null },
];

const labels = [
  { id: "label-1", name: "긴급", colorHex: "#ef4444" },
  { id: "label-2", name: "설계검토", colorHex: "#3b82f6" },
  { id: "label-3", name: "양산대응", colorHex: "#10b981" },
];

const revisions = [
  { id: "rev-1", partNumber: "MC-2048-A", name: "모터 컨트롤러 하우징", revisionCode: "1" },
  { id: "rev-2", partNumber: "BT-1024-C", name: "배터리 팩 브래킷", revisionCode: "2" },
  { id: "rev-3", partNumber: "CN-7781-B", name: "커넥터 핀 어셈블리", revisionCode: "1" },
];

const meta = {
  title: "Components/EngineeringChangeCreateScreen",
  component: EngineeringChangeCreateScreen,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof EngineeringChangeCreateScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    labelOptions: labels,
    memberOptions: members,
    affectedItemSearchItems: revisions,
    onBack: () => {},
    onRequestLabels: () => {},
    onRequestMembers: () => {},
    onRequestAffectedItems: () => {},
    onSubmit: async () => {},
  },
};
