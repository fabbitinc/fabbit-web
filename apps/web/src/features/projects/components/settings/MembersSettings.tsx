import { useState, useMemo, useCallback } from "react";
import { UserPlus, Trash2, Clock, Search, Check, Save, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ProjectMember, MemberRole } from "../../types/settings.types";
import { ROLE_LABELS } from "../../types/settings.types";
import {
  mockProjectMembers,
  mockTenantUsers,
  getAvatarColor,
  getInitials,
} from "../../mock-data/settings-mock";

interface RoleChangeConfirm {
  memberId: string;
  memberName: string;
  fromRole: MemberRole;
  toRole: MemberRole;
  type: "promote" | "demote";
}

export function MembersSettings() {
  const [members, setMembers] = useState<ProjectMember[]>(mockProjectMembers);
  const [originalMembers, setOriginalMembers] = useState<ProjectMember[]>(mockProjectMembers);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [roleChangeConfirm, setRoleChangeConfirm] = useState<RoleChangeConfirm | null>(null);

  // 변경사항이 있는지 확인
  const hasChanges = useMemo(() => {
    if (members.length !== originalMembers.length) return true;
    return members.some((member) => {
      const original = originalMembers.find((m) => m.id === member.id);
      if (!original) return true;
      return member.role !== original.role;
    });
  }, [members, originalMembers]);

  // 관리자 수 계산
  const adminCount = useMemo(
    () => members.filter((m) => m.role === "admin").length,
    [members]
  );

  // 이미 멤버인 유저 ID 목록
  const existingMemberIds = useMemo(
    () => new Set(members.map((m) => m.userId)),
    [members]
  );

  // 초대 가능한 유저 목록 (이미 멤버가 아닌 유저만)
  const availableUsers = useMemo(() => {
    return mockTenantUsers.filter((user) => !existingMemberIds.has(user.id));
  }, [existingMemberIds]);

  // 검색 필터링
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return availableUsers;
    const query = searchQuery.toLowerCase();
    return availableUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.department?.toLowerCase().includes(query)
    );
  }, [availableUsers, searchQuery]);

  const handleToggleUser = (userId: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleInvite = () => {
    const newMembers: ProjectMember[] = Array.from(selectedUsers).map(
      (userId) => {
        const user = mockTenantUsers.find((u) => u.id === userId)!;
        return {
          id: `member-${Date.now()}-${userId}`,
          userId: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: "viewer" as MemberRole,
          invitedAt: new Date().toISOString(),
        };
      }
    );

    const updatedMembers = [...members, ...newMembers];
    setMembers(updatedMembers);
    setOriginalMembers(updatedMembers);
    setSelectedUsers(new Set());
    setSearchQuery("");
    setIsInviteDialogOpen(false);
  };

  const handleRoleChangeRequest = useCallback(
    (memberId: string, newRole: MemberRole) => {
      const member = members.find((m) => m.id === memberId);
      if (!member) return;

      const currentRole = member.role;

      // 관리자로 승격하는 경우
      if (newRole === "admin" && currentRole !== "admin") {
        setRoleChangeConfirm({
          memberId,
          memberName: member.name,
          fromRole: currentRole,
          toRole: newRole,
          type: "promote",
        });
        return;
      }

      // 관리자에서 강등하는 경우 (유일한 관리자인지 확인)
      if (currentRole === "admin" && newRole !== "admin") {
        if (adminCount <= 1) {
          // 유일한 관리자는 강등 불가
          return;
        }
        setRoleChangeConfirm({
          memberId,
          memberName: member.name,
          fromRole: currentRole,
          toRole: newRole,
          type: "demote",
        });
        return;
      }

      // 일반적인 역할 변경
      setMembers(members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)));
    },
    [members, adminCount]
  );

  const handleConfirmRoleChange = () => {
    if (!roleChangeConfirm) return;
    setMembers(
      members.map((m) =>
        m.id === roleChangeConfirm.memberId
          ? { ...m, role: roleChangeConfirm.toRole }
          : m
      )
    );
    setRoleChangeConfirm(null);
  };

  const handleRemove = (memberId: string) => {
    const updatedMembers = members.filter((m) => m.id !== memberId);
    setMembers(updatedMembers);
    setOriginalMembers(updatedMembers);
  };

  const handleSave = () => {
    // TODO: API 연동
    console.log("멤버 설정 저장:", members);
    setOriginalMembers([...members]);
  };

  const handleCancel = () => {
    setMembers([...originalMembers]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="relative pb-16">
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-[#0f172a]">멤버 관리</h2>
            <p className="mt-1 text-sm text-[#64748b]">
              프로젝트에 참여하는 멤버를 관리합니다.
            </p>
          </div>
          <Button
            onClick={() => setIsInviteDialogOpen(true)}
            className="bg-[#3b82f6] hover:bg-[#2563eb]"
            disabled={availableUsers.length === 0}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            멤버 초대
          </Button>
        </div>

        {/* 멤버 목록 */}
        <div className="mt-6">
          <div className="rounded-lg border border-[#e2e8f0]">
            {/* 테이블 헤더 */}
            <div className="grid grid-cols-[1fr_120px_120px_80px] gap-4 border-b border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#64748b]">
              <div>멤버</div>
              <div>역할</div>
              <div>초대일</div>
              <div></div>
            </div>

            {/* 멤버 행 */}
            {members.map((member) => {
              const isOnlyAdmin = member.role === "admin" && adminCount <= 1;
              return (
                <div
                  key={member.id}
                  className="grid grid-cols-[1fr_120px_120px_80px] items-center gap-4 border-b border-[#e2e8f0] px-4 py-3 last:border-b-0"
                >
                  {/* 멤버 정보 */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback
                        style={{ backgroundColor: getAvatarColor(member.name) }}
                        className="text-xs text-white"
                      >
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-[#0f172a]">
                          {member.name}
                        </p>
                        {!member.joinedAt && (
                          <span className="flex items-center gap-1 rounded bg-[#fef3c7] px-1.5 py-0.5 text-[10px] font-medium text-[#d97706]">
                            <Clock className="h-3 w-3" />
                            대기중
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-[#64748b]">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  {/* 역할 선택 */}
                  <div>
                    <Select
                      value={member.role}
                      onValueChange={(value: MemberRole) =>
                        handleRoleChangeRequest(member.id, value)
                      }
                      disabled={isOnlyAdmin}
                    >
                      <SelectTrigger
                        className={`h-8 text-xs ${isOnlyAdmin ? "opacity-50" : ""}`}
                        title={isOnlyAdmin ? "유일한 관리자는 역할을 변경할 수 없습니다" : ""}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">{ROLE_LABELS.admin}</SelectItem>
                        <SelectItem value="editor">{ROLE_LABELS.editor}</SelectItem>
                        <SelectItem value="viewer">{ROLE_LABELS.viewer}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 초대일 */}
                  <div className="text-sm text-[#64748b]">
                    {formatDate(member.invitedAt)}
                  </div>

                  {/* 삭제 버튼 */}
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(member.id)}
                      disabled={isOnlyAdmin}
                      className={`h-8 w-8 p-0 text-[#64748b] hover:bg-[#fef2f2] hover:text-[#ef4444] ${
                        isOnlyAdmin ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      title={isOnlyAdmin ? "유일한 관리자는 삭제할 수 없습니다" : ""}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {members.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-[#64748b]">
                아직 멤버가 없습니다. 멤버를 초대하세요.
              </div>
            )}
          </div>
        </div>

        {/* 역할 설명 */}
        <div className="mt-4 rounded-lg bg-[#f8fafc] p-4">
          <p className="text-xs font-medium text-[#64748b]">역할 권한</p>
          <ul className="mt-2 space-y-1 text-xs text-[#64748b]">
            <li>
              <span className="font-medium text-[#0f172a]">관리자</span>: 프로젝트
              설정 변경, 멤버 관리, 모든 권한
            </li>
            <li>
              <span className="font-medium text-[#0f172a]">편집자</span>: 품목
              생성/수정/삭제, 도면 업로드
            </li>
            <li>
              <span className="font-medium text-[#0f172a]">뷰어</span>: 읽기 전용,
              댓글 작성
            </li>
          </ul>
        </div>
      </div>

      {/* 변경사항 플로팅 바 */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-4 rounded-lg border border-[#e2e8f0] bg-white px-4 py-3 shadow-lg">
            <p className="text-sm text-[#64748b]">
              저장하지 않은 변경사항이 있습니다.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="mr-1.5 h-4 w-4" />
                취소
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-[#3b82f6] hover:bg-[#2563eb]"
              >
                <Save className="mr-1.5 h-4 w-4" />
                저장
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 멤버 초대 다이얼로그 */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>멤버 초대</DialogTitle>
          </DialogHeader>

          {/* 검색 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
            <Input
              className="pl-10"
              placeholder="이름, 이메일 또는 부서로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* 유저 목록 */}
          <div className="max-h-64 overflow-auto">
            {filteredUsers.length > 0 ? (
              <div className="space-y-1">
                {filteredUsers.map((user) => {
                  const isSelected = selectedUsers.has(user.id);
                  return (
                    <button
                      key={user.id}
                      onClick={() => handleToggleUser(user.id)}
                      className={`flex w-full items-center gap-3 rounded-lg p-2 transition-colors border ${
                        isSelected
                          ? "bg-[#eff6ff] border-[#3b82f6]"
                          : "border-transparent hover:bg-[#f8fafc]"
                      }`}
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback
                          style={{
                            backgroundColor: getAvatarColor(user.name),
                          }}
                          className="text-xs text-white"
                        >
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-[#0f172a]">
                          {user.name}
                        </p>
                        <p className="text-xs text-[#64748b]">
                          {user.email}
                          {user.department && (
                            <span className="ml-1 text-[#94a3b8]">
                              · {user.department}
                            </span>
                          )}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#3b82f6]">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-[#64748b]">
                {searchQuery
                  ? "검색 결과가 없습니다."
                  : "초대 가능한 유저가 없습니다."}
              </div>
            )}
          </div>

          {/* 선택된 유저 수 및 초대 버튼 */}
          <div className="flex items-center justify-between border-t border-[#e2e8f0] pt-4">
            <p className="text-sm text-[#64748b]">
              {selectedUsers.size > 0
                ? `${selectedUsers.size}명 선택됨`
                : "유저를 선택하세요"}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsInviteDialogOpen(false);
                  setSelectedUsers(new Set());
                  setSearchQuery("");
                }}
              >
                취소
              </Button>
              <Button
                onClick={handleInvite}
                disabled={selectedUsers.size === 0}
                className="bg-[#3b82f6] hover:bg-[#2563eb]"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                초대
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 관리자 권한 변경 확인 다이얼로그 */}
      <Dialog
        open={roleChangeConfirm !== null}
        onOpenChange={(open) => !open && setRoleChangeConfirm(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fef3c7]">
              <ShieldAlert className="h-6 w-6 text-[#d97706]" />
            </div>
            <DialogTitle className="text-center">
              {roleChangeConfirm?.type === "promote"
                ? "관리자 권한 부여"
                : "관리자 권한 해제"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {roleChangeConfirm?.type === "promote" ? (
                <>
                  <span className="font-medium text-[#0f172a]">
                    {roleChangeConfirm?.memberName}
                  </span>
                  님에게 관리자 권한을 부여하시겠습니까?
                  <br />
                  <span className="text-xs">
                    관리자는 프로젝트 설정 변경, 멤버 관리 등 모든 권한을 가집니다.
                  </span>
                </>
              ) : (
                <>
                  <span className="font-medium text-[#0f172a]">
                    {roleChangeConfirm?.memberName}
                  </span>
                  님의 관리자 권한을 해제하시겠습니까?
                  <br />
                  <span className="text-xs">
                    {ROLE_LABELS[roleChangeConfirm?.toRole || "viewer"]} 역할로
                    변경됩니다.
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setRoleChangeConfirm(null)}>
              취소
            </Button>
            <Button
              onClick={handleConfirmRoleChange}
              className={
                roleChangeConfirm?.type === "promote"
                  ? "bg-[#3b82f6] hover:bg-[#2563eb]"
                  : "bg-[#f59e0b] hover:bg-[#d97706]"
              }
            >
              {roleChangeConfirm?.type === "promote" ? "권한 부여" : "권한 해제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
