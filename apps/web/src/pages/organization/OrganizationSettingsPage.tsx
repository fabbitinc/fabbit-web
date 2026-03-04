import {
  useMemo,
  useState,
  useRef,
  useCallback,
  type ComponentType,
} from "react";
import { useSearchParams } from "react-router-dom";
import {
  ShieldCheck,
  Building2,
  ListChecks,
  History,
  Users,
  Plus,
  Trash2,
  Mail,
  X,
  Loader2,
  Camera,
  ChevronDown,
  ChevronRight,
  UserPlus,
  UserMinus,
  Package,
  GitPullRequestArrow,
  Tag,
  Check,
  Pipette,
  Pencil,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAvatar, getInitials } from "@/components/UserAvatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LabelBadge } from "@fabbit/ui";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import {
  useMembers,
  useInvitations,
  useCreateInvitation,
  useCancelInvitation,
  useRemoveMember,
  useChangeMemberRole,
} from "@/api/hooks/useMembers";
import {
  useTeams,
  useTeamMembers,
  useCreateTeam,
  useDeleteTeam,
  useAddTeamMembers,
  useRemoveTeamMembers,
} from "@/api/hooks/useTeams";
import {
  useTenantLabels,
  useCreateTenantLabel,
  useDeleteTenantLabel,
} from "@/api/hooks/useLabels";
import {
  useCategories,
  useRenameCategory,
  useDefaultOwners,
  useUpsertDefaultOwner,
  useDeleteDefaultOwner,
} from "@/api/hooks/useParts";
import type { CreateLabelRequest } from "@/api/types";
import { COLOR_PRESETS } from "@/constants/labelConfig";
import { setOrgProfileImage, deleteOrgProfileImage } from "@/api/member";
import {
  createFileUpload as createUpload,
  uploadFileToPresignedUrl,
  completeFileUpload as completeUpload,
} from "@/api/file";
import type { MemberRole } from "@/api/types/member";
import { BillingSection } from "@/features/billing/components/BillingSection";

function getRoleBadge(role: string): {
  label: string;
  variant: "default" | "secondary";
} {
  switch (role.toUpperCase()) {
    case "OWNER":
      return { label: "소유자", variant: "default" };
    case "ADMIN":
      return { label: "관리자", variant: "default" };
    default:
      return { label: "사용자", variant: "secondary" };
  }
}

function isManagerRole(role: string | undefined): boolean {
  const upper = role?.toUpperCase();
  return upper === "ADMIN" || upper === "OWNER";
}

/** 현재 사용자가 대상 멤버를 제거할 수 있는지 판단 */
function canRemoveMember(
  myRole: string | undefined,
  myUserId: string | undefined,
  targetRole: string,
  targetUserId: string,
): boolean {
  if (targetUserId === myUserId) return false;
  const my = myRole?.toUpperCase();
  const target = targetRole.toUpperCase();
  if (my === "OWNER") return true;
  if (my === "ADMIN") return target === "MEMBER";
  return false;
}

type SettingsTab =
  | "general"
  | "members"
  | "parts"
  | "change"
  | "billing"
  | "security"
  | "logs"
  | "advanced";

const VALID_TABS = new Set<string>([
  "general",
  "members",
  "parts",
  "change",
  "billing",
  "security",
  "logs",
  "advanced",
]);

interface AllowedIpEntry {
  id: string;
  cidr: string;
}

const settingsTabs: Array<{
  id: SettingsTab;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { id: "general", label: "일반", icon: Building2 },
  { id: "members", label: "멤버", icon: Users },
  { id: "parts", label: "부품", icon: Package },
  { id: "change", label: "변경 관리", icon: GitPullRequestArrow },
  { id: "billing", label: "결제 관리", icon: CreditCard },
  { id: "security", label: "보안", icon: ShieldCheck },
  { id: "logs", label: "로그 기록", icon: History },
  { id: "advanced", label: "기타 설정", icon: ListChecks },
];

const mockActivityLogs = [
  {
    id: "log-1",
    action: "조직 설정 수정",
    actor: "김지훈",
    target: "결재 워크플로우",
    ip: "203.0.113.16",
    at: "2026-02-17 17:41",
    result: "성공",
  },
  {
    id: "log-2",
    action: "IP 허용 목록 변경",
    actor: "박민서",
    target: "허용 IP +1",
    ip: "198.51.100.5",
    at: "2026-02-17 15:12",
    result: "성공",
  },
  {
    id: "log-3",
    action: "권한 정책 변경 시도",
    actor: "이도윤",
    target: "2단계 인증 필수",
    ip: "203.0.113.221",
    at: "2026-02-16 09:20",
    result: "실패",
  },
  {
    id: "log-4",
    action: "세션 제한 시간 수정",
    actor: "김지훈",
    target: "8시간 → 4시간",
    ip: "203.0.113.16",
    at: "2026-02-15 11:03",
    result: "성공",
  },
];

