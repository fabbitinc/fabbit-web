import type { ComponentType, ReactNode } from "react";

export interface SettingsNavItem {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export interface SettingsShellProps {
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
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex gap-0 rounded-lg border border-border bg-card">
        <aside className="w-56 border-r border-border bg-muted/30 p-4">
          <nav className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                  activeTab === id
                    ? "bg-background font-medium text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                }`}
                type="button"
                onClick={() => onTabChange(id)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 flex-1 overflow-auto p-6">{children}</section>
      </div>
    </div>
  );
}
