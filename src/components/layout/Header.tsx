import {
  Search,
  Bell,
  ChevronDown,
  Check,
  LogOut,
  Settings,
  Building2,
  CircleHelp,
  User,
  PanelLeft,
  Plus,
  LayoutGrid,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function OrganizationAvatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const sizeClasses = size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm";

  return (
    <div className={cn("flex items-center justify-center rounded-md bg-slate-700 font-medium text-white", sizeClasses)}>
      {getInitials(name)}
    </div>
  );
}

function UserAvatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const sizeClasses = size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm";

  return (
    <div className={cn("flex items-center justify-center rounded-md bg-slate-700 font-medium text-white", sizeClasses)}>
      {getInitials(name)}
    </div>
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
  const iconButtonClass = "h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-900";

  return (
    <header className="grid h-12 shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-200 bg-white px-3 lg:px-4">
      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          className={iconButtonClass}
          aria-label="사이드 내비게이션 토글"
          onClick={onToggleSideNav}
        >
          <PanelLeft className="h-[17px] w-[17px]" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={iconButtonClass}
          aria-label="앱 메뉴"
        >
          <LayoutGrid className="h-[17px] w-[17px]" />
        </Button>

        {currentOrg && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-9 gap-2 rounded-lg px-2 text-slate-700 hover:bg-slate-100"
                >
                  <OrganizationAvatar name={currentOrg.name} />
                  <div className="text-left">
                    <p className="max-w-[120px] truncate text-sm font-medium leading-none text-slate-900">
                      {currentOrg.name}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel className="text-xs font-normal text-slate-500">
                조직 전환
              </DropdownMenuLabel>
              {memberships.map((m) => (
                <DropdownMenuItem
                  key={m.orgId}
                  className="flex items-center gap-3 py-2"
                >
                  <OrganizationAvatar name={m.organization.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {m.organization.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {getRoleLabel(m.role)}
                    </p>
                  </div>
                  {currentOrg.id === m.organization.id && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-slate-600" onClick={() => navigate("/organization/settings")}>
                <Building2 className="h-4 w-4" />
                조직 관리
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="flex w-full min-w-0 items-center gap-2">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Search..."
            className="h-9 w-full border-slate-200 bg-slate-50 pl-9 text-sm placeholder:text-slate-400 focus:bg-white"
          />
        </div>

        <Button variant="outline" className="h-9 shrink-0 gap-1.5 border-slate-200 bg-white px-3 text-slate-700 hover:bg-slate-50">
          <Plus className="h-4 w-4" />
          생성
        </Button>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <Button variant="ghost" size="icon" className={iconButtonClass} aria-label="도움말">
          <CircleHelp className="h-[18px] w-[18px]" />
        </Button>

        <Button variant="ghost" size="icon" className={iconButtonClass} aria-label="알림">
          <Bell className="h-[18px] w-[18px]" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className={iconButtonClass} aria-label="설정">
              <Settings className="h-[18px] w-[18px]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs font-normal text-slate-500">설정</DropdownMenuLabel>
            <DropdownMenuItem className="gap-2" onClick={() => navigate("/organization/settings")}>
              <Building2 className="h-4 w-4" />
              조직 설정
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2" onClick={() => navigate("/user/settings")}>
              <User className="h-4 w-4" />
              개인 설정
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 gap-2 rounded-lg px-2 text-slate-700 hover:bg-slate-100"
              >
                <UserAvatar name={user.name} />
                <div className="text-left">
                  <p className="max-w-[120px] truncate text-sm font-medium leading-none text-slate-900">
                    {user.name}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-2">
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2" onClick={() => navigate("/user/settings")}>
                <User className="h-4 w-4" />
                내 계정
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="gap-2 text-red-600 focus:bg-red-50 focus:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