export function OrganizationSettingsPage() {
  const currentOrg = useAuthStore(
    (state) => state.currentMembership?.organization,
  );
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const [searchParams, setSearchParams] = useSearchParams();

  const menuParam = searchParams.get("menu");
  const activeTab: SettingsTab =
    menuParam && VALID_TABS.has(menuParam)
      ? (menuParam as SettingsTab)
      : "general";

  const setActiveTab = useCallback(
    (tab: SettingsTab) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (tab === "general") {
          next.delete("menu");
        } else {
          next.set("menu", tab);
        }
        // 다른 메뉴로 전환 시 tab 파라미터 제거
        next.delete("tab");
        return next;
      });
    },
    [setSearchParams],
  );

  // 멤버 내부 탭 (사용자 / 팀)
  const memberTab =
    activeTab === "members"
      ? searchParams.get("tab") === "teams"
        ? "teams"
        : "users"
      : "users";

  const setMemberTab = useCallback(
    (tab: "users" | "teams") => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (tab === "users") {
          next.delete("tab");
        } else {
          next.set("tab", tab);
        }
        return next;
      });
    },
    [setSearchParams],
  );

  // 부품 내부 탭 (카테고리 / 담당 설정)
  const partsInnerTab =
    activeTab === "parts"
      ? searchParams.get("tab") === "assignment"
        ? "assignment"
        : "categories"
      : "categories";

  const setPartsInnerTab = useCallback(
    (tab: "categories" | "assignment") => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (tab === "categories") {
          next.delete("tab");
        } else {
          next.set("tab", tab);
        }
        return next;
      });
    },
    [setSearchParams],
  );

  // 변경 관리 내부 탭 (현재 라벨만 존재)
  const changeInnerTab =
    activeTab === "change" ? (searchParams.get("tab") ?? "labels") : "labels";

  const setChangeInnerTab = useCallback(
    (tab: "labels") => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (tab === "labels") {
          next.delete("tab");
        } else {
          next.set("tab", tab);
        }
        return next;
      });
    },
    [setSearchParams],
  );

  const orgName = currentOrg?.name ?? "Fabbit Design Team";
  const slug = currentOrg?.slug ?? "fabbit-design";

  const [orgImageUrl, setOrgImageUrl] = useState<string | null>(
    currentOrg?.profileImageUrl ?? null,
  );
  const orgFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingOrgImage, setIsUploadingOrgImage] = useState(false);

  const handleOrgImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error("이미지 파일만 업로드할 수 있습니다.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("파일 크기는 5MB 이하만 가능합니다.");
        return;
      }

      setIsUploadingOrgImage(true);
      try {
        const upload = await createUpload({
          original_name: file.name,
          content_type: file.type,
          file_size: file.size,
        });
        await uploadFileToPresignedUrl(
          upload.upload_url,
          file,
          file.type || "application/octet-stream",
        );
        await completeUpload(upload.file_id);
        const result = await setOrgProfileImage({ file_id: upload.file_id });
        setOrgImageUrl(result.profile_image_url);
        await fetchMe();
        toast.success("조직 프로필 이미지를 변경했습니다.");
      } catch {
        toast.error("이미지 업로드에 실패했습니다.");
      } finally {
        setIsUploadingOrgImage(false);
        if (orgFileInputRef.current) orgFileInputRef.current.value = "";
      }
    },
    [fetchMe],
  );

  const handleOrgImageRemove = useCallback(async () => {
    setIsUploadingOrgImage(true);
    try {
      await deleteOrgProfileImage();
      setOrgImageUrl(null);
      await fetchMe();
      toast.success("조직 프로필 이미지를 제거했습니다.");
    } catch {
      toast.error("프로필 이미지 제거에 실패했습니다.");
    } finally {
      setIsUploadingOrgImage(false);
      if (orgFileInputRef.current) orgFileInputRef.current.value = "";
    }
  }, [fetchMe]);
  const [enforceSso, setEnforceSso] = useState(false);
  const [requireMfa, setRequireMfa] = useState(true);
  const [allowOutsideInvite, setAllowOutsideInvite] = useState(false);
  const [approvalRequired, setApprovalRequired] = useState(true);
  const [ipRestrictionEnabled, setIpRestrictionEnabled] = useState(true);
  const [allowedIps, setAllowedIps] = useState<AllowedIpEntry[]>([
    { id: "ip-1", cidr: "203.0.113.0/24" },
    { id: "ip-2", cidr: "198.51.100.18" },
    { id: "ip-3", cidr: "192.0.2.42" },
  ]);
  const [newIp, setNewIp] = useState("");

  const saveSettings = () => {
    toast.success("조직 설정을 저장했습니다. (목데이터)");
  };

  const addAllowedIp = () => {
    const trimmed = newIp.trim();
    if (!trimmed) return;
    if (allowedIps.some((entry) => entry.cidr === trimmed)) {
      toast.info("이미 추가된 IP입니다.");
      return;
    }
    setAllowedIps((prev) => [
      ...prev,
      {
        id: `ip-${Date.now()}`,
        cidr: trimmed,
      },
    ]);
    setNewIp("");
  };

  const removeAllowedIp = (id: string) => {
    setAllowedIps((prev) => prev.filter((value) => value.id !== id));
  };

  const logSummary = useMemo(() => {
    const success = mockActivityLogs.filter(
      (log) => log.result === "성공",
    ).length;
    const failed = mockActivityLogs.length - success;
    return { success, failed };
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-foreground">조직 설정</h1>
        <p className="text-sm text-muted-foreground">
          {currentOrg?.name ?? "현재 조직"}의 보안 정책과 운영 설정을
          관리합니다.
        </p>
      </div>

      <div className="flex gap-0 rounded-lg border border-border bg-card">
        <aside className="w-56 border-r border-border bg-muted/30 p-4">
          <nav className="space-y-1">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                  activeTab === tab.id
                    ? "bg-background font-medium text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="flex-1 overflow-auto p-6">
          {activeTab === "general" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  기본 정보
                </h2>
                <div className="mt-4 flex gap-8">
                  {/* 조직 프로필 이미지 */}
                  <div className="flex flex-col items-center gap-3">
                    <Avatar
                      key={orgImageUrl ?? "fallback"}
                      className="h-42 w-42 rounded-xl"
                    >
                      {orgImageUrl ? (
                        <AvatarImage
                          src={orgImageUrl}
                          alt="조직 프로필 이미지"
                          className="rounded-xl"
                        />
                      ) : null}
                      <AvatarFallback className="rounded-xl text-3xl font-medium text-muted-foreground">
                        {getInitials(orgName)}
                      </AvatarFallback>
                    </Avatar>

                    <input
                      ref={orgFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleOrgImageUpload}
                    />

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isUploadingOrgImage}
                        onClick={() => orgFileInputRef.current?.click()}
                      >
                        {isUploadingOrgImage ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Camera className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        {orgImageUrl ? "변경" : "업로드"}
                      </Button>
                      {orgImageUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isUploadingOrgImage}
                          onClick={handleOrgImageRemove}
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          제거
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* 조직 정보 */}
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="org-name">조직명</Label>
                      <Input id="org-name" value={orgName} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="org-slug">워크스페이스 슬러그</Label>
                      <Input id="org-slug" value={slug} disabled />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-base font-semibold text-foreground">
                  초대 정책
                </h2>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        외부 도메인 사용자 초대 허용
                      </p>
                      <p className="text-xs text-muted-foreground">
                        비인가 도메인 초대를 허용할지 결정합니다.
                      </p>
                    </div>
                    <Switch
                      checked={allowOutsideInvite}
                      onCheckedChange={setAllowOutsideInvite}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        사용자 초대 승인 필수
                      </p>
                      <p className="text-xs text-muted-foreground">
                        관리자 승인 후에만 초대가 확정됩니다.
                      </p>
                    </div>
                    <Switch
                      checked={approvalRequired}
                      onCheckedChange={setApprovalRequired}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveSettings}>저장</Button>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="space-y-6">
              {/* 내부 탭: 사용자 / 팀 */}
              <div className="flex gap-1 border-b">
                {(
                  [
                    { key: "users", label: "사용자" },
                    { key: "teams", label: "팀" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={cn(
                      "relative px-3 py-2 text-sm font-medium transition-colors",
                      memberTab === tab.key
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => setMemberTab(tab.key)}
                  >
                    {tab.label}
                    {memberTab === tab.key && (
                      <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground" />
                    )}
                  </button>
                ))}
              </div>

              {memberTab === "teams" ? (
                <TeamsTabContent />
              ) : (
                <MembersUsersTabContent />
              )}
            </div>
          )}

          {activeTab === "parts" && (
            <div className="space-y-6">
              <div className="flex gap-1 border-b">
                {(
                  [
                    { key: "categories", label: "카테고리" },
                    { key: "assignment", label: "담당 설정" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={cn(
                      "relative px-3 py-2 text-sm font-medium transition-colors",
                      partsInnerTab === tab.key
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => setPartsInnerTab(tab.key)}
                  >
                    {tab.label}
                    {partsInnerTab === tab.key && (
                      <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground" />
                    )}
                  </button>
                ))}
              </div>

              {partsInnerTab === "categories" && <PartsCategoriesTab />}
              {partsInnerTab === "assignment" && <PartsDefaultAssignmentTab />}
            </div>
          )}

          {activeTab === "change" && (
            <div className="space-y-6">
              {/* 내부 탭: 라벨 */}
              <div className="flex gap-1 border-b">
                {([{ key: "labels", label: "라벨" }] as const).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={cn(
                      "relative px-3 py-2 text-sm font-medium transition-colors",
                      changeInnerTab === tab.key
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => setChangeInnerTab(tab.key)}
                  >
                    {tab.label}
                    {changeInnerTab === tab.key && (
                      <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground" />
                    )}
                  </button>
                ))}
              </div>

              {changeInnerTab === "labels" && <OrgLabelsTabContent />}
            </div>
          )}

          {activeTab === "billing" && <BillingSection />}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  접근 보안
                </h2>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        SSO 강제
                      </p>
                      <p className="text-xs text-muted-foreground">
                        일반 로그인 대신 조직 SSO 로그인만 허용합니다.
                      </p>
                    </div>
                    <Switch
                      checked={enforceSso}
                      onCheckedChange={setEnforceSso}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        2단계 인증 필수
                      </p>
                      <p className="text-xs text-muted-foreground">
                        모든 사용자에게 MFA 등록을 요구합니다.
                      </p>
                    </div>
                    <Switch
                      checked={requireMfa}
                      onCheckedChange={setRequireMfa}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">
                      IP 제한
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      허용 목록 기반으로 접속 IP를 제한합니다.
                    </p>
                  </div>
                  <Switch
                    checked={ipRestrictionEnabled}
                    onCheckedChange={setIpRestrictionEnabled}
                  />
                </div>

                <div className="mt-4 flex gap-2">
                  <Input
                    placeholder="예: 203.0.113.0/24"
                    value={newIp}
                    onChange={(e) => setNewIp(e.target.value)}
                    disabled={!ipRestrictionEnabled}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-1"
                    onClick={addAllowedIp}
                    disabled={!ipRestrictionEnabled}
                  >
                    <Plus className="h-4 w-4" />
                    추가
                  </Button>
                </div>

                <div className="mt-3 overflow-hidden rounded-md border border-border">
                  <div className="grid grid-cols-[1fr_auto] bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
                    <p>허용 IP</p>
                    <p className="text-right">관리</p>
                  </div>
                  {allowedIps.map((entry) => (
                    <div
                      key={entry.id}
                      className="grid grid-cols-[1fr_auto] items-center border-t border-border px-3 py-2 text-sm"
                    >
                      <p className="font-mono text-xs text-foreground">
                        {entry.cidr}
                      </p>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="허용 IP 삭제"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => removeAllowedIp(entry.id)}
                          disabled={!ipRestrictionEnabled}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "logs" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">성공 {logSummary.success}</Badge>
                <Badge variant="outline">실패 {logSummary.failed}</Badge>
                <p className="text-sm text-muted-foreground">
                  최근 7일 활동 로그 (목데이터)
                </p>
              </div>

              <div className="overflow-hidden rounded-md border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">시각</th>
                      <th className="px-4 py-3 text-left font-medium">작업</th>
                      <th className="px-4 py-3 text-left font-medium">대상</th>
                      <th className="px-4 py-3 text-left font-medium">
                        사용자
                      </th>
                      <th className="px-4 py-3 text-left font-medium">IP</th>
                      <th className="px-4 py-3 text-left font-medium">결과</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockActivityLogs.map((log) => (
                      <tr key={log.id} className="border-t border-border">
                        <td className="px-4 py-3 text-muted-foreground">
                          {log.at}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {log.action}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {log.target}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {log.actor}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {log.ip}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              log.result === "성공"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {log.result}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "advanced" && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-foreground">
                운영 정책
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-md border border-border p-4">
                  <p className="text-sm font-medium text-foreground">
                    감사 로그 보관 기간
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    기본값 180일
                  </p>
                  <Badge variant="outline" className="mt-2">
                    180일
                  </Badge>
                </div>
                <div className="rounded-md border border-border p-4">
                  <p className="text-sm font-medium text-foreground">
                    자동 비활성화 규칙
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    90일 미접속 계정 비활성화
                  </p>
                  <Badge variant="outline" className="mt-2">
                    사용 중
                  </Badge>
                </div>
                <div className="rounded-md border border-border p-4">
                  <p className="text-sm font-medium text-foreground">
                    웹훅 이벤트 발행
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    설정 변경 이벤트 외부 전송
                  </p>
                  <Badge variant="outline" className="mt-2">
                    준비 중
                  </Badge>
                </div>
                <div className="rounded-md border border-border p-4">
                  <p className="text-sm font-medium text-foreground">
                    프로비저닝 정책
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    SCIM 기반 계정 동기화
                  </p>
                  <Badge variant="outline" className="mt-2">
                    Enterprise
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// --- 부품 카테고리 관리 탭 ---

function PartsCategoriesTab() {
  const { data, isLoading } = useCategories();
  const renameMutation = useRenameCategory();
  const [renameTarget, setRenameTarget] = useState<{
    category: string;
    partCount: number;
  } | null>(null);
  const [newName, setNewName] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const categories = data?.items ?? [];

  const openRenameDialog = (category: string, partCount: number) => {
    setRenameTarget({ category, partCount });
    setNewName(category);
  };

  const isDuplicate = categories.some((c) => c.category === newName.trim() && c.category !== renameTarget?.category);

  // 1단계: 이름 입력 Dialog에서 "변경" 클릭 → 경고 AlertDialog 열기
  const handleRequestRename = () => {
    if (!renameTarget) return;
    const trimmed = newName.trim();
    if (!trimmed || trimmed === renameTarget.category) return;
    setConfirmOpen(true);
  };

  // 2단계: 경고 AlertDialog에서 "변경" 확인 → API 호출
  const handleConfirmRename = () => {
    if (!renameTarget) return;
    const trimmed = newName.trim();
    renameMutation.mutate(
      { category: renameTarget.category, request: { new_name: trimmed } },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          setRenameTarget(null);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">
          카테고리 관리
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          부품을 분류하는 카테고리를 관리합니다.
        </p>
      </div>

      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">카테고리명</th>
              <th className="px-4 py-3 text-left font-medium">부품 수</th>
              <th className="w-12 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            )}
            {!isLoading &&
              categories.map((cat) => (
                <tr key={cat.category} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{cat.category}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {cat.part_count}개
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="카테고리 이름 변경"
                      className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        openRenameDialog(cat.category, cat.part_count)
                      }
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            {!isLoading && categories.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  등록된 카테고리가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 1단계: 이름 입력 Dialog */}
      <Dialog
        open={renameTarget !== null && !confirmOpen}
        onOpenChange={(open) => {
          if (!open) setRenameTarget(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>카테고리 이름 변경</DialogTitle>
            <DialogDescription>
              새 카테고리 이름을 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="새 카테고리 이름"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRequestRename();
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>
              취소
            </Button>
            <Button
              onClick={handleRequestRename}
              disabled={
                !newName.trim() || newName.trim() === renameTarget?.category
              }
            >
              변경
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2단계: 경고 AlertDialog */}
      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open) setConfirmOpen(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isDuplicate ? "카테고리를 합치시겠습니까?" : "카테고리 이름을 변경하시겠습니까?"}
            </AlertDialogTitle>
            {isDuplicate ? (
              <AlertDialogDescription asChild>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>카테고리 <span className="font-medium text-foreground">"{renameTarget?.category}"</span>의 부품 {renameTarget?.partCount ?? 0}건이 <span className="font-medium text-foreground">"{newName.trim()}"</span>(으)로 이동됩니다.</p>
                  <ul className="list-disc space-y-1 pl-4">
                    <li>기본 담당자 설정은 <span className="font-medium text-foreground">"{newName.trim()}"</span>의 설정이 유지됩니다.</li>
                    <li>기존 부품의 담당자는 변경되지 않습니다.</li>
                  </ul>
                  <p className="font-medium text-destructive">이 작업은 되돌릴 수 없습니다.</p>
                </div>
              </AlertDialogDescription>
            ) : (
              <AlertDialogDescription asChild>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>"{renameTarget?.category}" 카테고리에 속한 모든 부품({renameTarget?.partCount ?? 0}개)의 카테고리 이름이 일괄 변경됩니다.</p>
                  <ul className="list-disc space-y-1 pl-4">
                    <li>기본 담당자 설정도 새 이름으로 함께 변경됩니다.</li>
                  </ul>
                </div>
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRename}
              disabled={renameMutation.isPending}
              className={isDuplicate ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {renameMutation.isPending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : null}
              {isDuplicate ? "합치기" : "변경"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// --- 팀/멤버 Popover Picker (lazy 로딩) ---

function TeamPickerPopover({
  selectedTeamId,
  selectedTeamName,
  onSelect,
}: {
  selectedTeamId: string | null;
  selectedTeamName: string | null;
  onSelect: (teamId: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data: teamsData, isLoading } = useTeams({ enabled: open });

  const teams = teamsData?.items ?? [];
  const filtered = teams.filter((t) => {
    if (!query.trim()) return true;
    return t.name.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-8 w-40 items-center rounded-md border border-input bg-background px-3 text-sm cursor-pointer hover:bg-muted transition-colors truncate"
        >
          <span
            className={cn(
              "truncate",
              !selectedTeamId && "text-muted-foreground",
            )}
          >
            {selectedTeamName ?? "팀 선택"}
          </span>
          <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="팀 검색"
          className="mb-2 h-8"
        />
        <div className="max-h-48 overflow-auto space-y-0.5">
          {isLoading && (
            <div className="flex justify-center py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
          {!isLoading && selectedTeamId && (
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted cursor-pointer"
              onClick={() => {
                onSelect(null);
                setOpen(false);
              }}
            >
              <X className="h-3.5 w-3.5" />
              선택 해제
            </button>
          )}
          {!isLoading &&
            filtered.map((team) => (
              <button
                key={team.id}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted cursor-pointer",
                  team.id === selectedTeamId && "bg-muted font-medium",
                )}
                onClick={() => {
                  onSelect(team.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "h-3.5 w-3.5",
                    team.id === selectedTeamId ? "opacity-100" : "opacity-0",
                  )}
                />
                {team.name}
              </button>
            ))}
          {!isLoading && filtered.length === 0 && (
            <p className="px-2 py-2 text-xs text-muted-foreground">
              검색 결과가 없습니다.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MemberPickerPopover({
  selectedMemberId,
  selectedMemberName,
  onSelect,
}: {
  selectedMemberId: string | null;
  selectedMemberName: string | null | undefined;
  onSelect: (memberId: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data: membersData, isLoading } = useMembers({ enabled: open });

  const members = membersData?.items ?? [];
  const filtered = members.filter((m) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      m.fullName.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
    );
  });

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-8 w-40 items-center rounded-md border border-input bg-background px-3 text-sm cursor-pointer hover:bg-muted transition-colors truncate"
        >
          <span
            className={cn(
              "truncate",
              !selectedMemberId && "text-muted-foreground",
            )}
          >
            {selectedMemberName ?? "미지정"}
          </span>
          <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="이름 또는 이메일 검색"
          className="mb-2 h-8"
        />
        <div className="max-h-48 overflow-auto space-y-0.5">
          {isLoading && (
            <div className="flex justify-center py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
          {!isLoading && selectedMemberId && (
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted cursor-pointer"
              onClick={() => {
                onSelect(null);
                setOpen(false);
              }}
            >
              <X className="h-3.5 w-3.5" />
              선택 해제
            </button>
          )}
          {!isLoading &&
            filtered.map((member) => (
              <button
                key={member.userId}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted cursor-pointer",
                  member.userId === selectedMemberId && "bg-muted font-medium",
                )}
                onClick={() => {
                  onSelect(member.userId);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    member.userId === selectedMemberId
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />
                <UserAvatar
                  name={member.fullName}
                  imageUrl={member.profileImageUrl}
                  className="h-5 w-5 text-[10px] shrink-0"
                />
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate">{member.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {member.email}
                  </p>
                </div>
              </button>
            ))}
          {!isLoading && filtered.length === 0 && (
            <p className="px-2 py-2 text-xs text-muted-foreground">
              검색 결과가 없습니다.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// --- 부품 기본 담당 설정 탭 ---

function PartsDefaultAssignmentTab() {
  const { data: ownersData, isLoading: ownersLoading } = useDefaultOwners();
  const { data: categoriesData } = useCategories();
  const upsertMutation = useUpsertDefaultOwner();
  const deleteMutation = useDeleteDefaultOwner();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    category: string | null;
  } | null>(null);

  const entries = ownersData?.items ?? [];

  // 이미 매핑된 카테고리 제외
  const usedCategories = useMemo(
    () =>
      new Set(
        entries.filter((e) => e.category !== null).map((e) => e.category),
      ),
    [entries],
  );
  const allCategories = useMemo(
    () => categoriesData?.items.map((c) => c.category) ?? [],
    [categoriesData],
  );
  const availableCategories = allCategories.filter(
    (c) => !usedCategories.has(c),
  );

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    upsertMutation.mutate(
      { category: trimmed },
      {
        onSuccess: () => {
          setNewCategory("");
          setAddDialogOpen(false);
        },
      },
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.category, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const handleTeamChange = (
    entry: (typeof entries)[number],
    teamId: string | null,
  ) => {
    upsertMutation.mutate({
      category: entry.category,
      default_owner_team_id: teamId,
      default_owner_id: entry.default_owner_id,
    });
  };

  const handleOwnerChange = (
    entry: (typeof entries)[number],
    ownerId: string | null,
  ) => {
    upsertMutation.mutate({
      category: entry.category,
      default_owner_id: ownerId,
      default_owner_team_id: entry.default_owner_team_id,
    });
  };

  // fallback(category=null) 행 — 없으면 가상 행
  const fallbackEntry = useMemo(() => {
    return (
      entries.find((e) => e.category === null) ?? {
        id: "__fallback__",
        category: null as string | null,
        default_owner_id: null,
        default_owner: null,
        default_owner_team_id: null,
        default_owner_team_name: null,
      }
    );
  }, [entries]);

  // 카테고리별 설정 (fallback 제외)
  const categoryEntries = useMemo(
    () => entries.filter((e) => e.category !== null),
    [entries],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">
          부품 기본 담당 설정
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          카테고리별 기본 담당팀과 담당자를 설정합니다. 앞으로 생성되는 부품에 자동으로
          적용됩니다.
        </p>
      </div>

      {/* 전역 기본값 */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-foreground">기본값</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          카테고리별 담당이 지정되지 않은 부품에 적용됩니다.
        </p>
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">카테고리</th>
                <th className="px-4 py-3 text-left font-medium">담당팀</th>
                <th className="px-4 py-3 text-left font-medium">담당자</th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {ownersLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : (
                <tr className="border-t border-border">
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    전체
                  </td>
                  <td className="px-4 py-3">
                    <TeamPickerPopover
                      selectedTeamId={fallbackEntry.default_owner_team_id}
                      selectedTeamName={fallbackEntry.default_owner_team_name}
                      onSelect={(teamId) =>
                        handleTeamChange(fallbackEntry, teamId)
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <MemberPickerPopover
                      selectedMemberId={fallbackEntry.default_owner_id}
                      selectedMemberName={
                        fallbackEntry.default_owner?.full_name
                      }
                      onSelect={(memberId) =>
                        handleOwnerChange(fallbackEntry, memberId)
                      }
                    />
                  </td>
                  <td className="px-4 py-3" />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 카테고리별 담당 */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-foreground">
          카테고리별 담당
        </h3>
        <p className="mb-3 text-xs text-muted-foreground">
          특정 카테고리에 대해 기본값을 덮어씁니다.
        </p>
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">카테고리</th>
                <th className="px-4 py-3 text-left font-medium">담당팀</th>
                <th className="px-4 py-3 text-left font-medium">담당자</th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {ownersLoading && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              )}
              {!ownersLoading &&
                categoryEntries.map((entry) => (
                  <tr key={entry.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{entry.category}</td>
                    <td className="px-4 py-3">
                      <TeamPickerPopover
                        selectedTeamId={entry.default_owner_team_id}
                        selectedTeamName={entry.default_owner_team_name}
                        onSelect={(teamId) => handleTeamChange(entry, teamId)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <MemberPickerPopover
                        selectedMemberId={entry.default_owner_id}
                        selectedMemberName={entry.default_owner?.full_name}
                        onSelect={(memberId) =>
                          handleOwnerChange(entry, memberId)
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="카테고리 매핑 삭제"
                        className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          setDeleteTarget({
                            id: entry.id,
                            category: entry.category,
                          })
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              {!ownersLoading && categoryEntries.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    카테고리별 담당 설정이 없습니다. 모든 부품에 기본값이
                    적용됩니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 담당 추가 */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <Button
          type="button"
          variant="outline"
          className="gap-1.5 cursor-pointer"
          onClick={() => setAddDialogOpen(true)}
          disabled={availableCategories.length === 0}
        >
          <Plus className="h-4 w-4" />
          담당 추가
        </Button>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>담당 추가</DialogTitle>
            <DialogDescription>
              기본 담당을 설정할 카테고리를 선택하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {availableCategories.length > 0 ? (
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">
                추가 가능한 카테고리가 없습니다.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleAddCategory}
              disabled={!newCategory.trim() || upsertMutation.isPending}
            >
              {upsertMutation.isPending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : null}
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>기본 담당 설정 삭제</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>"{deleteTarget?.category}" 카테고리의 기본 담당 설정을 삭제합니다.</p>
                <p>기존 부품의 담당자는 유지됩니다.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : null}
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// --- 멤버 > 사용자 탭 서브 컴포넌트 ---

function MembersUsersTabContent() {
  const currentUser = useAuthStore((state) => state.user);
  const currentRole = useAuthStore((state) => state.currentMembership?.role);
  const isOwner = currentRole?.toUpperCase() === "OWNER";

  const { data: membersData, isLoading: membersLoading } = useMembers();
  const { data: invitationsData, isLoading: invitationsLoading } =
    useInvitations();
  const createInvitationMutation = useCreateInvitation();
  const cancelInvitationMutation = useCancelInvitation();
  const removeMemberMutation = useRemoveMember();
  const changeRoleMutation = useChangeMemberRole();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<MemberRole>("MEMBER");

  const pendingInvitations =
    invitationsData?.invitations.filter((inv) => inv.status === "PENDING") ??
    [];

  const handleInvite = () => {
    const trimmed = inviteEmail.trim();
    if (!trimmed) return;
    createInvitationMutation.mutate(
      { email: trimmed, role: inviteRole },
      {
        onSuccess: () => {
          setInviteEmail("");
          setInviteRole("MEMBER");
        },
      },
    );
  };

  return (
    <>
      {/* 멤버 초대 */}
      <div>
        <h2 className="text-base font-semibold text-foreground">사용자 초대</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          이메일로 새 사용자를 초대합니다. 관리자만 초대할 수 있습니다.
        </p>
        <div className="mt-3 flex gap-2">
          <Input
            type="email"
            placeholder="초대할 이메일 주소"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleInvite();
            }}
            className="flex-1"
          />
          <Select
            value={inviteRole}
            onValueChange={(v) => setInviteRole(v as MemberRole)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MEMBER">사용자</SelectItem>
              <SelectItem value="ADMIN">관리자</SelectItem>
              <SelectItem value="OWNER">소유자</SelectItem>
            </SelectContent>
          </Select>
          <Button
            className="gap-1"
            onClick={handleInvite}
            disabled={!inviteEmail.trim() || createInvitationMutation.isPending}
          >
            {createInvitationMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            초대
          </Button>
        </div>
      </div>

      {/* 대기 중인 초대 */}
      {pendingInvitations.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-foreground">
            대기 중인 초대
          </h2>
          <div className="mt-3 overflow-hidden rounded-md border border-border">
            <div className="grid grid-cols-[1fr_100px_auto] bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground">
              <p>이메일</p>
              <p>역할</p>
              <p className="text-right">관리</p>
            </div>
            {pendingInvitations.map((inv) => (
              <div
                key={inv.id}
                className="grid grid-cols-[1fr_100px_auto] items-center border-t border-border px-4 py-2.5 text-sm"
              >
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-foreground">{inv.email}</span>
                </div>
                <Badge variant="outline" className="w-fit text-xs">
                  {getRoleBadge(inv.role).label}
                </Badge>
                <div className="flex justify-end">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>초대 취소</AlertDialogTitle>
                        <AlertDialogDescription>
                          {inv.email}에 대한 초대를 취소하시겠습니까?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>닫기</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() =>
                            cancelInvitationMutation.mutate(inv.id)
                          }
                        >
                          초대 취소
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 멤버 목록 */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            사용자 목록
          </h2>
          {membersData && (
            <p className="text-xs text-muted-foreground">
              {membersData.items.length}명
            </p>
          )}
        </div>

        {membersLoading || invitationsLoading ? (
          <div className="mt-4 flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="mt-3 overflow-hidden rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">이름</th>
                  <th className="px-4 py-3 text-left font-medium">이메일</th>
                  <th className="px-4 py-3 text-left font-medium">직무</th>
                  <th className="px-4 py-3 text-left font-medium">역할</th>
                  {isManagerRole(currentRole) && (
                    <th className="w-0 px-4 py-3" />
                  )}
                </tr>
              </thead>
              <tbody>
                {membersData?.items.map((member) => (
                  <tr key={member.userId} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar
                          name={member.fullName}
                          imageUrl={member.profileImageUrl}
                          className="h-7 w-7"
                        />
                        <span className="font-medium text-foreground">
                          {member.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {member.email}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {member.jobRole ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {isOwner && member.userId !== currentUser?.id ? (
                        <Select
                          value={member.role}
                          onValueChange={(v) =>
                            changeRoleMutation.mutate({
                              userId: member.userId,
                              role: v as MemberRole,
                            })
                          }
                        >
                          <SelectTrigger className="h-7 w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MEMBER">사용자</SelectItem>
                            <SelectItem value="ADMIN">관리자</SelectItem>
                            <SelectItem value="OWNER">소유자</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={getRoleBadge(member.role).variant}>
                          {getRoleBadge(member.role).label}
                        </Badge>
                      )}
                    </td>
                    {isManagerRole(currentRole) && (
                      <td className="w-0 px-4 py-3 text-center">
                        {canRemoveMember(
                          currentRole,
                          currentUser?.id,
                          member.role,
                          member.userId,
                        ) && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>사용자 제거</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {member.fullName}({member.email})을 조직에서
                                  제거하시겠습니까?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>닫기</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() =>
                                    removeMemberMutation.mutate(member.userId)
                                  }
                                >
                                  제거
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {membersData?.items.length === 0 && (
                  <tr>
                    <td
                      colSpan={isManagerRole(currentRole) ? 5 : 4}
                      className="px-4 py-8 text-center text-sm text-muted-foreground"
                    >
                      등록된 사용자가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

// --- 팀 탭 서브 컴포넌트 ---

function TeamsTabContent() {
  const { data: teamsData, isLoading: teamsLoading } = useTeams();
  const { data: membersData } = useMembers();
  const deleteTeamMutation = useDeleteTeam();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  const toggleExpand = (teamId: string) => {
    setExpandedTeamId((prev) => (prev === teamId ? null : teamId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">팀 관리</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            팀을 만들어 멤버를 그룹으로 관리할 수 있습니다.
          </p>
        </div>
        <Button className="gap-1" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />새 팀
        </Button>
      </div>

      {teamsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full table-fixed text-sm">
            <colgroup>
              <col className="w-10" />
              <col className="w-[25%]" />
              <col />
              <col className="w-20" />
              <col className="w-28" />
              <col className="w-16" />
            </colgroup>
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3" />
                <th className="px-4 py-3 text-left font-medium">이름</th>
                <th className="px-4 py-3 text-left font-medium">설명</th>
                <th className="px-4 py-3 text-left font-medium">멤버</th>
                <th className="px-4 py-3 text-left font-medium">생성일</th>
                <th className="whitespace-nowrap px-4 py-3 text-center font-medium">
                  삭제
                </th>
              </tr>
            </thead>
            <tbody>
              {teamsData?.items.map((team) => (
                <TeamRow
                  key={team.id}
                  team={team}
                  isExpanded={expandedTeamId === team.id}
                  onToggle={() => toggleExpand(team.id)}
                  onDelete={() => deleteTeamMutation.mutate(team.id)}
                  orgMembers={membersData?.items ?? []}
                />
              ))}
              {teamsData?.items.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    등록된 팀이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <CreateTeamDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}

function TeamRow({
  team,
  isExpanded,
  onToggle,
  onDelete,
  orgMembers,
}: {
  team: import("@/api/types").TeamSummaryDto;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  orgMembers: import("@/api/types").MemberDto[];
}) {
  return (
    <>
      <tr
        className="cursor-pointer border-t border-border hover:bg-muted/20"
        onClick={onToggle}
      >
        <td className="px-4 py-3 text-muted-foreground">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </td>
        <td className="px-4 py-3 font-medium text-foreground">{team.name}</td>
        <td className="px-4 py-3 text-muted-foreground">
          {team.description || "—"}
        </td>
        <td className="px-4 py-3">
          <Badge variant="secondary">{team.memberCount}명</Badge>
        </td>
        <td className="px-4 py-3 text-muted-foreground">
          {new Date(team.createdAt).toLocaleDateString("ko-KR")}
        </td>
        <td className="px-4 py-3 text-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>팀 삭제</AlertDialogTitle>
                <AlertDialogDescription>
                  &quot;{team.name}&quot; 팀을 삭제하시겠습니까? 소속 멤버
                  관계도 함께 삭제됩니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>닫기</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={onDelete}
                >
                  삭제
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td
            colSpan={6}
            className="border-t border-border bg-muted/10 px-6 py-4"
          >
            <TeamMembersPanel teamId={team.id} orgMembers={orgMembers} />
          </td>
        </tr>
      )}
    </>
  );
}

function CreateTeamDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createTeamMutation = useCreateTeam();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    createTeamMutation.mutate(
      { name: trimmedName, description: description.trim() || null },
      {
        onSuccess: () => {
          setName("");
          setDescription("");
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>새 팀 만들기</DialogTitle>
          <DialogDescription>팀 이름과 설명을 입력하세요.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="team-name">팀 이름</Label>
            <Input
              id="team-name"
              placeholder="예: 디자인팀"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team-description">설명 (선택)</Label>
            <Input
              id="team-description"
              placeholder="팀에 대한 간단한 설명"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || createTeamMutation.isPending}
          >
            {createTeamMutation.isPending ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : null}
            만들기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TeamMembersPanel({
  teamId,
  orgMembers,
}: {
  teamId: string;
  orgMembers: import("@/api/types").MemberDto[];
}) {
  const { data: teamMembersData, isLoading } = useTeamMembers(teamId);
  const addMembersMutation = useAddTeamMembers(teamId);
  const removeMembersMutation = useRemoveTeamMembers(teamId);
  const [selectedUserId, setSelectedUserId] = useState("");

  const teamMemberIds = useMemo(
    () => new Set(teamMembersData?.items.map((m) => m.userId) ?? []),
    [teamMembersData],
  );

  const availableMembers = useMemo(
    () => orgMembers.filter((m) => !teamMemberIds.has(m.userId)),
    [orgMembers, teamMemberIds],
  );

  const handleAdd = () => {
    if (!selectedUserId) return;
    addMembersMutation.mutate([selectedUserId], {
      onSuccess: () => setSelectedUserId(""),
    });
  };

  const handleRemove = (userId: string) => {
    removeMembersMutation.mutate([userId]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 멤버 추가 */}
      <div className="flex items-center gap-2">
        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="멤버 선택..." />
          </SelectTrigger>
          <SelectContent>
            {availableMembers.map((m) => (
              <SelectItem key={m.userId} value={m.userId}>
                {m.fullName} ({m.email})
              </SelectItem>
            ))}
            {availableMembers.length === 0 && (
              <div className="px-3 py-2 text-xs text-muted-foreground">
                추가 가능한 멤버가 없습니다
              </div>
            )}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={handleAdd}
          disabled={!selectedUserId || addMembersMutation.isPending}
        >
          {addMembersMutation.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <UserPlus className="h-3.5 w-3.5" />
          )}
          추가
        </Button>
      </div>

      {/* 현재 멤버 목록 */}
      {teamMembersData && teamMembersData.items.length > 0 ? (
        <div className="overflow-hidden rounded-md border border-border">
          <div className="grid grid-cols-[1fr_1fr_auto] bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground">
            <p>이름</p>
            <p>이메일</p>
            <p className="text-right">제거</p>
          </div>
          {teamMembersData.items.map((member) => (
            <div
              key={member.userId}
              className="grid grid-cols-[1fr_1fr_auto] items-center border-t border-border px-4 py-2.5 text-sm"
            >
              <span className="font-medium text-foreground">
                {member.fullName}
              </span>
              <span className="text-muted-foreground">{member.email}</span>
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemove(member.userId)}
                  disabled={removeMembersMutation.isPending}
                >
                  <UserMinus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          팀에 소속된 멤버가 없습니다.
        </p>
      )}
    </div>
  );
}

// --- 조직 라벨 탭 ---

function OrgLabelsTabContent() {
  const { data: labelsData, isLoading } = useTenantLabels();
  const deleteLabelMutation = useDeleteTenantLabel();
  const labels = labelsData?.items ?? [];
  const [createLabelOpen, setCreateLabelOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">라벨</h2>
        <Button className="gap-1" onClick={() => setCreateLabelOpen(true)}>
          <Plus className="h-4 w-4" />
          라벨 추가
        </Button>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : labels.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            라벨이 없습니다.
          </p>
        ) : (
          labels.map((label) => (
            <div
              key={label.id}
              className="flex items-center gap-3 rounded-md border border-border px-4 py-2.5"
            >
              <LabelBadge label={label.name} colorHex={label.color} />
              <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                {label.description ?? ""}
              </span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>라벨을 영구 삭제</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>이 라벨을 삭제하면 다시 복구할 수 없습니다.</p>
                      <p>
                        삭제 시 모든 이슈 및 변경 요청에서 해당 라벨이
                        제거됩니다.
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => {
                        deleteLabelMutation.mutate(label.id, {
                          onSuccess: () =>
                            toast.success(
                              `"${label.name}" 라벨을 삭제했습니다.`,
                            ),
                        });
                      }}
                    >
                      라벨 삭제
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))
        )}
      </div>

      <CreateOrgLabelDialog
        open={createLabelOpen}
        onOpenChange={setCreateLabelOpen}
        existingNames={new Set(labels.map((l) => l.name))}
      />
    </div>
  );
}

// --- 조직 라벨 생성 다이얼로그 ---

function CreateOrgLabelDialog({
  open,
  onOpenChange,
  existingNames,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingNames: Set<string>;
}) {
  const createLabelMutation = useCreateTenantLabel();
  const colorInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLOR_PRESETS[0].value as string);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setName("");
      setDescription("");
      setColor(COLOR_PRESETS[0].value);
    }
    onOpenChange(next);
  }

  function handleSubmit() {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    if (existingNames.has(trimmedName)) {
      toast.info("이미 존재하는 라벨입니다.");
      return;
    }
    const request: CreateLabelRequest = {
      name: trimmedName,
      color,
      description: description.trim() || undefined,
    };
    createLabelMutation.mutate(request, {
      onSuccess: () => {
        toast.success(`"${trimmedName}" 라벨을 추가했습니다.`);
        handleOpenChange(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>라벨 추가</DialogTitle>
          <DialogDescription>
            조직에서 사용할 새 라벨을 만드세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 미리보기 */}
          <div className="flex items-center justify-center rounded-md border border-dashed border-border bg-muted/30 py-4">
            {name.trim() ? (
              <LabelBadge label={name.trim()} colorHex={color} />
            ) : (
              <span className="text-xs text-muted-foreground">
                라벨 미리보기
              </span>
            )}
          </div>

          {/* 이름 */}
          <div className="space-y-1.5">
            <Label htmlFor="org-label-name">이름</Label>
            <Input
              id="org-label-name"
              placeholder="라벨 이름 (최대 50자)"
              maxLength={50}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
          </div>

          {/* 설명 */}
          <div className="space-y-1.5">
            <Label htmlFor="org-label-desc">
              설명{" "}
              <span className="text-muted-foreground font-normal">(선택)</span>
            </Label>
            <Textarea
              id="org-label-desc"
              placeholder="라벨에 대한 간단한 설명 (최대 200자)"
              maxLength={200}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* 색상 */}
          <div className="space-y-1.5">
            <Label>색상</Label>
            <div className="grid grid-cols-10 gap-1.5">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  title={preset.label}
                  onClick={() => setColor(preset.value)}
                  className="group relative flex h-7 w-7 items-center justify-center rounded-md border border-transparent transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ backgroundColor: preset.value }}
                >
                  {color === preset.value && (
                    <Check className="h-3.5 w-3.5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]" />
                  )}
                </button>
              ))}
            </div>

            {/* 커스텀 색상 */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => colorInputRef.current?.click()}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-dashed border-border transition-colors hover:bg-muted"
              >
                <Pipette className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <input
                ref={colorInputRef}
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="sr-only"
              />
              <span className="text-xs text-muted-foreground">직접 선택</span>
              <span className="ml-auto rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                {color.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={createLabelMutation.isPending}
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || createLabelMutation.isPending}
          >
            {createLabelMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
