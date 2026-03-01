import { useState, useEffect } from "react";
import {
  Search,
  Bell,
  ChevronDown,
  Check,
  LogOut,
  Building2,
  CircleHelp,
  User,
  PanelLeft,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/authStore";
import { switchOrg } from "@/api";
import { setAuthCookies } from "@/lib/auth-cookies";
import { cn } from "@/lib/utils";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function InitialsAvatar({ name, imageUrl, className, variant = "rounded" }: {
  name: string;
  imageUrl?: string | null;
  className?: string;
  variant?: "rounded" | "circle";
}) {
  return (
    <Avatar className={cn(variant === "rounded" ? "rounded-md" : "rounded-full", className)}>
      {imageUrl && <AvatarImage src={imageUrl} alt={name} />}
      <AvatarFallback
        className={cn("text-xs font-medium", variant === "rounded" ? "rounded-md" : "rounded-full")}
        style={{ backgroundColor: "var(--nav-topbar-avatar-bg)", color: "var(--nav-topbar-avatar-text)" }}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

function getRoleLabel(role: string): string {
  switch (role) {
    case "owner": return "소유자";
    case "admin": return "관리자";
    default: return "멤버";
  }
}

interface HeaderProps {
  onToggleSideNav: () => void;
}

export function Header({ onToggleSideNav }: HeaderProps) {
  const navigate = useNavigate();
  const { user, memberships, currentMembership, logout } = useAuthStore();
  const currentOrg = currentMembership?.organization;
  const [searchOpen, setSearchOpen] = useState(false);
  const [switchingSlug, setSwitchingSlug] = useState<string | null>(null);

  const APP_DOMAIN = import.meta.env.VITE_APP_DOMAIN;

  const handleSwitchOrg = async (slug: string) => {
    if (slug === currentOrg?.slug || switchingSlug) return;
    setSwitchingSlug(slug);
    try {
      const response = await switchOrg({ slug });
      setAuthCookies(response.tokens.access_token, response.tokens.refresh_token);
      const protocol = window.location.protocol;
      window.location.href = `${protocol}//${slug}.${APP_DOMAIN}/`;
    } catch {
      setSwitchingSlug(null);
    }
  };

  // "/" 키보드 단축키로 검색 Dialog 열기
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) return;
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="topbar-shell topbar-divider grid h-12 shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-6 border-b px-3 lg:px-6">
      {/* 좌측: 토글 + 브랜드 */}
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="topbar-icon-btn size-8"
          aria-label="사이드 내비게이션 토글"
          onClick={onToggleSideNav}
        >
          <PanelLeft className="size-5" />
        </Button>

        <div className="flex items-center gap-2">
          <div
            className="flex size-7 items-center justify-center rounded-md"
            style={{ backgroundColor: "var(--brand-500)", color: "var(--nav-topbar-avatar-text)" }}
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-sm font-semibold leading-none text-foreground">Fabbit</span>
        </div>
      </div>

      {/* 중앙: 검색 트리거 + 생성 버튼 */}
      <div className="flex w-full min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="topbar-icon-btn flex h-9 min-w-[240px] flex-1 items-center gap-2 rounded-md border border-transparent px-3 text-sm"
        >
          <Search className="size-4 shrink-0" />
          <span>검색</span>
          <kbd className="ml-auto hidden rounded border px-1.5 py-0.5 text-xs font-medium opacity-60 sm:inline-block">/</kbd>
        </button>

        <Button variant="outline" className="h-9 shrink-0 gap-1.5">
          <Plus className="size-4" />
          생성
        </Button>
      </div>

      {/* 검색 Dialog */}
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
              placeholder="검색어를 입력하세요..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            품목, 도면, BOM 등을 검색할 수 있습니다.
          </p>
        </DialogContent>
      </Dialog>

      {/* 우측: 조직 전환 + 도움말 + 알림 + 프로필 아바타 */}
      <div className="flex shrink-0 items-center gap-0.5">
        {currentOrg && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 gap-2 rounded-lg px-2"
                style={{ color: "var(--nav-topbar-icon-hover)" }}
              >
                <InitialsAvatar name={currentOrg.name} imageUrl={currentOrg.profileImageUrl} className="size-7" variant="rounded" />
                <div className="text-left">
                  <p className="max-w-[120px] truncate text-sm font-medium leading-none text-foreground">
                    {currentOrg.name}
                  </p>
                </div>
                <ChevronDown className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                조직 전환
              </DropdownMenuLabel>
              {memberships.map((m) => {
                const isCurrent = currentOrg.id === m.organization.id;
                const isSwitching = switchingSlug === m.organization.slug;
                return (
                  <DropdownMenuItem
                    key={m.orgId}
                    className={cn("flex items-center gap-3 py-2", isCurrent && "opacity-60")}
                    disabled={isCurrent || !!switchingSlug}
                    onClick={() => handleSwitchOrg(m.organization.slug)}
                  >
                    <InitialsAvatar name={m.organization.name} imageUrl={m.organization.profileImageUrl} className="size-9" variant="rounded" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {m.organization.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isSwitching ? "전환 중..." : getRoleLabel(m.role)}
                      </p>
                    </div>
                    {isCurrent && (
                      <Check className="size-4" style={{ color: "var(--brand-500)" }} />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button variant="ghost" size="icon" className="topbar-icon-btn size-8" aria-label="도움말">
          <CircleHelp className="size-5" />
        </Button>

        <Button variant="ghost" size="icon" className="topbar-icon-btn size-8" aria-label="알림">
          <Bell className="size-5" />
        </Button>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="topbar-icon-btn size-8"
                aria-label="프로필 메뉴"
              >
                <InitialsAvatar name={user.name} imageUrl={user.profileImageUrl} className="size-7" variant="circle" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-2">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2" onClick={() => navigate("/user/settings")}>
                <User className="size-4" />
                개인 설정
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onClick={() => navigate("/organization/settings")}>
                <Building2 className="size-4" />
                조직 설정
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <LogOut className="size-4" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
