import type { Meta, StoryObj } from "@storybook/react-vite";
import { PartOwnerTab } from "@fabbit/components";

const members = [
  {
    userId: "user-1",
    fullName: "김도윤",
    email: "doyoon.kim@fabbit.ai",
    profileImageUrl: null,
  },
  {
    userId: "user-2",
    fullName: "박서연",
    email: "seoyeon.park@fabbit.ai",
    profileImageUrl: null,
  },
  {
    userId: "user-3",
    fullName: "이준호",
    email: "junho.lee@fabbit.ai",
    profileImageUrl: null,
  },
];

const teams = [
  {
    id: "team-1",
    name: "생산기술팀",
    memberCount: 8,
  },
  {
    id: "team-2",
    name: "품질보증팀",
    memberCount: 5,
  },
];

const meta = {
  title: "Components/PartOwnerTab",
  component: PartOwnerTab,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    members,
    owner: {
      ownerId: "user-1",
      ownerImageUrl: null,
      ownerName: "김도윤",
      ownerTeamId: "team-1",
      ownerTeamName: "생산기술팀",
    },
    teams,
    isMembersLoading: false,
    isOwnerLoading: false,
    isTeamsLoading: false,
    isUpdating: false,
    onOwnerChange: (_ownerId) => undefined,
    onOwnerTeamChange: (_teamId) => undefined,
  },
} satisfies Meta<typeof PartOwnerTab>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Unassigned: Story = {
  args: {
    owner: {
      ownerId: null,
      ownerImageUrl: null,
      ownerName: null,
      ownerTeamId: null,
      ownerTeamName: null,
    },
  },
};

export const Showcase: Story = {
  render: (args) => (
    <div className="space-y-8">
      <PartOwnerTab {...args} />
      <PartOwnerTab
        {...args}
        owner={{
          ownerId: null,
          ownerImageUrl: null,
          ownerName: null,
          ownerTeamId: null,
          ownerTeamName: null,
        }}
        isMembersLoading={true}
        isTeamsLoading={true}
      />
    </div>
  ),
};
