import { type ComponentProps } from "react";
import { cn } from "./lib/utils";

/* ------------------------------------------------------------------ */
/*  BrandMark — 아이콘만 (그라디언트 배경 + 레이어 SVG)                    */
/* ------------------------------------------------------------------ */

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const sizeMap: Record<Size, { box: string; icon: string; radius: string }> = {
  xs: { box: "h-6 w-6", icon: "h-3.5 w-3.5", radius: "rounded-md" },
  sm: { box: "h-8 w-8", icon: "h-4.5 w-4.5", radius: "rounded-lg" },
  md: { box: "h-9 w-9", icon: "h-5 w-5", radius: "rounded-lg" },
  lg: { box: "h-10 w-10", icon: "h-6 w-6", radius: "rounded-xl" },
  xl: { box: "h-12 w-12", icon: "h-7 w-7", radius: "rounded-xl" },
};

interface BrandMarkProps extends ComponentProps<"div"> {
  size?: Size;
}

function BrandMark({ size = "md", className, ...props }: BrandMarkProps) {
  const s = sizeMap[size];
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        s.box,
        s.radius,
        className,
      )}
      style={{
        background: "linear-gradient(135deg, var(--logo-from), var(--logo-to))",
      }}
      {...props}
    >
      <svg
        className={cn(s.icon, "text-white")}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  BrandLogo — 아이콘 + 워드마크 (Fabbit)                              */
/* ------------------------------------------------------------------ */

const textSizeMap: Record<Size, string> = {
  xs: "text-sm",
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-2xl",
};

interface BrandLogoProps extends ComponentProps<"div"> {
  size?: Size;
  /** 텍스트 색상 — 기본값은 foreground */
  textClassName?: string;
}

function BrandLogo({
  size = "md",
  className,
  textClassName,
  ...props
}: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)} {...props}>
      <BrandMark size={size} />
      <span
        className={cn(
          "font-bold leading-none",
          textSizeMap[size],
          textClassName ?? "text-foreground",
        )}
      >
        Fabbit
      </span>
    </div>
  );
}

export { BrandMark, BrandLogo };
export type { BrandMarkProps, BrandLogoProps, Size as BrandSize };
