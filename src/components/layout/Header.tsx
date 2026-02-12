import { Search, Bell, ChevronDown, Check, LogOut, Settings, Building2 } from "lucide-react";
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
  const sizeClasses = size === "sm" ? "h-6 w-6 text-xs" : "h-8 w-8 text-sm";

  return (
    <div className={cn("flex items-center justify-center rounded bg-blue-100 font-semibold text-blue-700", sizeClasses)}>
      {getInitials(name)}
    </div>
  );
}

function UserAvatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const sizeClasses = size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm";

  return (
    <div className={cn("flex items-center justify-center rounded-full bg-slate-700 font-medium text-white", sizeClasses)}>
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

export function Header() {
  const { user, memberships, currentMembership, logout } = useAuthStore();
  const currentOrg = currentMembership?.organization;

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Search..."
            className="border-slate-200 bg-slate-50 pl-9 text-sm placeholder:text-slate-400 focus:bg-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* 알림 */}
        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-slate-900">
          <Bell className="h-[18px] w-[18px]" />
        </Button>

        {/* 조직 선택 */}
        {currentOrg && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 gap-2 px-2 text-slate-700 hover:bg-slate-100"
              >
                <OrganizationAvatar name={currentOrg.name} />
                <span className="max-w-[120px] truncate text-sm font-medium">
                  {currentOrg.name}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="text-xs font-normal text-slate-500">
                조직 전환
              </DropdownMenuLabel>
              {memberships.map((m) => (
                <DropdownMenuItem
                  key={m.orgId}
                  className="flex items-center gap-3 py-2"
                >
                  <OrganizationAvatar name={m.organization.name} size="md" />
                  <div className="flex-1 min-w-0">
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
              <DropdownMenuItem className="gap-2 text-slate-600">
                <Building2 className="h-4 w-4" />
                조직 관리
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* 사용자 메뉴 */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 gap-2 px-2 text-slate-700 hover:bg-slate-100"
              >
                <UserAvatar name={user.name} />
                <div className="hidden md:block text-left">
                  <p className="max-w-[100px] truncate text-sm font-medium leading-none">
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
              <DropdownMenuItem className="gap-2">
                <Settings className="h-4 w-4" />
                설정
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
