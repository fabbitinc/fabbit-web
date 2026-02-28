import { useState, useMemo, useEffect, useRef, type ComponentType } from "react";
import { Settings, Users, Tag, AlertTriangle, Trash2, Plus, Loader2, Search, UserPlus, Check, Pipette } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LabelBadge } from "@fabbit/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  useUpdateProject,
  useProjectMembers,
  useAddProjectMembers,
  useRemoveProjectMembers,
  useMembers,
  useProjectLabels,
  useCreateProjectLabel,
  useDeleteProjectLabel,
} from "@/api";
import type { CreateLabelRequest } from "@/api";
import { COLOR_PRESETS } from "@/constants/labelConfig";

// ============================================================
// 타입 & Mock 데이터
// ============================================================

type SettingsTab = "general" | "members" | "labels" | "danger";

const SETTINGS_TABS: Array<{
  id: SettingsTab;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { id: "general", label: "일반", icon: Settings },
  { id: "members", label: "멤버", icon: Users },
  { id: "labels", label: "라벨", icon: Tag },
  { id: "danger", label: "위험 영역", icon: AlertTriangle },
];

// ============================================================
// 컴포넌트
// ============================================================

interface ProjectSettingsViewProps {
  projectId: string;
  projectName: string;
  projectDescription: string | null;
}

