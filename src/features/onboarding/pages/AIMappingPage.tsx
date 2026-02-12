import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/stores/onboardingStore";
import {
  mockSourceColumns,
  mockTargetProperties,
} from "@/features/onboarding/mock-data/onboarding-mock";
import { MappingSummaryBar } from "@/features/onboarding/components/mapping/MappingSummaryBar";
import { MappingCard } from "@/features/onboarding/components/mapping/MappingCard";
import { UnmappedCard } from "@/features/onboarding/components/mapping/UnmappedCard";

export function AIMappingPage() {
  const navigate = useNavigate();
  const {
    connections,
    setStep,
    approveConnection,
    approveAllConnections,
    removeConnection,
    resetConnections,
    changeConnectionTarget,
    createConnection,
  } = useOnboardingStore();

  useEffect(() => {
    setStep(3);
  }, [setStep]);

  // 데이터 계산
  const connectedSourceIds = new Set(connections.map((c) => c.sourceId));
  const connectedTargetIds = new Set(connections.map((c) => c.targetId));
  const unmappedSources = mockSourceColumns.filter(
    (s) => !connectedSourceIds.has(s.id)
  );
  const availableTargets = mockTargetProperties.filter(
    (t) => !connectedTargetIds.has(t.id)
  );
  const pendingConns = connections.filter((c) => !c.approved);
  const approvedConns = connections.filter((c) => c.approved);

  // 필수 타겟 매핑 확인
  const requiredTargetIds = mockTargetProperties
    .filter((p) => p.required)
    .map((p) => p.id);
  const allRequiredMapped = requiredTargetIds.every((id) =>
    connectedTargetIds.has(id)
  );

  // 헬퍼: 소스/타겟 조회
  const getSource = (id: string) =>
    mockSourceColumns.find((s) => s.id === id)!;
  const getTarget = (id: string) =>
    mockTargetProperties.find((t) => t.id === id)!;

  return (
    <div className="relative flex w-full max-w-[960px] flex-col">
      {/* 워터마크 로고 */}
      <div className="absolute top-[-40px] left-0 flex items-center gap-1.5">
        <div className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6]">
          <svg
            className="h-3 w-3 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="text-xs text-gray-300">Fabbit</span>
      </div>

      <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-gray-200/50">
        {/* 상단 헤더 */}
        <div className="px-8 pt-10 pb-6 text-center lg:px-10">
          <div className="mb-3 flex justify-center">
            <Sparkles className="size-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            The Bridge - AI 매핑
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            AI가 원본 데이터와 표준 속성을 매핑했습니다. 확인하고 수정해 주세요.
          </p>
        </div>

        {/* 메인 영역 */}
        <div className="space-y-4 px-8 lg:px-10">
          <MappingSummaryBar
            totalSources={mockSourceColumns.length}
            mappedCount={connections.length}
            approvedCount={approvedConns.length}
            pendingCount={pendingConns.length}
            unmappedCount={unmappedSources.length}
            onApproveAll={approveAllConnections}
            onReset={resetConnections}
          />

          {/* 스크롤 영역 */}
          <div className="max-h-[560px] overflow-y-auto pr-1">
            <div className="space-y-6 pb-2">
              {/* 승인 대기 섹션 */}
              {pendingConns.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                    승인 대기 ({pendingConns.length})
                  </h3>
                  <div className="space-y-2">
                    {pendingConns.map((conn) => (
                      <MappingCard
                        key={conn.id}
                        connection={conn}
                        source={getSource(conn.sourceId)}
                        target={getTarget(conn.targetId)}
                        availableTargets={availableTargets}
                        onApprove={approveConnection}
                        onChangeTarget={changeConnectionTarget}
                        onRemove={removeConnection}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 승인됨 섹션 */}
              {approvedConns.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-green-600">
                    승인됨 ({approvedConns.length})
                  </h3>
                  <div className="space-y-2">
                    {approvedConns.map((conn) => (
                      <MappingCard
                        key={conn.id}
                        connection={conn}
                        source={getSource(conn.sourceId)}
                        target={getTarget(conn.targetId)}
                        availableTargets={availableTargets}
                        onApprove={approveConnection}
                        onChangeTarget={changeConnectionTarget}
                        onRemove={removeConnection}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 미매핑 섹션 */}
              {unmappedSources.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    미매핑 ({unmappedSources.length})
                  </h3>
                  <div className="space-y-2">
                    {unmappedSources.map((source) => (
                      <UnmappedCard
                        key={source.id}
                        source={source}
                        availableTargets={availableTargets}
                        onCreate={createConnection}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex items-center justify-between px-8 pb-8 pt-6 lg:px-10">
          <Button
            type="button"
            variant="outline"
            className="h-12 px-8 text-base font-semibold border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
            onClick={() => navigate("/onboarding/processing")}
          >
            이전
          </Button>
          <Button
            type="button"
            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-base font-semibold shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/30"
            disabled={!allRequiredMapped}
            onClick={() => navigate("/onboarding/explore")}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}
