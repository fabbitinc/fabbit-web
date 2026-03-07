import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  FolderKanban,
  GitPullRequestArrow,
  LayoutDashboard,
  Package,
  User,
} from "lucide-react";
import { AppHeader, AppShell, AppSidebar } from "@fabbit/components";
import { useAuthStore } from "@/features/auth";
import { useLogoutAction } from "@/features/auth/hooks/use-logout-action";
import { useSwitchOrganizationAction } from "@/features/auth/hooks/use-switch-organization-action";
import { PartsUploadDialog } from "@/features/parts/components/parts-upload-dialog";

const SIDENAV_WIDTH = 240;

const navigationItems = [
  { id: "dashboard", href: "/", label: "대시보드", icon: LayoutDashboard },
  { id: "projects", href: "/projects", label: "프로젝트", icon: FolderKanban },
  { id: "changes", href: "/changes", label: "변경 관리", icon: GitPullRequestArrow },
  { id: "parts", href: "/parts", label: "부품관리", icon: Package },
];

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex size-7 items-center justify-center rounded-md"
        style={{
          backgroundColor: "var(--brand-500)",
          color: "var(--nav-topbar-avatar-text)",
        }}
      >
        <svg
          className="size-4"
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
      <span className="text-sm font-semibold leading-none text-foreground">Fabbit</span>
    </div>
  );
}

function getRoleLabel(role: string) {
  switch (role.toUpperCase()) {
    case "OWNER":
      return "소유자";
    case "ADMIN":
      return "관리자";
    default:
      return "사용자";
  }
}

export function MainAppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const memberships = useAuthStore((state) => state.memberships);
  const currentMembership = useAuthStore((state) => state.currentMembership);
  const switchOrganizationAction = useSwitchOrganizationAction();
  const logoutAction = useLogoutAction();
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
  const [isSideNavCollapsed, setIsSideNavCollapsed] = useState(
    () => localStorage.getItem("fabbit-side-nav-collapsed") === "true",
  );
  const [isSideNavOverlayOpen, setIsSideNavOverlayOpen] = useState(false);

  const closeMobileSideNav = useCallback(() => {
    setIsSideNavOverlayOpen(false);
  }, []);

  const handleToggleSideNav = useCallback(() => {
    if (isDesktop) {
      setIsSideNavCollapsed((previous) => {
        const next = !previous;
        localStorage.setItem("fabbit-side-nav-collapsed", next ? "true" : "false");
        return next;
      });
      return;
    }

    setIsSideNavOverlayOpen((previous) => !previous);
  }, [isDesktop]);

  useEffect(() => {
    function handleResize() {
      const nextIsDesktop = window.innerWidth >= 1024;
      setIsDesktop(nextIsDesktop);

      if (nextIsDesktop) {
        setIsSideNavOverlayOpen(false);
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSwitchOrganization = useCallback(
    async (slug: string) => {
      if (
        !currentMembership ||
        slug === currentMembership.organization.slug ||
        switchOrganizationAction.isPending
      ) {
        return;
      }

      const result = await switchOrganizationAction.mutateAsync(slug);
      window.location.href = result.redirectUrl;
    },
    [currentMembership, switchOrganizationAction],
  );

  const handleLogout = useCallback(async () => {
    const result = await logoutAction.mutateAsync();
    window.location.href = result.destination;
  }, [logoutAction]);

  const sidebarSections = useMemo(
    () => [
      {
        id: "main",
        items: navigationItems.map((item) => ({
          id: item.id,
          label: item.label,
          icon: item.icon,
          active: item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href),
          onClick: () => {
            navigate(item.href);
            closeMobileSideNav();
          },
        })),
      },
    ],
    [closeMobileSideNav, location.pathname, navigate],
  );

  const organizationMenu = currentMembership
    ? {
        current: {
          id: currentMembership.organization.id,
          slug: currentMembership.organization.slug,
          name: currentMembership.organization.name,
          profileImageUrl: currentMembership.organization.profileImageUrl,
          roleLabel: getRoleLabel(currentMembership.role),
        },
        items: memberships.map((membership) => ({
          id: membership.organization.id,
          slug: membership.organization.slug,
          name: membership.organization.name,
          profileImageUrl: membership.organization.profileImageUrl,
          roleLabel: getRoleLabel(membership.role),
        })),
        onSelect: handleSwitchOrganization,
        switchingSlug: switchOrganizationAction.isPending
          ? switchOrganizationAction.variables ?? null
          : null,
      }
    : null;

  const menuItems = useMemo(
    () => [
      {
        id: "user-settings",
        label: "개인 설정",
        icon: User,
        onClick: () => navigate("/user/settings"),
      },
      {
        id: "organization-settings",
        label: "조직 설정",
        icon: Building2,
        onClick: () => navigate("/organization/settings"),
      },
    ],
    [navigate],
  );

  return (
    <>
      <AppShell
        header={
          <AppHeader
            brand={<Brand />}
            user={user
              ? {
                  name: user.name,
                  email: user.email,
                  profileImageUrl: user.profileImageUrl,
                }
              : null}
            onToggleSidebar={handleToggleSideNav}
            organizationMenu={organizationMenu}
            primaryAction={{ label: "생성" }}
            search={{ triggerLabel: "검색" }}
            menuItems={menuItems}
            onLogout={handleLogout}
          />
        }
        sidebar={
          <AppSidebar
            sections={sidebarSections}
            isDesktop={isDesktop}
            collapsed={isDesktop ? isSideNavCollapsed : false}
            mobileOpen={isSideNavOverlayOpen}
            onCloseMobile={closeMobileSideNav}
            width={SIDENAV_WIDTH}
          />
        }
        isDesktop={isDesktop}
        isSidebarCollapsed={isSideNavCollapsed}
        isSidebarOverlayOpen={isSideNavOverlayOpen}
        onCloseSidebarOverlay={closeMobileSideNav}
        sidebarWidth={SIDENAV_WIDTH}
      >
        <Outlet />
      </AppShell>
      <PartsUploadDialog />
    </>
  );
}
