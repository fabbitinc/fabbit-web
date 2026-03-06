import type { Meta, StoryObj } from "@storybook/react-vite";
import { createElement, useEffect, useRef, useState } from "react";
import { Badge } from "@fabbit/ui";

/* ─────────────────────────── Types ─────────────────────────── */

interface Token {
  name: string;
  variable: string;
  description?: string;
}

interface TokenGroup {
  title: string;
  description: string;
  tokens: Token[];
}

interface Gradient {
  name: string;
  description: string;
  from: string;
  to: string;
  direction?: string;
}

/* ─────────────────────────── Data ─────────────────────────── */

const semanticTokens: TokenGroup[] = [
  {
    title: "Brand",
    description: "브랜드 식별 및 강조",
    tokens: [
      { name: "brand-50", variable: "--brand-50", description: "배경 틴트" },
      { name: "brand-500", variable: "--brand-500", description: "기본" },
      { name: "brand-600", variable: "--brand-600", description: "호버" },
      { name: "accent-500", variable: "--accent-500", description: "보조 강조" },
    ],
  },
  {
    title: "Surface",
    description: "배경, 표면, 텍스트, 경계선",
    tokens: [
      { name: "theme-background", variable: "--theme-background", description: "페이지 배경" },
      { name: "theme-surface", variable: "--theme-surface", description: "카드 배경" },
      { name: "theme-text-primary", variable: "--theme-text-primary", description: "본문" },
      { name: "theme-text-secondary", variable: "--theme-text-secondary", description: "보조 텍스트" },
      { name: "theme-border", variable: "--theme-border", description: "경계선" },
    ],
  },
  {
    title: "Navigation",
    description: "Topbar, Sidebar, 선택 상태",
    tokens: [
      { name: "nav-topbar-bg", variable: "--nav-topbar-bg", description: "상단바" },
      { name: "nav-sidebar-bg", variable: "--nav-sidebar-bg", description: "사이드바" },
      { name: "nav-sidebar-active-bg", variable: "--nav-sidebar-active-bg", description: "활성 배경" },
      { name: "nav-sidebar-active-text", variable: "--nav-sidebar-active-text", description: "활성 텍스트" },
      { name: "nav-resizer-handle-active", variable: "--nav-resizer-handle-active", description: "리사이저" },
    ],
  },
];

const gradients: Gradient[] = [
  { name: "AI Action", description: "AI 기능 강조 그라디언트", from: "--ai-from", to: "--ai-to", direction: "135deg" },
  { name: "Logo", description: "로고 그라디언트", from: "--logo-from", to: "--logo-to", direction: "135deg" },
];

const statusTones = ["success", "warning", "danger", "info"] as const;

const foundationTokens: TokenGroup[] = [
  {
    title: "Core UI",
    description: "shadcn/ui 컴포넌트 기초 토큰",
    tokens: [
      { name: "background", variable: "--background", description: "앱 배경" },
      { name: "foreground", variable: "--foreground", description: "앱 텍스트" },
      { name: "card", variable: "--card", description: "카드" },
      { name: "primary", variable: "--primary", description: "주요 액션" },
      { name: "secondary", variable: "--secondary", description: "보조" },
      { name: "muted", variable: "--muted", description: "비활성" },
      { name: "accent", variable: "--accent", description: "강조" },
      { name: "border", variable: "--border", description: "경계선" },
    ],
  },
  {
    title: "Chart",
    description: "데이터 시각화 순차 팔레트",
    tokens: [
      { name: "chart-1", variable: "--chart-1" },
      { name: "chart-2", variable: "--chart-2" },
      { name: "chart-3", variable: "--chart-3" },
      { name: "chart-4", variable: "--chart-4" },
      { name: "chart-5", variable: "--chart-5" },
    ],
  },
  {
    title: "Sidebar",
    description: "Sidebar 프리미티브 기초 토큰",
    tokens: [
      { name: "sidebar", variable: "--sidebar", description: "배경" },
      { name: "sidebar-foreground", variable: "--sidebar-foreground", description: "텍스트" },
      { name: "sidebar-primary", variable: "--sidebar-primary", description: "강조" },
      { name: "sidebar-accent", variable: "--sidebar-accent", description: "액센트" },
      { name: "sidebar-border", variable: "--sidebar-border", description: "경계" },
    ],
  },
];

/* ─────────────────────────── Helpers ─────────────────────────── */

const mono = '"SF Mono", Monaco, Consolas, monospace';

function ResolvedValue({ variable, el }: { variable: string; el: React.RefObject<HTMLElement | null> }) {
  const [val, setVal] = useState("");
  useEffect(() => {
    if (!el.current) return;
    setVal(getComputedStyle(el.current).getPropertyValue(variable).trim());
  });
  if (!val) return null;
  return (
    <span className="text-[10px] opacity-60" style={{ fontFamily: mono }}>{val}</span>
  );
}

