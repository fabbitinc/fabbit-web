import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SettingsNavItem {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

interface SettingsShellProps {
  title: string;
  description: string;
  tabs: SettingsNavItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
}

export function SettingsShell({
  title,
  description,
  tabs,
  activeTab,
  onTabChange,
  children,
}: SettingsShellProps) {
  return (
    <div className="space-y-6">
      <section className="app-panel rounded-[32px] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Settings</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>
      </section>

      <section className="app-panel overflow-hidden rounded-[32px]">
        <div className="grid gap-0 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="border-b border-border/70 bg-muted/20 lg:border-r lg:border-b-0">
            <nav className="flex gap-2 overflow-x-auto p-4 lg:block lg:space-y-2">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  className={cn(
                    "flex min-w-fit items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors lg:w-full",
                    activeTab === id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-background hover:text-foreground",
                  )}
                  type="button"
                  onClick={() => onTabChange(id)}
                >
                  <Icon className="size-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 p-6">{children}</div>
        </div>
      </section>
    </div>
  );
}
