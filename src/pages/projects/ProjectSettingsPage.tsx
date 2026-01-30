import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Layers,
  Settings,
  Users,
  Bell,
  Link2,
  AlertTriangle,
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
} from "@/features/projects/components/settings";

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
  { id: "members", label: "멤버", icon: Users },
  { id: "notifications", label: "알림", icon: Bell },
  { id: "integrations", label: "연동", icon: Link2 },
  { id: "danger", label: "위험 영역", icon: AlertTriangle, danger: true },
];

export function ProjectSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTabId>("general");

  const project = findProjectById(mockFolders, id ?? "");

  if (!project) {
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
            onClick={() => navigate(`/projects/${id}`)}
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
                onClick={() => setActiveTab(section.id)}
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
          <div className="mx-auto max-w-2xl">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}
