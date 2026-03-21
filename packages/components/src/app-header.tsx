import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import {
  Bell,
  Check,
  ChevronDown,
  CircleHelp,
  LogOut,
  PanelLeft,
  Plus,
  Search,
} from "lucide-react";
import {
  BrandLogo,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  UserAvatar,
  cn,
} from "@fabbit/ui";

export interface AppHeaderUser {
  email: string;
  name: string;
  profileImageUrl?: string | null;
}

export interface AppHeaderMenuItem {
  icon: ComponentType<{ className?: string }>;
  id: string;
  label: string;
  onClick: () => void;
}

export interface AppHeaderOrganizationItem {
  id: string;
  name: string;
  profileImageUrl?: string | null;
  roleLabel?: string;
  slug: string;
}

export interface AppHeaderOrganizationMenu {
  current: AppHeaderOrganizationItem | null;
  items: AppHeaderOrganizationItem[];
  onSelect: (slug: string) => void;
  switchingSlug?: string | null;
}

export interface AppHeaderPrimaryAction {
  icon?: ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}

export interface AppHeaderSearchConfig {
  dialogDescription?: string;
  dialogPlaceholder?: string;
  triggerLabel?: string;
}

export interface AppHeaderProps {
  actions?: ReactNode;
  brand?: ReactNode;
  className?: string;
  menuItems?: AppHeaderMenuItem[];
  onHelpClick?: () => void;
  onLogout?: () => void;
  onNotificationClick?: () => void;
  onSearchClick?: () => void;
  onToggleSidebar?: () => void;
  organizationMenu?: AppHeaderOrganizationMenu | null;
  primaryAction?: AppHeaderPrimaryAction | null;
  search?: AppHeaderSearchConfig;
  searchPlaceholder?: string;
  user?: AppHeaderUser | null;
}

function DefaultBrand() {
  return <BrandLogo size="sm" />;
}

export function AppHeader({
  actions,
  brand,
  className,
  menuItems = [],
  onHelpClick,
  onLogout,
  onNotificationClick,
  onSearchClick,
  onToggleSidebar,
  organizationMenu,
  primaryAction,
  search,
  searchPlaceholder,
  user,
}: AppHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.key === "/" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        const target = event.target as HTMLElement;
        const tagName = target?.tagName;

        if (
          tagName === "INPUT" ||
          tagName === "TEXTAREA" ||
          target?.isContentEditable
        ) {
          return;
        }

        event.preventDefault();
        setSearchOpen(true);
        onSearchClick?.();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onSearchClick]);

  const resolvedSearch = search ?? (searchPlaceholder ? { triggerLabel: searchPlaceholder } : undefined);
  const resolvedPrimaryAction = primaryAction;

  return (
    <header
      className={cn(
        "topbar-shell topbar-divider grid h-12 shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-6 border-b px-3 lg:px-6",
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-2">
        {onToggleSidebar ? (
          <Button
            variant="ghost"
            size="icon"
            className="topbar-icon-btn size-8"
            aria-label="사이드 내비게이션 토글"
            style={{ color: "var(--nav-topbar-icon)" }}
            onClick={onToggleSidebar}
          >
            <PanelLeft className="size-5" />
          </Button>
        ) : null}

        {brand ?? <DefaultBrand />}
      </div>

      <div className="flex w-full min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setSearchOpen(true);
            onSearchClick?.();
          }}
          className="topbar-icon-btn flex h-9 min-w-[240px] flex-1 items-center gap-2 rounded-md border border-transparent px-3 text-sm"
          style={{ color: "var(--nav-topbar-icon)" }}
        >
          <Search className="size-4 shrink-0" />
          <span>{resolvedSearch?.triggerLabel ?? "검색"}</span>
          <kbd className="ml-auto hidden rounded border px-1.5 py-0.5 text-xs font-medium opacity-60 sm:inline-block">
            /
          </kbd>
        </button>

        {resolvedPrimaryAction ? (
          <Button
            variant="outline"
            className="h-9 shrink-0 gap-1.5"
            onClick={resolvedPrimaryAction.onClick}
          >
            {resolvedPrimaryAction.icon ? (
              <resolvedPrimaryAction.icon className="size-4" />
            ) : (
              <Plus className="size-4" />
            )}
            {resolvedPrimaryAction.label}
          </Button>
        ) : null}
      </div>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent
          showCloseButton={false}
          className="top-[20%] translate-y-0 sm:max-w-lg"
        >
          <DialogTitle className="sr-only">검색</DialogTitle>
          <div className="flex items-center gap-2">
            <Search className="size-5 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              type="text"
              aria-label="검색"
              placeholder={resolvedSearch?.dialogPlaceholder ?? "검색어를 입력하세요..."}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {resolvedSearch?.dialogDescription ?? "품목, 도면, BOM 등을 검색할 수 있습니다."}
          </p>
        </DialogContent>
      </Dialog>

      <div className="flex shrink-0 items-center gap-0.5">
        {organizationMenu?.current ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 gap-2 rounded-lg px-2"
                style={{ color: "var(--nav-topbar-icon-hover)" }}
              >
                <UserAvatar
                  name={organizationMenu.current.name}
                  imageUrl={organizationMenu.current.profileImageUrl}
                  className="size-7"
                  variant="rounded"
                />
                <div className="text-left">
                  <p className="max-w-[120px] truncate text-sm font-medium leading-none text-foreground">
                    {organizationMenu.current.name}
                  </p>
                </div>
                <ChevronDown className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                조직 전환
              </DropdownMenuLabel>
              {organizationMenu.items.map((item) => {
                const isCurrent = organizationMenu.current?.id === item.id;
                const isSwitching = organizationMenu.switchingSlug === item.slug;

                return (
                  <DropdownMenuItem
                    key={item.id}
                    className={cn("flex items-center gap-3 py-2", isCurrent && "opacity-60")}
                    disabled={isCurrent || Boolean(organizationMenu.switchingSlug)}
                    onClick={() => organizationMenu.onSelect(item.slug)}
                  >
                    <UserAvatar
                      name={item.name}
                      imageUrl={item.profileImageUrl}
                      className="size-9"
                      variant="rounded"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isSwitching ? "전환 중..." : item.roleLabel ?? "사용자"}
                      </p>
                    </div>
                    {isCurrent ? (
                      <Check className="size-4" style={{ color: "var(--brand-500)" }} />
                    ) : null}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}

        <Button
          variant="ghost"
          size="icon"
          className="topbar-icon-btn size-8"
          aria-label="도움말"
          style={{ color: "var(--nav-topbar-icon)" }}
          onClick={onHelpClick}
        >
          <CircleHelp className="size-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="topbar-icon-btn size-8"
          aria-label="알림"
          style={{ color: "var(--nav-topbar-icon)" }}
          onClick={onNotificationClick}
        >
          <Bell className="size-5" />
        </Button>

        {actions}

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="topbar-icon-btn size-8"
                aria-label="프로필 메뉴"
                style={{ color: "var(--nav-topbar-icon)" }}
              >
                <UserAvatar
                  name={user.name}
                  imageUrl={user.profileImageUrl}
                  className="size-7"
                  variant="circle"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-2">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              {menuItems.length > 0 ? (
                <>
                  <DropdownMenuSeparator />
                  {menuItems.map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      className="gap-2"
                      onClick={item.onClick}
                    >
                      <item.icon className="size-4" />
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </>
              ) : null}
              {onLogout ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onLogout}
                    className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <LogOut className="size-4" />
                    로그아웃
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </header>
  );
}
