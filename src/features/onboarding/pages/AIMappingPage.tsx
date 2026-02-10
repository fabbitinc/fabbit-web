import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/stores/onboardingStore";
import {
  mockSourceColumns,
  mockTargetProperties,
} from "@/features/onboarding/mock-data/onboarding-mock";
import { MappingToolbar } from "@/features/onboarding/components/mapping/MappingToolbar";
import { SourceColumnPanel } from "@/features/onboarding/components/mapping/SourceColumnPanel";
import { TargetPropertyPanel } from "@/features/onboarding/components/mapping/TargetPropertyPanel";
import { ConnectionCanvas } from "@/features/onboarding/components/mapping/ConnectionCanvas";

export function AIMappingPage() {
  const navigate = useNavigate();
  const {
    connections,
    selectedSourceId,
    selectedTargetId,
    setStep,
    setSelectedSource,
    setSelectedTarget,
    approveAllConnections,
    removeConnection,
    resetConnections,
  } = useOnboardingStore();

  useEffect(() => {
    setStep(5);
  }, [setStep]);

  // ref 관리
  const containerRef = useRef<HTMLDivElement>(null);
  const sourceRefsMap = useMemo(() => new Map<string, HTMLElement>(), []);
  const targetRefsMap = useMemo(() => new Map<string, HTMLElement>(), []);

  // 필수 속성이 모두 매핑되었는지 확인
  const requiredTargetIds = mockTargetProperties
    .filter((p) => p.required)
    .map((p) => p.id);
  const connectedTargetIds = new Set(connections.map((c) => c.targetId));
  const allRequiredMapped = requiredTargetIds.every((id) =>
    connectedTargetIds.has(id)
  );

  const approvedCount = connections.filter((c) => c.approved).length;

  return (
    <div className="max-w-7xl w-full mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="size-5 text-[#3b82f6]" />
          <h2 className="text-xl font-bold text-[#0f172a]">
            The Bridge - AI 매핑
          </h2>
        </div>
        <p className="text-sm text-[#94a3b8]">
          AI가 원본 데이터와 표준 속성을 매핑했습니다. 확인하고 수정해 주세요.
        </p>
      </div>

      {/* 메인 영역 */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden shadow-sm">
        <MappingToolbar
          totalConnections={connections.length}
          approvedConnections={approvedCount}
          onAutoMap={resetConnections}
          onApproveAll={approveAllConnections}
          onReset={resetConnections}
        />

        {/* 3패널 레이아웃 */}
        <div ref={containerRef} className="flex relative h-[560px]">
          <SourceColumnPanel
            columns={mockSourceColumns}
            connections={connections}
            selectedSourceId={selectedSourceId}
            onSelectSource={setSelectedSource}
            itemRefs={sourceRefsMap}
          />

          {/* 중앙 빈 공간 */}
          <div className="flex-1" />

          <TargetPropertyPanel
            properties={mockTargetProperties}
            connections={connections}
            selectedTargetId={selectedTargetId}
            onSelectTarget={setSelectedTarget}
            itemRefs={targetRefsMap}
          />

          {/* SVG 연결선 오버레이 */}
          <ConnectionCanvas
            connections={connections}
            sourceRefs={sourceRefsMap}
            targetRefs={targetRefsMap}
            containerRef={containerRef}
            onRemoveConnection={removeConnection}
          />
        </div>
      </div>

      {/* 하단 네비게이션 버튼 */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => navigate("/onboarding/upload")}
        >
          <ArrowLeft className="size-4" />
          이전
        </Button>
        <Button
          disabled={!allRequiredMapped}
          onClick={() => navigate("/onboarding/processing")}
        >
          다음
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
