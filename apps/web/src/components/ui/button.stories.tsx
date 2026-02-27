import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Button",
  },
};

export default meta;

export const Default = {};

export const Secondary = {
  args: {
    variant: "secondary",
  },
};

export const Destructive = {
  args: {
    variant: "destructive",
  },
};

export const Outline = {
  args: {
    variant: "outline",
  },
};
