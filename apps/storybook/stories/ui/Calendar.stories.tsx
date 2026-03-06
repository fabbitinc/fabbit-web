import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { DateRange } from "react-day-picker";
import { addDays } from "date-fns";

import { Calendar } from "@fabbit/ui";

const meta = {
  title: "UI/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Calendar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
    );
  },
};

export const Showcase: Story = {
  render: () => {
    const [single, setSingle] = useState<Date | undefined>(new Date());
    const [range, setRange] = useState<DateRange | undefined>({
      from: new Date(),
      to: addDays(new Date(), 6),
    });

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", alignItems: "center" }}>
        <div>
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            단일 날짜 선택 (납기일)
          </p>
          <Calendar
            mode="single"
            selected={single}
            onSelect={setSingle}
            className="rounded-md border"
          />
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            범위 선택 (생산 계획 기간)
          </p>
          <Calendar
            mode="range"
            selected={range}
            onSelect={setRange}
            numberOfMonths={2}
            className="rounded-md border"
          />
        </div>
      </div>
    );
  },
};
