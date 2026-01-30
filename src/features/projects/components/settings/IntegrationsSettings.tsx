import { useState } from "react";
import { Link2, Link2Off, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Integration } from "../../types/settings.types";
import { mockIntegrations } from "../../mock-data/settings-mock";

// 아이콘 컴포넌트 (SVG)
function SlackIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
    </svg>
  );
}

function JiraIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.005 1.005 0 0 0 23.013 0z" />
    </svg>
  );
}

function GitHubIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

const INTEGRATION_ICONS = {
  slack: SlackIcon,
  jira: JiraIcon,
  github: GitHubIcon,
};

const INTEGRATION_COLORS = {
  slack: "#E01E5A",
  jira: "#0052CC",
  github: "#181717",
};

export function IntegrationsSettings() {
  const [integrations, setIntegrations] =
    useState<Integration[]>(mockIntegrations);

  const handleToggleConnection = (integrationId: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === integrationId
          ? {
              ...integration,
              connected: !integration.connected,
              connectedAt: !integration.connected
                ? new Date().toISOString()
                : undefined,
            }
          : integration
      )
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-6">
      <h2 className="text-lg font-medium text-[#0f172a]">외부 도구 연동</h2>
      <p className="mt-1 text-sm text-[#64748b]">
        외부 서비스와 연동하여 프로젝트를 더 효율적으로 관리하세요.
      </p>

      <div className="mt-6 space-y-4">
        {integrations.map((integration) => {
          const Icon = INTEGRATION_ICONS[integration.type];
          const color = INTEGRATION_COLORS[integration.type];

          return (
            <div
              key={integration.id}
              className="flex items-center justify-between rounded-lg border border-[#e2e8f0] bg-white p-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon className="h-6 w-6" style={{ color }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[#0f172a]">
                      {integration.name}
                    </p>
                    {integration.connected && (
                      <span className="flex items-center gap-1 rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] font-medium text-[#16a34a]">
                        <Check className="h-3 w-3" />
                        연결됨
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-[#64748b]">
                    {integration.description}
                  </p>
                  {integration.connected && integration.connectedAt && (
                    <p className="mt-1 text-[10px] text-[#94a3b8]">
                      {formatDate(integration.connectedAt)}에 연결됨
                    </p>
                  )}
                </div>
              </div>

              <Button
                variant={integration.connected ? "outline" : "default"}
                size="sm"
                onClick={() => handleToggleConnection(integration.id)}
                className={
                  integration.connected
                    ? "border-[#e2e8f0] text-[#64748b] hover:bg-[#fef2f2] hover:text-[#ef4444] hover:border-[#fecaca]"
                    : "bg-[#3b82f6] hover:bg-[#2563eb]"
                }
              >
                {integration.connected ? (
                  <>
                    <Link2Off className="mr-2 h-4 w-4" />
                    연결 해제
                  </>
                ) : (
                  <>
                    <Link2 className="mr-2 h-4 w-4" />
                    연결
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>

      {/* 안내 메시지 */}
      <div className="mt-4 rounded-lg bg-[#f8fafc] p-4">
        <p className="text-xs text-[#64748b]">
          연동을 설정하면 프로젝트 알림을 외부 도구에서 받거나, 이슈를 자동으로
          동기화할 수 있습니다. 연동 설정에 대한 자세한 내용은{" "}
          <a href="#" className="text-[#3b82f6] hover:underline">
            도움말
          </a>
          을 참고하세요.
        </p>
      </div>
    </div>
  );
}
