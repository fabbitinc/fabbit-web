import { useMemo, useState, useRef, useCallback, type ComponentType } from "react";
import { ShieldCheck, Building2, ListChecks, History, Users, Plus, Trash2, Mail, X, Loader2, Camera } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useAuthStore } from "@/stores/authStore";
import { useMembers, useInvitations, useCreateInvitation, useCancelInvitation, useRemoveMember } from "@/api/hooks/useMembers";
import {
  setOrgProfileImage,
  deleteOrgProfileImage,
} from "@/api/member";
import {
  createUpload,
  uploadFileToUrl,
  completeUpload,
} from "@/api/upload";
import type { MemberRole } from "@/api/types/member";

type SettingsTab = "general" | "members" | "security" | "logs" | "advanced";

interface AllowedIpEntry {
  id: string;
  cidr: string;
}

const settingsTabs: Array<{ id: SettingsTab; label: string; icon: ComponentType<{ className?: string }> }> = [
  { id: "general", label: "일반", icon: Building2 },
  { id: "members", label: "사용자", icon: Users },
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
  const currentUser = useAuthStore((state) => state.user);
  const currentOrg = useAuthStore((state) => state.currentMembership?.organization);
  const currentRole = useAuthStore((state) => state.currentMembership?.role);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const orgName = currentOrg?.name ?? "Fabbit Design Team";
  const slug = currentOrg?.slug ?? "fabbit-design";

  const [orgImageUrl, setOrgImageUrl] = useState<string | null>(currentOrg?.profileImageUrl ?? null);
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
        await uploadFileToUrl(upload.upload_url, file);
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

  // 멤버 탭 상태
  const { data: membersData, isLoading: membersLoading } = useMembers();
  const { data: invitationsData, isLoading: invitationsLoading } = useInvitations();
  const createInvitationMutation = useCreateInvitation();
  const cancelInvitationMutation = useCancelInvitation();
  const removeMemberMutation = useRemoveMember();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<MemberRole>("MEMBER");

  const pendingInvitations = invitationsData?.invitations.filter((inv) => inv.status === "PENDING") ?? [];

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
    const success = mockActivityLogs.filter((log) => log.result === "성공").length;
    const failed = mockActivityLogs.length - success;
    return { success, failed };
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-foreground">조직 설정</h1>
        <p className="text-sm text-muted-foreground">
          {currentOrg?.name ?? "현재 조직"}의 보안 정책과 운영 설정을 관리합니다.
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
                <h2 className="text-base font-semibold text-foreground">기본 정보</h2>
                <div className="mt-4 flex gap-8">
                  {/* 조직 프로필 이미지 */}
                  <div className="flex flex-col items-center gap-3">
                    <Avatar key={orgImageUrl ?? "fallback"} className="h-42 w-42 rounded-xl">
                      {orgImageUrl ? (
                        <AvatarImage
                          src={orgImageUrl}
                          alt="조직 프로필 이미지"
                          className="rounded-xl"
                        />
                      ) : null}
                      <AvatarFallback className="rounded-xl text-3xl font-medium text-muted-foreground">
                        {orgName.charAt(0)}
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
                <h2 className="text-base font-semibold text-foreground">초대 정책</h2>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">외부 도메인 사용자 초대 허용</p>
                      <p className="text-xs text-muted-foreground">비인가 도메인 초대를 허용할지 결정합니다.</p>
                    </div>
                    <Switch checked={allowOutsideInvite} onCheckedChange={setAllowOutsideInvite} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">사용자 초대 승인 필수</p>
                      <p className="text-xs text-muted-foreground">관리자 승인 후에만 초대가 확정됩니다.</p>
                    </div>
                    <Switch checked={approvalRequired} onCheckedChange={setApprovalRequired} />
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
              {/* 멤버 초대 */}
              <div>
                <h2 className="text-base font-semibold text-foreground">사용자 초대</h2>
                <p className="mt-1 text-xs text-muted-foreground">이메일로 새 사용자를 초대합니다. 관리자만 초대할 수 있습니다.</p>
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
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as MemberRole)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">사용자</SelectItem>
                      <SelectItem value="ADMIN">관리자</SelectItem>
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
                  <h2 className="text-base font-semibold text-foreground">대기 중인 초대</h2>
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
                          {inv.role === "ADMIN" ? "관리자" : "사용자"}
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
                                  onClick={() => cancelInvitationMutation.mutate(inv.id)}
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
                  <h2 className="text-base font-semibold text-foreground">사용자 목록</h2>
                  {membersData && (
                    <p className="text-xs text-muted-foreground">{membersData.items.length}명</p>
                  )}
                </div>

                {(membersLoading || invitationsLoading) ? (
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
                          {currentRole === "ADMIN" && (
                            <th className="w-0 px-4 py-3 text-center font-medium">제거</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {membersData?.items.map((member) => (
                          <tr key={member.userId} className="border-t border-border">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <Avatar className="h-7 w-7">
                                  {member.profileImageUrl && (
                                    <AvatarImage src={member.profileImageUrl} alt={member.fullName} />
                                  )}
                                  <AvatarFallback className="text-xs font-medium">
                                    {member.fullName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-foreground">{member.fullName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{member.email}</td>
                            <td className="px-4 py-3 text-muted-foreground">{member.jobRole ?? "—"}</td>
                            <td className="px-4 py-3">
                              <Badge variant={member.role === "ADMIN" ? "default" : "secondary"}>
                                {member.role === "ADMIN" ? "관리자" : "사용자"}
                              </Badge>
                            </td>
                            {currentRole === "ADMIN" && (
                              <td className="w-0 px-4 py-3 text-center">
                                {member.userId !== currentUser?.id && (
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
                                          {member.fullName}({member.email})을 조직에서 제거하시겠습니까?
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>닫기</AlertDialogCancel>
                                        <AlertDialogAction
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                          onClick={() => removeMemberMutation.mutate(member.userId)}
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
                            <td colSpan={currentRole === "ADMIN" ? 5 : 4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                              등록된 사용자가 없습니다.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-foreground">접근 보안</h2>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">SSO 강제</p>
                      <p className="text-xs text-muted-foreground">일반 로그인 대신 조직 SSO 로그인만 허용합니다.</p>
                    </div>
                    <Switch checked={enforceSso} onCheckedChange={setEnforceSso} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">2단계 인증 필수</p>
                      <p className="text-xs text-muted-foreground">모든 사용자에게 MFA 등록을 요구합니다.</p>
                    </div>
                    <Switch checked={requireMfa} onCheckedChange={setRequireMfa} />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">IP 제한</h2>
                    <p className="text-xs text-muted-foreground">허용 목록 기반으로 접속 IP를 제한합니다.</p>
                  </div>
                  <Switch checked={ipRestrictionEnabled} onCheckedChange={setIpRestrictionEnabled} />
                </div>

                <div className="mt-4 flex gap-2">
                  <Input
                    placeholder="예: 203.0.113.0/24"
                    value={newIp}
                    onChange={(e) => setNewIp(e.target.value)}
                    disabled={!ipRestrictionEnabled}
                  />
                  <Button type="button" variant="outline" className="gap-1" onClick={addAllowedIp} disabled={!ipRestrictionEnabled}>
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
                    <div key={entry.id} className="grid grid-cols-[1fr_auto] items-center border-t border-border px-3 py-2 text-sm">
                      <p className="font-mono text-xs text-foreground">{entry.cidr}</p>
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
                <p className="text-sm text-muted-foreground">최근 7일 활동 로그 (목데이터)</p>
              </div>

              <div className="overflow-hidden rounded-md border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">시각</th>
                      <th className="px-4 py-3 text-left font-medium">작업</th>
                      <th className="px-4 py-3 text-left font-medium">대상</th>
                      <th className="px-4 py-3 text-left font-medium">사용자</th>
                      <th className="px-4 py-3 text-left font-medium">IP</th>
                      <th className="px-4 py-3 text-left font-medium">결과</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockActivityLogs.map((log) => (
                      <tr key={log.id} className="border-t border-border">
                        <td className="px-4 py-3 text-muted-foreground">{log.at}</td>
                        <td className="px-4 py-3 text-foreground">{log.action}</td>
                        <td className="px-4 py-3 text-muted-foreground">{log.target}</td>
                        <td className="px-4 py-3 text-foreground">{log.actor}</td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{log.ip}</td>
                        <td className="px-4 py-3">
                          <Badge variant={log.result === "성공" ? "secondary" : "destructive"}>{log.result}</Badge>
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
              <h2 className="text-base font-semibold text-foreground">운영 정책</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-md border border-border p-4">
                  <p className="text-sm font-medium text-foreground">감사 로그 보관 기간</p>
                  <p className="mt-1 text-xs text-muted-foreground">기본값 180일</p>
                  <Badge variant="outline" className="mt-2">180일</Badge>
                </div>
                <div className="rounded-md border border-border p-4">
                  <p className="text-sm font-medium text-foreground">자동 비활성화 규칙</p>
                  <p className="mt-1 text-xs text-muted-foreground">90일 미접속 계정 비활성화</p>
                  <Badge variant="outline" className="mt-2">사용 중</Badge>
                </div>
                <div className="rounded-md border border-border p-4">
                  <p className="text-sm font-medium text-foreground">웹훅 이벤트 발행</p>
                  <p className="mt-1 text-xs text-muted-foreground">설정 변경 이벤트 외부 전송</p>
                  <Badge variant="outline" className="mt-2">준비 중</Badge>
                </div>
                <div className="rounded-md border border-border p-4">
                  <p className="text-sm font-medium text-foreground">프로비저닝 정책</p>
                  <p className="mt-1 text-xs text-muted-foreground">SCIM 기반 계정 동기화</p>
                  <Badge variant="outline" className="mt-2">Enterprise</Badge>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