export function ProjectSettingsView({ projectId, projectName, projectDescription }: ProjectSettingsViewProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  // 일반 탭 상태
  const [name, setName] = useState(projectName);
  const [description, setDescription] = useState(projectDescription ?? "");
  const updateProject = useUpdateProject(projectId);

  // props 변경 시 로컬 상태 동기화
  useEffect(() => { setName(projectName); }, [projectName]);
  useEffect(() => { setDescription(projectDescription ?? ""); }, [projectDescription]);

  // 멤버 탭 상태
  const [addMemberOpen, setAddMemberOpen] = useState(false);

  // 라벨 탭 상태
  const { data: labelsData, isLoading: labelsLoading } = useProjectLabels(projectId);
  const deleteLabelMutation = useDeleteProjectLabel(projectId);
  const projectLabels = labelsData?.items ?? [];
  const [createLabelOpen, setCreateLabelOpen] = useState(false);

  // 위험 영역 상태
  const [archived, setArchived] = useState(false);

  return (
    <div className="flex gap-0 rounded-lg border border-border bg-card">
      {/* 사이드바 */}
      <aside className="w-56 border-r border-border bg-muted/30 p-4">
        <nav className="space-y-1">
          {SETTINGS_TABS.map((tab) => (
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

      {/* 콘텐츠 */}
      <section className="flex-1 overflow-auto p-6">
        {/* 일반 */}
        {activeTab === "general" && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-foreground">프로젝트 정보</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">프로젝트 이름</p>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">설명</p>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  disabled={updateProject.isPending || (name === projectName && description === (projectDescription ?? ""))}
                  onClick={() => updateProject.mutate({ name, description: description || null })}
                >
                  {updateProject.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  저장
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 멤버 */}
        {activeTab === "members" && (
          <MembersTab
            projectId={projectId}
            addMemberOpen={addMemberOpen}
            onAddMemberOpenChange={setAddMemberOpen}
          />
        )}

        {/* 라벨 */}
        {activeTab === "labels" && (
          <div className="space-y-6">
            {/* 헤더 + 추가 버튼 */}
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">라벨</h2>
              <Button className="gap-1" onClick={() => setCreateLabelOpen(true)}>
                <Plus className="h-4 w-4" />
                라벨 추가
              </Button>
            </div>

            {/* 프로젝트 라벨 목록 */}
            <div className="space-y-2">
              {labelsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : projectLabels.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  라벨이 없습니다.
                </p>
              ) : (
                projectLabels.map((label) => (
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
                            <p>삭제 시 모든 이슈 및 변경 요청에서 해당 라벨이 제거됩니다.</p>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                              deleteLabelMutation.mutate(label.id, {
                                onSuccess: () => toast.success(`"${label.name}" 라벨을 삭제했습니다.`),
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

            <CreateLabelDialog
              projectId={projectId}
              open={createLabelOpen}
              onOpenChange={setCreateLabelOpen}
              existingNames={new Set(projectLabels.map((l) => l.name))}
            />
          </div>
        )}

        {/* 위험 영역 */}
        {activeTab === "danger" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-foreground">프로젝트 보관</h2>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">프로젝트를 보관 처리</p>
                  <p className="text-xs text-muted-foreground">
                    보관된 프로젝트는 목록에서 숨겨지며 읽기 전용으로 전환됩니다.
                  </p>
                </div>
                <Switch
                  checked={archived}
                  onCheckedChange={(checked) => {
                    setArchived(checked);
                    toast.success(checked ? "프로젝트를 보관했습니다." : "프로젝트 보관을 해제했습니다.");
                  }}
                />
              </div>
            </div>

            <div className="rounded-lg border border-destructive p-5">
              <h2 className="text-base font-semibold text-destructive">프로젝트 삭제</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                프로젝트를 삭제하면 모든 데이터(부품 연결, 이슈, 변경 반영)가 영구적으로 제거됩니다.
                이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="mt-4">
                <Button
                  variant="destructive"
                  onClick={() => toast.error("프로젝트 삭제 기능은 아직 구현되지 않았습니다.")}
                >
                  프로젝트 삭제
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

// --- 멤버 탭 ---

function MembersTab({
  projectId,
  addMemberOpen,
  onAddMemberOpenChange,
}: {
  projectId: string;
  addMemberOpen: boolean;
  onAddMemberOpenChange: (open: boolean) => void;
}) {
  const { data: membersData, isLoading } = useProjectMembers(projectId);
  const removeMembersMutation = useRemoveProjectMembers(projectId);
  const members = membersData?.items ?? [];

  return (
    <div className="space-y-6">
      {/* 멤버 추가 */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">프로젝트 멤버</h2>
        <Button className="gap-1" onClick={() => onAddMemberOpenChange(true)}>
          <UserPlus className="h-4 w-4" />
          멤버 추가
        </Button>
      </div>

      {/* 멤버 목록 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : members.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          프로젝트에 배치된 멤버가 없습니다.
        </p>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.userId}
              className="flex items-center gap-3 rounded-md border border-border px-4 py-3"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {member.fullName.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{member.fullName}</p>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </div>
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
                    <AlertDialogTitle>멤버 제거</AlertDialogTitle>
                    <AlertDialogDescription>
                      {member.fullName}님을 프로젝트에서 제거하시겠습니까?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => removeMembersMutation.mutate([member.userId])}
                    >
                      제거
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}

      <AddMemberDialog
        projectId={projectId}
        open={addMemberOpen}
        onOpenChange={onAddMemberOpenChange}
        existingUserIds={new Set(members.map((m) => m.userId))}
      />
    </div>
  );
}

// --- 멤버 추가 다이얼로그 ---

function AddMemberDialog({
  projectId,
  open,
  onOpenChange,
  existingUserIds,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingUserIds: Set<string>;
}) {
  const { data: orgMembersData, isLoading } = useMembers({ enabled: open });
  const addMembersMutation = useAddProjectMembers(projectId);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 프로젝트에 아직 없는 조직 멤버만 표시
  const candidates = useMemo(() => {
    const all = (orgMembersData?.items ?? []).filter((m) => !existingUserIds.has(m.userId));
    if (!search.trim()) return all;
    const q = search.trim().toLowerCase();
    return all.filter(
      (m) => m.fullName.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
    );
  }, [orgMembersData?.items, existingUserIds, search]);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setSearch("");
      setSelectedIds(new Set());
    }
    onOpenChange(next);
  }

  function toggleSelect(userId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  function handleAdd() {
    if (selectedIds.size === 0) return;
    addMembersMutation.mutate([...selectedIds], {
      onSuccess: () => handleOpenChange(false),
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>멤버 추가</DialogTitle>
          <DialogDescription>
            프로젝트에 추가할 조직 멤버를 선택하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="이름 또는 이메일로 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-60 overflow-y-auto rounded-md border">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : candidates.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {search ? "검색 결과가 없습니다" : "추가할 수 있는 멤버가 없습니다"}
              </p>
            ) : (
              candidates.map((member) => (
                <label
                  key={member.userId}
                  className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50 ${
                    selectedIds.has(member.userId) ? "bg-muted" : ""
                  }`}
                >
                  <Checkbox
                    checked={selectedIds.has(member.userId)}
                    onCheckedChange={() => toggleSelect(member.userId)}
                  />
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-[10px]">
                      {member.fullName.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{member.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={addMembersMutation.isPending}>
            취소
          </Button>
          <Button
            onClick={handleAdd}
            disabled={selectedIds.size === 0 || addMembersMutation.isPending}
          >
            {addMembersMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            추가 ({selectedIds.size}명)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- 라벨 생성 다이얼로그 ---

function CreateLabelDialog({
  projectId,
  open,
  onOpenChange,
  existingNames,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingNames: Set<string>;
}) {
  const createLabelMutation = useCreateProjectLabel(projectId);
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
            프로젝트에서 사용할 새 라벨을 만드세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 미리보기 */}
          <div className="flex items-center justify-center rounded-md border border-dashed border-border bg-muted/30 py-4">
            {name.trim() ? (
              <LabelBadge label={name.trim()} colorHex={color} />
            ) : (
              <span className="text-xs text-muted-foreground">라벨 미리보기</span>
            )}
          </div>

          {/* 이름 */}
          <div className="space-y-1.5">
            <Label htmlFor="label-name">이름</Label>
            <Input
              id="label-name"
              placeholder="라벨 이름 (최대 50자)"
              maxLength={50}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            />
          </div>

          {/* 설명 */}
          <div className="space-y-1.5">
            <Label htmlFor="label-desc">설명 <span className="text-muted-foreground font-normal">(선택)</span></Label>
            <Textarea
              id="label-desc"
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
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={createLabelMutation.isPending}>
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || createLabelMutation.isPending}
          >
            {createLabelMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
