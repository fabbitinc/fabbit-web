import type { Meta, StoryObj } from "@storybook/react-vite";

import { BrandMark, BrandLogo, brandThemes } from "@fabbit/ui";

const themeKeys = Object.keys(brandThemes);

const meta = {
  title: "UI/Brand",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const AllMarks: Story = {
  name: "Marks (10 themes)",
  render: () => (
    <div className="grid grid-cols-5 gap-4">
      {themeKeys.map((key) => (
        <div key={key} className="flex flex-col items-center gap-2">
          <BrandMark size="lg" theme={key} />
          <span className="text-[10px] text-muted-foreground">
            {brandThemes[key].name}
          </span>
        </div>
      ))}
    </div>
  ),
};

const fontLabels: Record<string, string> = {
  "theme-primary-1": "Inter",
  "theme-primary-2": "Montserrat",
  "theme-primary-3": "Poppins",
  "theme-primary-4": "Roboto",
  "theme-primary-5": "Open Sans",
  "theme-primary-6": "Lato",
  "theme-primary-7": "Ubuntu",
  "theme-primary-8": "JetBrains Mono",
  "theme-primary-9": "Libre Franklin",
  "theme-primary-10": "Noto Sans",
};

export const AllLogos: Story = {
  name: "Logos (10 fonts)",
  render: () => (
    <div className="flex flex-col gap-4">
      {themeKeys.map((key) => (
        <div key={key} className="flex items-center gap-4">
          <BrandLogo size="md" theme={key} />
          <span className="text-xs text-muted-foreground">
            {fontLabels[key]}
          </span>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  name: "Size variants",
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">Mark</p>
        <div className="flex items-end gap-4">
          <BrandMark size="xs" />
          <BrandMark size="sm" />
          <BrandMark size="md" />
          <BrandMark size="lg" />
          <BrandMark size="xl" />
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">Logo</p>
        <div className="flex flex-col gap-3">
          <BrandLogo size="sm" />
          <BrandLogo size="md" />
          <BrandLogo size="lg" />
          <BrandLogo size="xl" />
        </div>
      </div>
    </div>
  ),
};

export const OnDark: Story = {
  render: () => (
    <div className="flex flex-col gap-4 rounded-xl bg-foreground p-8">
      {themeKeys.slice(0, 5).map((key) => (
        <BrandLogo key={key} size="md" theme={key} textClassName="text-background" />
      ))}
    </div>
  ),
};

export const Showcase: Story = {
  render: () => (
    <div className="flex flex-col gap-10">
      {/* All 10 marks */}
      <div>
        <p className="mb-4 text-sm font-medium text-muted-foreground">
          10 Brand Marks
        </p>
        <div className="grid grid-cols-5 gap-6">
          {themeKeys.map((key) => (
            <div key={key} className="flex flex-col items-center gap-2">
              <BrandMark size="xl" theme={key} />
              <span className="text-xs font-medium">{fontLabels[key]}</span>
              <span className="text-[10px] text-muted-foreground">
                {key.replace("theme-primary-", "#")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Active theme (auto-detect) */}
      <div>
        <p className="mb-4 text-sm font-medium text-muted-foreground">
          Active Theme (auto-detect)
        </p>
        <div className="flex flex-col gap-3">
          <BrandLogo size="lg" />
          <BrandLogo size="md" />
          <BrandLogo size="sm" />
        </div>
      </div>

      {/* On dark */}
      <div>
        <p className="mb-4 text-sm font-medium text-muted-foreground">
          On Dark
        </p>
        <div className="rounded-xl bg-foreground p-6">
          <BrandLogo size="lg" textClassName="text-background" />
        </div>
      </div>
    </div>
  ),
};
