import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { UserAvatar } from "@fabbit/ui";

const meta = {
  component: UserAvatar,
  tags: ["autodocs"],
  args: {
    name: "Seongha Moon",
    variant: "circle",
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof UserAvatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InitialsOnly: Story = {};

export const Rounded: Story = {
  args: {
    name: "Fabbit Designer",
    variant: "rounded",
    className: "h-12 w-12",
  },
};

export const WithImage: Story = {
  args: {
    imageUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' rx='24' fill='%23dbeafe'/%3E%3Ccircle cx='48' cy='36' r='18' fill='%230f172a' fill-opacity='0.18'/%3E%3Cpath d='M24 82c5-15 20-24 24-24s19 9 24 24' fill='%230f172a' fill-opacity='0.18'/%3E%3C/svg%3E",
    className: "h-12 w-12",
  },
};
