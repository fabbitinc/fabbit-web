import type { Meta, StoryObj } from "@storybook/react-vite";
import { TimelineComment } from "@fabbit/components";

const meta = {
  title: "Components/TimelineComment",
  component: TimelineComment,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: {
    author: { name: "문서연", profileImageUrl: null },
    createdAtLabel: "3시간 전",
    showAuthorBadge: true,
    children: "인버터 하우징 간섭 문제를 확인했습니다. 브레이크 조립체 위치를 15mm 이동하면 해결됩니다.",
  },
} satisfies Meta<typeof TimelineComment>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Modified: Story = {
  args: {
    isModified: true,
    children: "수정된 댓글 내용입니다. CNC 가공 조건을 재검토해야 합니다.",
  },
};

export const WithEditButton: Story = {
  args: {
    onEdit: () => console.log("edit"),
  },
};

export const NoBadge: Story = {
  args: {
    showAuthorBadge: false,
    author: { name: "김하준", profileImageUrl: null },
    createdAtLabel: "1일 전",
    children: "시뮬레이션 결과 첨부합니다. 간섭 여유 3.2mm 확보 가능합니다.",
  },
};
