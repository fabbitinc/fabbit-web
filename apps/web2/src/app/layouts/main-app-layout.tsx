import { Link, Outlet } from "react-router-dom";
import { Building2, FolderKanban, GitPullRequestArrow, Home, Settings2, UserCircle2 } from "lucide-react";
import { PartsUploadDialog } from "@/features/parts/components/parts-upload-dialog";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/", label: "대시보드", icon: Home },
  { href: "/parts", label: "부품", icon: FolderKanban },
  { href: "/projects", label: "프로젝트", icon: Building2 },
  { href: "/changes", label: "변경관리", icon: GitPullRequestArrow },
  { href: "/organization/settings", label: "조직 설정", icon: Settings2 },
  { href: "/user/settings", label: "내 설정", icon: UserCircle2 },
];

export function MainAppLayout() {
  return (
    <>
      <div className="app-shell grid min-h-screen lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="border-r border-border/70 bg-card/90 p-4 backdrop-blur">
          <div className="app-panel rounded-3xl p-4">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                F
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Fabbit</p>
                <p className="text-lg font-semibold text-foreground">Web2</p>
              </div>
            </div>

            <nav className="space-y-2">
              {navigationItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors",
                    "hover:bg-muted hover:text-foreground",
                  )}
                  to={href}
                >
                  <Icon className="size-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
      <PartsUploadDialog />
    </>
  );
}
