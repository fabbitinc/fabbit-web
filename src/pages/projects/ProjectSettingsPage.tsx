import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Layers,
  Settings,
  Users,
  Bell,
  Link2,
  AlertTriangle,
  ListTree,
  Loader2,
} from "lucide-react";
import { mockFolders } from "@/features/items/mock-data";
import type { FolderData } from "@/features/items/types";
import type { SettingsTabId, SettingsSection } from "@/features/projects/types/settings.types";
import {
  GeneralSettings,
  MembersSettings,
  NotificationsSettings,
  IntegrationsSettings,
  DangerZone,
  AttributeSettings,
} from "@/features/projects/components/settings";
import { useProject } from "@/api/hooks";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { ConfirmDialog } from "@/components/ConfirmDialog";

function findProjectById(folders: FolderData[], id: string): FolderData | null {
  for (const folder of folders) {
    if (folder.id === id && folder.type === "project") return folder;
    if (folder.children) {
      const found = findProjectById(folder.children, id);
      if (found) return found;
    }
  }
  return null;
}

const settingsSections: SettingsSection[] = [
  { id: "general", label: "일반", icon: Settings },
  { id: "attributes", label: "속성", icon: ListTree },
  { id: "members", label: "멤버", icon: Users },
  { id: "notifications", label: "알림", icon: Bell },
  { id: "integrations", label: "연동", icon: Link2 },
  { id: "danger", label: "위험 영역", icon: AlertTriangle, danger: true },
];

export function ProjectSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTabId>("general");
  const [isDirty, setIsDirty] = useState(false);

  const {
    showConfirm,
    guardedNavigate,
    confirmNavigation,
    cancelNavigation,
  } = useUnsavedChangesGuard(isDirty);

  // Mock 데이터에서 먼저 찾기
  const mockProject = findProjectById(mockFolders, id ?? "");

  // Mock에 없으면 API에서 조회
  const { data: apiProject, isLoading, isError } = useProject(mockProject ? null : (id ?? null));

  // Mock 또는 API 프로젝트 정보 통합
  const project = mockProject
    ? { id: mockProject.id, name: mockProject.name, description: mockProject.description }
    : apiProject
      ? { id: apiProject.id, name: apiProject.name, description: apiProject.description ?? undefined }
      : null;

  // 속성 탭에서 dirty 상태 변경 콜백
  const handleDirtyChange = useCallback((dirty: boolean) => {
    setIsDirty(dirty);
  }, []);

  // 탭 전환 (가드 적용)
  const handleTabChange = (tabId: SettingsTabId) => {
    if (tabId === activeTab) return;
    guardedNavigate(() => setActiveTab(tabId));
  };

  // 뒤로가기 (가드 적용)
  const handleBack = () => {
    guardedNavigate(() => navigate(`/projects/${id}`));
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#94a3b8]" />
        <span className="text-sm text-[#94a3b8]">프로젝트를 불러오는 중...</span>
      </div>
    );
  }

  if (!project || isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[#64748b]">프로젝트를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const handleDelete = () => {
    // TODO: API 연동
    console.log("프로젝트 삭제:", project.id);
    navigate("/");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralSettings project={project} />;
      case "attributes":
        return <AttributeSettings projectId={id!} onDirtyChange={handleDirtyChange} />;
      case "members":
        return <MembersSettings />;
      case "notifications":
        return <NotificationsSettings />;
      case "integrations":
        return <IntegrationsSettings />;
      case "danger":
        return (
          <DangerZone
            projectName={project.name}
            onDelete={handleDelete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-[#e2e8f0] bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748b] transition-colors hover:bg-[#f1f5f9]"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8b5cf6]">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#0f172a]">
                {project.name}
              </h1>
              <p className="text-sm text-[#64748b]">프로젝트 설정</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Settings Sidebar */}
        <div className="w-56 border-r border-[#e2e8f0] bg-[#f8fafc] p-4">
          <nav className="space-y-1">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleTabChange(section.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  activeTab === section.id
                    ? "bg-white font-medium text-[#0f172a] shadow-sm"
                    : section.danger
                      ? "text-[#dc2626] hover:bg-white hover:text-[#dc2626]"
                      : "text-[#64748b] hover:bg-white hover:text-[#0f172a]"
                }`}
              >
                <section.icon className="h-4 w-4" />
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className={activeTab === "attributes" ? "mx-auto max-w-4xl" : "mx-auto max-w-2xl"}>
            {renderContent()}
          </div>
        </div>
      </div>

      {/* 미저장 변경사항 경고 다이얼로그 */}
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={(open) => { if (!open) cancelNavigation(); }}
        title="저장하지 않은 변경사항"
        description="저장하지 않은 변경사항이 있습니다. 페이지를 떠나면 변경사항이 사라집니다."
        confirmLabel="저장하지 않고 떠나기"
        cancelLabel="계속 편집"
        variant="destructive"
        onConfirm={() => { setIsDirty(false); confirmNavigation(); }}
        onCancel={cancelNavigation}
      />
    </div>
  );
}
