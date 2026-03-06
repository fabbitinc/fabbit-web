import { NavLink, Outlet } from "react-router-dom";
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
        <aside className="border-r bg-background">
          <div className="flex h-full flex-col p-3">
            <div className="mb-4 flex items-center gap-3 px-3 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                F
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Fabbit</p>
                <p className="text-base font-semibold text-foreground">Workspace</p>
              </div>
            </div>

            <nav className="space-y-2">
              {navigationItems.map(({ href, label, icon: Icon }) => (
                <NavLink
                  key={href}
                  className={({ isActive }) =>
                    cn(
                      "relative flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )
                  }
                  to={href}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
      <PartsUploadDialog />
    </>
  );
}