function copyText(text: string) {
  navigator.clipboard.writeText(text);
}

/* ─────────────────────────── Swatch Card ─────────────────────────── */

function SwatchCard({ token }: { token: Token }) {
  const ref = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const varText = `var(${token.variable})`;

  return (
    <button
      type="button"
      className="group flex flex-col overflow-hidden rounded-lg border text-left transition-shadow hover:shadow-md"
      style={{ borderColor: "var(--border)" }}
      onClick={() => {
        copyText(varText);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      title={`Click to copy ${varText}`}
    >
      {/* Big swatch */}
      <div
        ref={ref}
        className="h-20 w-full transition-colors"
        style={{ backgroundColor: `var(${token.variable})` }}
      />
      {/* Info */}
      <div
        className="flex flex-col gap-0.5 px-3 py-2"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
            {token.name}
          </span>
          {copied && (
            <span className="text-[10px] font-medium" style={{ color: "var(--status-success)" }}>
              Copied
            </span>
          )}
        </div>
        {token.description && (
          <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
            {token.description}
          </span>
        )}
        <ResolvedValue variable={token.variable} el={ref} />
      </div>
    </button>
  );
}

/* ─────────────────────────── Token Group ─────────────────────────── */

function TokenGroupSection({ group }: { group: TokenGroup }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <h3 className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>
          {group.title}
        </h3>
        <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
          {group.description}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {group.tokens.map((t) => (
          <SwatchCard key={t.variable} token={t} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── Gradient Section ─────────────────────────── */

function GradientSection() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <h3 className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>
          Gradient
        </h3>
        <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
          AI 기능 및 로고에 사용되는 그라디언트
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {gradients.map((g) => (
          <GradientCard key={g.name} gradient={g} />
        ))}
      </div>
    </div>
  );
}

function GradientCard({ gradient }: { gradient: Gradient }) {
  const ref = useRef<HTMLDivElement>(null);
  const [fromVal, setFromVal] = useState("");
  const [toVal, setToVal] = useState("");
  const dir = gradient.direction ?? "90deg";

  useEffect(() => {
    if (!ref.current) return;
    const s = getComputedStyle(ref.current);
    setFromVal(s.getPropertyValue(gradient.from).trim());
    setToVal(s.getPropertyValue(gradient.to).trim());
  });

  return (
    <div
      className="flex flex-col overflow-hidden rounded-lg border"
      style={{ borderColor: "var(--border)" }}
    >
      {/* Gradient bar */}
      <div
        ref={ref}
        className="h-24 w-full"
        style={{
          background: `linear-gradient(${dir}, var(${gradient.from}), var(${gradient.to}))`,
        }}
      />
      {/* Info */}
      <div
        className="flex items-center justify-between gap-4 px-4 py-3"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
            {gradient.name}
          </span>
          <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
            {gradient.description}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {/* From swatch */}
          <div className="flex items-center gap-1.5">
            <div className="size-5 rounded border" style={{ backgroundColor: `var(${gradient.from})`, borderColor: "var(--border)" }} />
            <div className="flex flex-col">
              <span className="text-[10px] font-medium" style={{ color: "var(--muted-foreground)" }}>from</span>
              {fromVal && <span className="text-[10px]" style={{ fontFamily: mono, color: "var(--muted-foreground)" }}>{fromVal}</span>}
            </div>
          </div>
          {/* To swatch */}
          <div className="flex items-center gap-1.5">
            <div className="size-5 rounded border" style={{ backgroundColor: `var(${gradient.to})`, borderColor: "var(--border)" }} />
            <div className="flex flex-col">
              <span className="text-[10px] font-medium" style={{ color: "var(--muted-foreground)" }}>to</span>
              {toVal && <span className="text-[10px]" style={{ fontFamily: mono, color: "var(--muted-foreground)" }}>{toVal}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Status Section ─────────────────────────── */

function StatusSection() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <h3 className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>
          Status
        </h3>
        <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
          상태 피드백 — fg / bg / border 세트
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {statusTones.map((tone) => (
          <div
            key={tone}
            className="flex flex-col overflow-hidden rounded-lg border"
            style={{ borderColor: `var(--status-${tone}-border)` }}
          >
            {/* Three-part swatch */}
            <div className="flex h-14">
              <div className="flex-1" style={{ backgroundColor: `var(--status-${tone})` }} title="foreground" />
              <div className="flex-1" style={{ backgroundColor: `var(--status-${tone}-bg)` }} title="background" />
              <div className="flex-1" style={{ backgroundColor: `var(--status-${tone}-border)` }} title="border" />
            </div>
            <div
              className="flex items-center justify-between px-3 py-2"
              style={{ backgroundColor: `var(--status-${tone}-bg)` }}
            >
              <span
                className="text-xs font-semibold capitalize"
                style={{ color: `var(--status-${tone})` }}
              >
                {tone}
              </span>
              <div className="flex gap-1">
                <span className="rounded px-1 py-0.5 text-[9px]" style={{ fontFamily: mono, backgroundColor: `var(--status-${tone}-border)`, color: `var(--status-${tone})` }}>
                  fg
                </span>
                <span className="rounded px-1 py-0.5 text-[9px]" style={{ fontFamily: mono, backgroundColor: `var(--status-${tone}-border)`, color: `var(--status-${tone})` }}>
                  bg
                </span>
                <span className="rounded px-1 py-0.5 text-[9px]" style={{ fontFamily: mono, backgroundColor: `var(--status-${tone}-border)`, color: `var(--status-${tone})` }}>
                  border
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── Section Divider ─────────────────────────── */

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-b pb-2" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-baseline gap-3">
        <h2 className="text-base font-semibold">{title}</h2>
        <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{description}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────── Pages ─────────────────────────── */

function ColorPalette() {
  return (
    <div className="mx-auto flex max-w-[1120px] flex-col gap-10 px-8 py-10" style={{ color: "var(--foreground)" }}>
      {/* Header */}
      <header className="flex flex-col gap-1.5">
        <h1 className="text-xl font-bold tracking-tight">Color Tokens</h1>
        <p className="max-w-xl text-[13px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          툴바에서 <strong>Primary</strong> · <strong>Common</strong> · <strong>Mode</strong>를 전환하면 모든 토큰이 실시간 반영됩니다.
        </p>
      </header>

      {/* Semantic */}
      <section className="flex flex-col gap-8">
        <SectionHeader title="Semantic Tokens" description="제품 의미 기반 — 브랜드, 표면, 내비게이션, 상태" />
        {semanticTokens.map((g) => (
          <TokenGroupSection key={g.title} group={g} />
        ))}
        <GradientSection />
        <StatusSection />
      </section>

      {/* Foundation */}
      <section className="flex flex-col gap-8">
        <SectionHeader title="Foundation Tokens" description="shadcn/ui 유틸리티 및 프리미티브 기초 토큰" />
        {foundationTokens.map((g) => (
          <TokenGroupSection key={g.title} group={g} />
        ))}
      </section>
    </div>
  );
}

/* ─────────────────────── Auto-scan UI stories ─────────────────────── */

const storyModules = import.meta.glob<Record<string, unknown>>("./ui/*.stories.tsx", { eager: true });

interface StoryEntry {
  label: string;
  element: React.ReactNode;
}

interface StoryGroup {
  fileName: string;
  entries: StoryEntry[];
}

function collectShowcases(): StoryGroup[] {
  const groups: StoryGroup[] = [];

  for (const [path, mod] of Object.entries(storyModules)) {
    const meta = mod.default as { component?: React.ComponentType<unknown>; args?: Record<string, unknown> } | undefined;
    if (!meta) continue;

    const fileName = path.replace("./ui/", "").replace(".stories.tsx", "");

    const storyDef = mod.Showcase as {
      render?: (args: Record<string, unknown>) => React.ReactNode;
      args?: Record<string, unknown>;
    } | undefined;

    if (!storyDef) continue;

    const mergedArgs = { ...meta.args, ...storyDef.args };
    let element: React.ReactNode;

    if (storyDef.render) {
      element = storyDef.render(mergedArgs);
    } else if (meta.component) {
      const Comp = meta.component;
      element = createElement(Comp, mergedArgs);
    } else {
      continue;
    }

    groups.push({ fileName, entries: [{ label: "Showcase", element }] });
  }

  return groups;
}

function Preview() {
  const groups = collectShowcases();

  return (
    <div className="mx-auto flex max-w-[1120px] flex-col gap-10 px-8 py-10" style={{ color: "var(--foreground)" }}>
      <header className="flex flex-col gap-1.5">
        <h1 className="text-xl font-bold tracking-tight">Component Preview</h1>
        <p className="max-w-xl text-[13px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          각 컴포넌트의 <code>Showcase</code> 스토리를 자동 수집합니다. 테마 전환 시 색상이 함께 변경되는지 검증하세요.
        </p>
      </header>

      {groups.map((group) => (
        <Card key={group.fileName} label={group.fileName}>
          {group.entries[0].element}
        </Card>
      ))}
    </div>
  );
}

function Card({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border p-5 ${className ?? ""}`}
      style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
    >
      <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      {children}
    </div>
  );
}

/* ─────────────────────────── Stories ─────────────────────────── */

const meta: Meta = {
  title: "Foundations/Colors",
  parameters: { layout: "fullscreen" },
};

export default meta;

export const Palette: StoryObj = {
  name: "Token Palette",
  render: () => <ColorPalette />,
};

export const Components: StoryObj = {
  name: "Component Preview",
  render: () => <Preview />,
};
