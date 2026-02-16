import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMappingStore } from "@/stores/onboarding";
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
import "@/pages/parts/parts-template-mapping.css";

interface LocationState {
  fileName?: string;
}

export function PartsTemplateMappingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fileName } = (location.state as LocationState | null) ?? {};

  const columnMappings = useMappingStore((s) => s.columnMappings);
  const extendedMappings = useMappingStore((s) => s.extendedMappings);
  const mappingHeaders = useMappingStore((s) => s.mappingHeaders);
  const setStep = useMappingStore((s) => s.setStep);
  const approveColumnMapping = useMappingStore((s) => s.approveColumnMapping);
  const approveExtendedMapping = useMappingStore((s) => s.approveExtendedMapping);

  const { effectiveTargetOptions } = useOntologySchema();
  const {
    relationPropertyByType,
    relationEndpointOptionsByType,
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
    handleCreateRelationPropertyMapping,
    handleRemoveExtendedMapping,
    handleRemoveRelationMapping,
    handleApproveAll,
  } = useMappingActions(relationEndpointOptionsByType);

  useEffect(() => {
    setStep(3);
  }, [setStep]);

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="dev-page-container parts-template-mapping-theme space-y-4">
        <div className="rounded-lg border bg-card px-6 py-5">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">매핑 확인</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {fileName ? `${fileName} 분석 결과를 검토하고 최종 매핑을 확정하세요.` : "분석 결과를 검토하고 최종 매핑을 확정하세요."}
          </p>
        </div>

        <MappingSummaryBar
          columnMappingCount={columnMappings.length}
          relationMappingCount={activeRelationMappings.length}
          extendedMappingCount={extendedMappings.length}
          unmappedCount={excludedCount}
          approvedCount={totalApproved}
          totalMappings={totalMappings}
          onApproveAll={handleApproveAll}
          onReset={handleResetMappings}
        />

        <section className="space-y-5 rounded-lg border bg-card p-5">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              {MAPPING_TERMS.baseMapping} ({columnMappings.length})
            </h3>
            {columnMappings.length > 0 && (
              <div className="space-y-2">
                {columnMappings.map((cm) => (
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
                    sampleData={getSampleData(Object.keys(rm.properties)[0] || "")}
                    onApprove={handleApproveRelationMapping}
                    onDismiss={handleRemoveRelationMapping}
                  />
                ))}
              </div>
            )}

            <AddRelationForm
              relationTypeOptions={selectableRelationTypeOptions}
              relationPropertyByType={relationPropertyByType}
              relationEndpointOptionsByType={relationEndpointOptionsByType}
              unmappedColumns={unmappedColumns}
              onApply={handleCreateRelationPropertyMapping}
            />
          </div>

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
                    onApprove={approveExtendedMapping}
                    onRemove={handleRemoveExtendedMapping}
                  />
                ))}
              </div>
            )}
          </div>

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
                    relationFromToOptions={mappingHeaders}
                    relationEndpointOptionsByType={relationEndpointOptionsByType}
                    onCreateBase={handleCreateColumnMapping}
                    onCreateExtended={handleCreateExtendedMapping}
                    onCreateRelation={handleCreateRelationPropertyMapping}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="flex items-center justify-end">
          <Button disabled={!hasMappings} onClick={() => navigate("/parts")}>
            최종 승인 완료
          </Button>
        </div>
      </div>
    </div>
  );
}
