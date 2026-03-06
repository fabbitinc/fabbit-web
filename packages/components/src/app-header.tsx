import type { ComponentType, ReactNode } from "react";
import { PanelLeft, Search, Bell } from "lucide-react";
import {
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@fabbit/ui";

export interface AppHeaderUser {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface AppHeaderMenuItem {
  id: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  onClick: () => void;
}

export interface AppHeaderProps {
  /** 브랜드 로고 영역. ReactNode로 자유롭게 구성 */
  brand?: ReactNode;
  /** 현재 로그인 사용자 */
  user?: AppHeaderUser;
  /** 사이드바 토글 콜백. 생략 시 토글 버튼 미표시 */
  onToggleSidebar?: () => void;
  /** 검색 클릭 콜백. 생략 시 검색 버튼 미표시 */
  onSearchClick?: () => void;
  /** 검색 placeholder */
  searchPlaceholder?: string;
  /** 알림 클릭 콜백. 생략 시 알림 버튼 미표시 */
  onNotificationClick?: () => void;
  /** 읽지 않은 알림 수 */
  notificationCount?: number;
  /** 프로필 드롭다운 메뉴 항목 */
  menuItems?: AppHeaderMenuItem[];
  /** 로그아웃 콜백. 생략 시 로그아웃 항목 미표시 */
  onLogout?: () => void;
  /** 우측 추가 액션 영역 */
  actions?: ReactNode;
  className?: string;
}

function getInitials(name: string) {
  return name.charAt(0);
}

export function AppHeader({
  brand,
  user,
  onToggleSidebar,
  onSearchClick,
  searchPlaceholder = "검색",
  onNotificationClick,
  notificationCount = 0,
  menuItems = [],
  onLogout,
  actions,
  className,
}: AppHeaderProps) {
  return (
    <header
      className={`flex h-12 shrink-0 items-center gap-4 border-b bg-background px-3 lg:px-6 ${className ?? ""}`}
    >
      {/* 좌측: 토글 + 브랜드 */}
      <div className="flex shrink-0 items-center gap-2">
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="사이드바 토글"
            onClick={onToggleSidebar}
          >
            <PanelLeft className="size-5" />
          </Button>
        )}
        {brand}
      </div>

      {/* 중앙: 검색 */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {onSearchClick && (
          <button
            type="button"
            onClick={onSearchClick}
            className="flex h-9 min-w-[200px] flex-1 items-center gap-2 rounded-md border border-input bg-transparent px-3 text-sm text-muted-foreground transition-colors hover:bg-accent"
          >
            <Search className="size-4 shrink-0" />
            <span>{searchPlaceholder}</span>
            <kbd className="ml-auto hidden rounded border px-1.5 py-0.5 text-xs font-medium opacity-60 sm:inline-block">
              /
            </kbd>
          </button>
        )}
        {actions}
      </div>

      {/* 우측: 알림 + 프로필 */}
      <div className="flex shrink-0 items-center gap-1">
        {onNotificationClick && (
          <Button
            variant="ghost"
            size="icon"
            className="relative size-8"
            aria-label="알림"
            onClick={onNotificationClick}
          >
            <Bell className="size-5" />
            {notificationCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </Button>
        )}

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label="프로필 메뉴"
              >
                <Avatar className="size-7">
                  {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-2">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              {menuItems.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    메뉴
                  </DropdownMenuLabel>
                  {menuItems.map((item) => (
                    <DropdownMenuItem key={item.id} className="gap-2" onClick={item.onClick}>
                      {item.icon && <item.icon className="size-4" />}
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              {onLogout && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onLogout}
                    className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    로그아웃
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
