import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMappingStore, useUploadStore, useProcessingStore } from "@/stores/onboarding";
import { MappingSummaryBar } from "@/features/onboarding/components/mapping/MappingSummaryBar";
import { MappingCard } from "@/features/onboarding/components/mapping/MappingCard";
import { UnmappedCard } from "@/features/onboarding/components/mapping/UnmappedCard";
import { RelationMappingCard } from "@/features/onboarding/components/mapping/RelationMappingCard";
import { AddRelationForm } from "@/features/onboarding/components/mapping/AddRelationForm";
import { ExtendedMappingCard } from "@/features/onboarding/components/mapping/ExtendedMappingCard";
import { MAPPING_TERMS } from "@/features/onboarding/constants/mappingTerminology";
import { useOntologySchema } from "@/features/onboarding/hooks/useOntologySchema";
import { useMappingDerivedState } from "@/features/onboarding/hooks/useMappingDerivedState";
import { useMappingActions } from "@/features/onboarding/hooks/useMappingActions";
import { useMappingSubmit } from "@/features/onboarding/hooks/useMappingSubmit";

export function AIMappingPage() {
  const { t } = useTranslation(["common", "mapping"]);
  const navigate = useNavigate();

  const mappingHeaders = useMappingStore((s) => s.mappingHeaders);
  const setStep = useMappingStore((s) => s.setStep);
  const approveColumnMapping = useMappingStore((s) => s.approveColumnMapping);

  const { effectiveTargetOptions } = useOntologySchema();
  const {
    baseMappings,
    extendedMappings,
    relationPropertyByType,
    relationTargetInfoByType,
    selectableRelationTypeOptions,
    activeRelationMappings,
    unmappedColumns,
    totalMappings,
    totalApproved,
    excludedCount,
    hasMappings,
    getSampleData,
  } = useMappingDerivedState();

  const {
    handleResetMappings,
    handleRemoveColumnMapping,
    handleCreateColumnMapping,
    handleApproveRelationMapping,
    handleCreateExtendedMapping,
    handleCreateRelationMapping,
    handleRemoveExtendedMapping,
    handleRemoveRelationMapping,
    handleApproveAll,
  } = useMappingActions(relationTargetInfoByType);
  const { isSubmitting, handleSubmit } = useMappingSubmit();

  useEffect(() => {
    setStep(3);
  }, [setStep]);

  return (
    <div className="w-full max-w-[960px] space-y-4">

      {/* 상단 헤더 */}
      <div className="px-8 pb-2 pt-6 text-center lg:px-10">
          <div className="mb-3 flex justify-center">
            <Sparkles className="size-8 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-3xl">
            {t("mapping:title")}
          </h1>
          <p className="mt-5 text-xl font-semibold leading-tight text-gray-500 md:text-xl">
            {t("mapping:description")}
          </p>
        </div>

      {/* 메인 영역 */}
      <div className="space-y-4 px-8 lg:px-10">
        <MappingSummaryBar
          columnMappingCount={baseMappings.length}
          relationMappingCount={activeRelationMappings.length}
          extendedMappingCount={extendedMappings.length}
          unmappedCount={excludedCount}
          approvedCount={totalApproved}
          totalMappings={totalMappings}
          onApproveAll={handleApproveAll}
          onReset={handleResetMappings}
        />

          <section className="space-y-5 pb-2">

              {/* -- 기본 매핑 섹션 -- */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  {MAPPING_TERMS.baseMapping} ({baseMappings.length})
                </h3>

                {baseMappings.length > 0 && (
                  <div className="space-y-2">
                    {baseMappings.map((cm) => (
                      <MappingCard
                        key={cm.id}
                        mapping={cm}
                        sampleData={getSampleData(cm.source_column)}
                        onApprove={approveColumnMapping}
                        onRemove={handleRemoveColumnMapping}
                      />
                    ))}
                  </div>
                )}

              </div>

              {/* -- 관계 매핑 섹션 -- */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-violet-600">
                  {MAPPING_TERMS.relationMapping} ({activeRelationMappings.length})
                </h3>

                {activeRelationMappings.length > 0 && (
                  <div className="space-y-2">
                    {activeRelationMappings.map((rm) => (
                      <RelationMappingCard
                        key={rm.id}
                        mapping={rm}
                        sampleData={getSampleData(Object.keys(rm.rel_columns)[0] || "")}
                        onApprove={handleApproveRelationMapping}
                        onDismiss={handleRemoveRelationMapping}
                      />
                    ))}
                  </div>
                )}

                <AddRelationForm
                  relationTypeOptions={selectableRelationTypeOptions}
                  relationPropertyByType={relationPropertyByType}
                  relationTargetInfoByType={relationTargetInfoByType}
                  targetPropertyOptions={effectiveTargetOptions}
                  mappingHeaders={mappingHeaders}
                  onApply={handleCreateRelationMapping}
                />

              </div>

              {/* -- 확장 매핑 섹션 -- */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                  {MAPPING_TERMS.extendedMapping} ({extendedMappings.length})
                </h3>

                {extendedMappings.length > 0 && (
                  <div className="space-y-2">
                    {extendedMappings.map((ep) => (
                      <ExtendedMappingCard
                        key={ep.id}
                        mapping={ep}
                        sampleData={getSampleData(ep.source_column)}
                        onApprove={approveColumnMapping}
                        onRemove={handleRemoveExtendedMapping}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* -- 제외 항목 통합 섹션 -- */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-red-600">
                  제외 항목 (통합 관리) ({excludedCount})
                </h3>

                {unmappedColumns.length > 0 && (
                  <div className="space-y-2">
                    {unmappedColumns.map((col) => (
                      <UnmappedCard
                        key={col}
                        column={col}
                        sampleData={getSampleData(col)}
                        targetOptions={effectiveTargetOptions}
                        relationTypeOptions={selectableRelationTypeOptions}
                        relationPropertyByType={relationPropertyByType}
                        relationTargetInfoByType={relationTargetInfoByType}
                        targetPropertyOptions={effectiveTargetOptions}
                        onCreateBase={handleCreateColumnMapping}
                        onCreateExtended={handleCreateExtendedMapping}
                        onCreateRelation={handleCreateRelationMapping}
                      />
                    ))}
                  </div>
                )}

              </div>

          </section>
      </div>

      {/* 하단 버튼 */}
      <div className="flex items-center justify-between px-8 pb-8 pt-6 lg:px-10">
          <Button
            type="button"
            variant="outline"
            className="h-12 px-8 text-base font-semibold border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
            onClick={() => {
              if (!window.confirm("이전 단계로 돌아가면 현재 매핑 데이터가 삭제됩니다. 계속하시겠습니까?")) return;
              useUploadStore.getState().reset();
              useProcessingStore.getState().reset();
              useMappingStore.getState().reset();
              navigate("/onboarding/upload");
            }}
          >
            {t("common:prev")}
          </Button>
          <Button
            type="button"
            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-base font-semibold shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/30"
            disabled={!hasMappings || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                처리 중...
              </>
            ) : (
              t("common:next")
            )}
          </Button>
      </div>
    </div>
  );
}
