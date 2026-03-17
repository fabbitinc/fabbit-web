import type { Meta, StoryObj } from "@storybook/react-vite";
import { IssueDetailScreen } from "@fabbit/components";
import { manufacturingIssueDetailArgs } from "../shared/issue-detail-story-data";

const meta = {
  title: "Components/IssueDetailScreen",
  component: IssueDetailScreen,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: manufacturingIssueDetailArgs,
} satisfies Meta<typeof IssueDetailScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
