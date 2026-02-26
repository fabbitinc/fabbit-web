import { useState, type ComponentType } from "react";
import { Settings, Users, Tag, AlertTriangle, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ChangeLabel } from "./changeRequestMock";

// ============================================================
// 타입 & Mock 데이터
// ============================================================

type SettingsTab = "general" | "members" | "labels" | "danger";

interface MockMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  joinedAt: string;
}

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

const INITIAL_MEMBERS: MockMember[] = [
  { id: "m1", name: "김설계", email: "kim@fabbit.io", role: "admin", joinedAt: "2025-01-15" },
  { id: "m2", name: "이엔지", email: "lee@fabbit.io", role: "editor", joinedAt: "2025-01-20" },
  { id: "m3", name: "박관리", email: "park@fabbit.io", role: "editor", joinedAt: "2025-02-01" },
  { id: "m4", name: "최검수", email: "choi@fabbit.io", role: "viewer", joinedAt: "2025-02-10" },
];

const INITIAL_LABELS: ChangeLabel[] = [
  { name: "설계변경", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  { name: "BOM변경", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  { name: "재질변경", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  { name: "긴급", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  { name: "리뷰필요", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  { name: "공정변경", color: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300" },
];

const COLOR_PRESETS = [
  { label: "파랑", value: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  { label: "보라", value: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  { label: "호박", value: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  { label: "빨강", value: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  { label: "노랑", value: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  { label: "청록", value: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300" },
  { label: "초록", value: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  { label: "분홍", value: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300" },
];

const ROLE_LABELS: Record<string, string> = {
  admin: "관리자",
  editor: "편집자",
  viewer: "뷰어",
};

// ============================================================
// 컴포넌트
// ============================================================

interface ProjectSettingsViewProps {
  projectName: string;
  projectDescription: string | null;
}

export function ProjectSettingsView({ projectName, projectDescription }: ProjectSettingsViewProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  // 일반 탭 상태
  const [name, setName] = useState(projectName);
  const [description, setDescription] = useState(projectDescription ?? "");

  // 멤버 탭 상태
  const [members, setMembers] = useState<MockMember[]>(INITIAL_MEMBERS);
  const [inviteEmail, setInviteEmail] = useState("");

  // 라벨 탭 상태
  const [labels, setLabels] = useState<ChangeLabel[]>(INITIAL_LABELS);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState(COLOR_PRESETS[0].value);

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
                  onClick={() => toast.success("프로젝트 설정을 저장했습니다.")}
                >
                  저장
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 멤버 */}
        {activeTab === "members" && (
          <div className="space-y-6">
            {/* 멤버 초대 */}
            <div>
              <h2 className="text-base font-semibold text-foreground">멤버 초대</h2>
              <div className="mt-3 flex gap-2">
                <Input
                  placeholder="이메일 주소"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1"
                />
                <Button
                  className="gap-1"
                  onClick={() => {
                    const trimmed = inviteEmail.trim();
                    if (!trimmed) return;
                    if (members.some((m) => m.email === trimmed)) {
                      toast.info("이미 등록된 멤버입니다.");
                      return;
                    }
                    setMembers((prev) => [
                      ...prev,
                      {
                        id: `m-${Date.now()}`,
                        name: trimmed.split("@")[0],
                        email: trimmed,
                        role: "viewer",
                        joinedAt: new Date().toISOString().slice(0, 10),
                      },
                    ]);
                    setInviteEmail("");
                    toast.success(`${trimmed}을(를) 초대했습니다.`);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  초대
                </Button>
              </div>
            </div>

            {/* 멤버 목록 */}
            <div>
              <h2 className="text-base font-semibold text-foreground">멤버 목록</h2>
              <div className="mt-3 space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-md border border-border px-4 py-3"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {member.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      {member.joinedAt}
                    </p>
                    <Select
                      value={member.role}
                      onValueChange={(value) => {
                        setMembers((prev) =>
                          prev.map((m) =>
                            m.id === member.id
                              ? { ...m, role: value as MockMember["role"] }
                              : m,
                          ),
                        );
                        toast.success(`${member.name}의 역할을 ${ROLE_LABELS[value]}(으)로 변경했습니다.`);
                      }}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">관리자</SelectItem>
                        <SelectItem value="editor">편집자</SelectItem>
                        <SelectItem value="viewer">뷰어</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        setMembers((prev) => prev.filter((m) => m.id !== member.id));
                        toast.success(`${member.name}을(를) 제거했습니다.`);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 라벨 */}
        {activeTab === "labels" && (
          <div className="space-y-6">
            {/* 라벨 추가 */}
            <div>
              <h2 className="text-base font-semibold text-foreground">새 라벨 추가</h2>
              <div className="mt-3 space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="라벨 이름"
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    className="gap-1"
                    onClick={() => {
                      const trimmed = newLabelName.trim();
                      if (!trimmed) return;
                      if (labels.some((l) => l.name === trimmed)) {
                        toast.info("이미 존재하는 라벨입니다.");
                        return;
                      }
                      setLabels((prev) => [...prev, { name: trimmed, color: newLabelColor }]);
                      setNewLabelName("");
                      toast.success(`"${trimmed}" 라벨을 추가했습니다.`);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    추가
                  </Button>
                </div>
                {/* 색상 팔레트 */}
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setNewLabelColor(preset.value)}
                      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors ${
                        newLabelColor === preset.value
                          ? "border-foreground/30 bg-muted font-medium"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <span className={`inline-block h-3 w-3 rounded-full ${preset.value.split(" ")[0]}`} />
                      {preset.label}
                    </button>
                  ))}
                </div>
                {/* 미리보기 */}
                {newLabelName.trim() && (
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">미리보기:</p>
                    <Badge variant="secondary" className={newLabelColor}>
                      {newLabelName.trim()}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* 라벨 목록 */}
            <div>
              <h2 className="text-base font-semibold text-foreground">라벨 목록</h2>
              <div className="mt-3 space-y-2">
                {labels.map((label) => (
                  <div
                    key={label.name}
                    className="flex items-center gap-3 rounded-md border border-border px-4 py-2.5"
                  >
                    <Badge variant="secondary" className={label.color}>
                      {label.name}
                    </Badge>
                    <span className="flex-1" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        setLabels((prev) => prev.filter((l) => l.name !== label.name));
                        toast.success(`"${label.name}" 라벨을 삭제했습니다.`);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                {labels.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    등록된 라벨이 없습니다.
                  </p>
                )}
              </div>
            </div>
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
