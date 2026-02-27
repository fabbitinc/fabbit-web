import * as React from "react";

type LabelBadgeProps = {
  label: string;
  colorHex: string;
  size?: "sm" | "base" | "md";
  design?: "soft-1" | "soft-2" | "soft-3" | "soft-4" | "soft-5";
} & Omit<React.ComponentPropsWithoutRef<"span">, "children">;

const sizeStyleMap: Record<NonNullable<LabelBadgeProps["size"]>, React.CSSProperties> = {
  sm: {
    padding: "2px 8px",
    fontSize: "10px",
    lineHeight: "14px",
  },
  base: {
    padding: "3px 9px",
    fontSize: "11px",
    lineHeight: "15px",
  },
  md: {
    padding: "4px 10px",
    fontSize: "12px",
    lineHeight: "16px",
  },
} as const;

const DEFAULT_HEX = "#64748b";

function normalizeHex(hex?: string | null): string {
  const value = typeof hex === "string" ? hex.trim() : "";
  if (/^#[0-9a-f]{6}$/i.test(value)) {
    return value;
  }
  if (/^#[0-9a-f]{3}$/i.test(value)) {
    const [, r, g, b] = value;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return DEFAULT_HEX;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = normalizeHex(hex);
  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  };
}

function rgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function shade(hex: string, ratio: number): string {
  const { r, g, b } = hexToRgb(hex);
  const next = (value: number) => Math.max(0, Math.min(255, Math.round(value * ratio)));
  return `rgb(${next(r)}, ${next(g)}, ${next(b)})`;
}

function designStyle(colorHex: string, design: NonNullable<LabelBadgeProps["design"]>): React.CSSProperties {
  const safeHex = normalizeHex(colorHex);
  if (design === "soft-4") {
    return {
      backgroundColor: rgba(safeHex, 0.18),
      color: shade(safeHex, 0.56),
      borderColor: rgba(safeHex, 0.45),
      borderWidth: 1,
      borderStyle: "solid",
      boxShadow: `inset 0 1px 0 ${rgba(safeHex, 0.18)}`,
    };
  }

  if (design === "soft-5") {
    return {
      backgroundColor: rgba(safeHex, 0.24),
      color: shade(safeHex, 0.5),
      borderColor: rgba(safeHex, 0.5),
      borderWidth: 1,
      borderStyle: "solid",
      boxShadow: `0 0 0 1px ${rgba(safeHex, 0.08)}`,
    };
  }

  if (design === "soft-3") {
    return {
      backgroundColor: rgba(safeHex, 0.2),
      color: shade(safeHex, 0.62),
      borderColor: rgba(safeHex, 0.4),
      borderWidth: 1,
      borderStyle: "solid",
    };
  }

  if (design === "soft-1") {
    return {
      backgroundColor: rgba(safeHex, 0.1),
      color: shade(safeHex, 0.78),
      borderColor: rgba(safeHex, 0.24),
      borderWidth: 1,
      borderStyle: "solid",
    };
  }

  return {
    backgroundColor: rgba(safeHex, 0.14),
    color: shade(safeHex, 0.7),
    borderColor: rgba(safeHex, 0.32),
    borderWidth: 1,
    borderStyle: "solid",
  };
}

export function LabelBadge({
  label,
  colorHex,
  size = "base",
  design = "soft-4",
  className,
  style,
  ...props
}: LabelBadgeProps) {
  const classes = [
    "inline-flex items-center rounded-full font-medium",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} style={{ ...sizeStyleMap[size], ...designStyle(colorHex, design), ...style }} {...props}>
      {label}
    </span>
  );
}

export type { LabelBadgeProps };
