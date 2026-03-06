import type { Meta, StoryObj } from "@storybook/react-vite";
import { CommentInput } from "@fabbit/components";
import { Button, TiptapEditor } from "@fabbit/ui";
import { XCircle } from "lucide-react";

const meta = {
  title: "Components/CommentInput",
  component: CommentInput,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: {
    editor: <TiptapEditor placeholder="댓글을 작성하세요..." minHeight={100} />,
    actions: (
      <>
        <Button size="sm" variant="outline">
          <XCircle className="mr-1.5 h-3.5 w-3.5" />
          이슈 닫기
        </Button>
        <Button size="sm">댓글</Button>
      </>
    ),
  },
} satisfies Meta<typeof CommentInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithUserName: Story = {
  args: {
    userName: "문서연",
  },
};

export const SimpleActions: Story = {
  args: {
    actions: <Button size="sm">댓글</Button>,
  },
};
