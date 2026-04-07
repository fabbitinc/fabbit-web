import type { Meta, StoryObj } from "@storybook/react-vite";
import { IssueCreateScreen } from "@fabbit/components";

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

const parts = [
  { id: "part-1", partNumber: "MC-2048-A", name: "모터 컨트롤러 하우징" },
  { id: "part-2", partNumber: "BT-1024-C", name: "배터리 팩 브래킷" },
  { id: "part-3", partNumber: "CN-7781-B", name: "커넥터 핀 어셈블리" },
];

const meta = {
  title: "Components/IssueCreateScreen",
  component: IssueCreateScreen,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof IssueCreateScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    assigneeOptions: members,
    labelOptions: labels,
    partOptions: parts,
    onBack: () => {},
    onRequestAssignees: () => {},
    onRequestLabels: () => {},
    onRequestParts: () => {},
    onSubmit: async () => {},
  },
};
