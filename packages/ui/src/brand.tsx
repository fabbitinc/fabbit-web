import { type ComponentProps, type ReactNode } from "react";
import { cn } from "./lib/cn";

/* ------------------------------------------------------------------ */
/*  Size system                                                        */
/* ------------------------------------------------------------------ */

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const sizeMap: Record<Size, { box: string; icon: string; radius: string }> = {
  xs: { box: "h-6 w-6", icon: "h-3.5 w-3.5", radius: "rounded-md" },
  sm: { box: "h-8 w-8", icon: "h-4.5 w-4.5", radius: "rounded-lg" },
  md: { box: "h-9 w-9", icon: "h-5 w-5", radius: "rounded-lg" },
  lg: { box: "h-10 w-10", icon: "h-6 w-6", radius: "rounded-xl" },
  xl: { box: "h-12 w-12", icon: "h-7 w-7", radius: "rounded-xl" },
};

const textSizeMap: Record<Size, string> = {
  xs: "text-sm",
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-2xl",
};

/* ------------------------------------------------------------------ */
/*  Theme definitions — 10 brand identities                            */
/* ------------------------------------------------------------------ */

interface BrandThemeDef {
  name: string;
  fontFamily: string;
  icon: ReactNode;
}

const brandThemes: Record<string, BrandThemeDef> = {
  /* 1. Blueprint Blue — Inter */
  "theme-primary-1": {
    name: "Fabbit",
    fontFamily: "'Inter', sans-serif",
    icon: (
      <>
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </>
    ),
  },
  /* 2. High-Tech Precision — Montserrat */
  "theme-primary-2": {
    name: "Fabbit",
    fontFamily: "'Montserrat', sans-serif",
    icon: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
      </>
    ),
  },
  /* 3. Mossy Production — Poppins */
  "theme-primary-3": {
    name: "Fabbit",
    fontFamily: "'Poppins', sans-serif",
    icon: (
      <>
        <path d="M7 20h10" />
        <path d="M12 20v-6" />
        <path d="M12 14c-4 0-7-3-7-7 4 0 7 3 7 7z" />
        <path d="M12 10c4-1 7-4 7-8-4 1-7 4-7 8z" />
      </>
    ),
  },
  /* 4. Cobalt Trust — Roboto */
  "theme-primary-4": {
    name: "Fabbit",
    fontFamily: "'Roboto', sans-serif",
    icon: (
      <>
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </>
    ),
  },
  /* 5. Slate Innovation — Open Sans */
  "theme-primary-5": {
    name: "Fabbit",
    fontFamily: "'Open Sans', sans-serif",
    icon: (
      <>
        <path d="M12 2l8.5 5v10L12 22l-8.5-5V7z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
  },
  /* 6. Emerald ESG — Lato */
  "theme-primary-6": {
    name: "Fabbit",
    fontFamily: "'Lato', sans-serif",
    icon: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </>
    ),
  },
  /* 7. Safety Industrial — Ubuntu */
  "theme-primary-7": {
    name: "Fabbit",
    fontFamily: "'Ubuntu', sans-serif",
    icon: (
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    ),
  },
  /* 8. Intelligence Violet — JetBrains Mono */
  "theme-primary-8": {
    name: "Fabbit",
    fontFamily: "'JetBrains Mono', monospace",
    icon: (
      <>
        <circle cx="12" cy="4.5" r="2.5" />
        <circle cx="4.5" cy="18" r="2.5" />
        <circle cx="19.5" cy="18" r="2.5" />
        <path d="M10.5 6.5L6.5 16M13.5 6.5L17.5 16M7 18h10" />
      </>
    ),
  },
  /* 9. Graphite Precision — Libre Franklin */
  "theme-primary-9": {
    name: "Fabbit",
    fontFamily: "'Libre Franklin', sans-serif",
    icon: (
      <>
        <path d="M6 3h12l4 6-10 13L2 9z" />
        <path d="M2 9h20" />
        <path d="M12 22L8 9l4-6 4 6z" />
      </>
    ),
  },
  /* 10. Bronze Premium — Noto Sans */
  "theme-primary-10": {
    name: "Fabbit",
    fontFamily: "'Noto Sans', sans-serif",
    icon: (
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
    ),
  },
  /* 11. Fabbit Core — Inter */
  "theme-primary-11": {
    name: "Fabbit",
    fontFamily: "'Inter', sans-serif",
    icon: (
      <>
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </>
    ),
  },
};

const defaultThemeKey = "theme-primary-1";

function detectTheme(): string {
  if (typeof document === "undefined") return defaultThemeKey;
  const cl = document.documentElement.classList;
  for (const key of Object.keys(brandThemes)) {
    if (cl.contains(key)) return key;
  }
  return defaultThemeKey;
}

function getThemeDef(theme?: string): BrandThemeDef {
  const key = theme ?? detectTheme();
  return brandThemes[key] ?? brandThemes[defaultThemeKey];
}

/* ------------------------------------------------------------------ */
/*  BrandMark — 아이콘만                                                */
/* ------------------------------------------------------------------ */

interface BrandMarkProps extends ComponentProps<"div"> {
  size?: Size;
  /** 테마 키 — 생략 시 현재 활성 테마 자동 감지 */
  theme?: string;
}

function BrandMark({
  size = "md",
  theme,
  className,
  ...props
}: BrandMarkProps) {
  const s = sizeMap[size];
  const t = getThemeDef(theme);

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
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {t.icon}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  BrandLogo — 아이콘 + 워드마크                                       */
/* ------------------------------------------------------------------ */

interface BrandLogoProps extends ComponentProps<"div"> {
  size?: Size;
  /** 테마 키 — 생략 시 현재 활성 테마 자동 감지 */
  theme?: string;
  /** 텍스트 색상 — 기본값은 foreground */
  textClassName?: string;
}

function BrandLogo({
  size = "md",
  theme,
  className,
  textClassName,
  ...props
}: BrandLogoProps) {
  const t = getThemeDef(theme);

  return (
    <div className={cn("flex items-center gap-2.5", className)} {...props}>
      <BrandMark size={size} theme={theme} />
      <span
        className={cn(
          "font-bold leading-none",
          textSizeMap[size],
          textClassName ?? "text-foreground",
        )}
        style={{ fontFamily: t.fontFamily }}
      >
        {t.name}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Exports                                                            */
/* ------------------------------------------------------------------ */

export { BrandMark, BrandLogo, brandThemes };
export type { BrandMarkProps, BrandLogoProps, Size as BrandSize };
