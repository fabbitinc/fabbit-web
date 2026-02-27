import { LabelBadge } from "@fabbit/ui";

const meta = {
  component: LabelBadge,
  tags: ["autodocs"],
  args: {
    label: "설계변경",
    colorHex: "#3b82f6",
    size: "base",
    design: "soft-4",
  },
};

export default meta;

export const Default = {};

export const Small = {
  args: {
    size: "sm",
  },
};

export const Designs = {
  render: () => {
    const rows = [
      { label: "Soft 1 (Light)", design: "soft-1" },
      { label: "Soft 2 (Default)", design: "soft-2" },
      { label: "Soft 3 (Balanced)", design: "soft-3" },
      { label: "Soft 4 (Dense)", design: "soft-4" },
      { label: "Soft 5 (Strong)", design: "soft-5" },
    ] as const;

    const presets = [
      { label: "설계변경", colorHex: "#3b82f6" },
      { label: "BOM변경", colorHex: "#8b5cf6" },
      { label: "재질변경", colorHex: "#f59e0b" },
      { label: "긴급", colorHex: "#ef4444" },
      { label: "리뷰필요", colorHex: "#eab308" },
      { label: "공정변경", colorHex: "#14b8a6" },
    ];

    return (
      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.design} className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">{row.label}</p>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <LabelBadge
                  key={`${row.design}-${preset.label}`}
                  label={preset.label}
                  colorHex={preset.colorHex}
                  design={row.design}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};

export const HexInput = {
  args: {
    label: "사용자 입력 색상",
    colorHex: "#10b981",
    design: "soft-4",
  },
};
