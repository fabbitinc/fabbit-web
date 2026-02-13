import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/stores/onboardingStore";
import {
  getOntologySchema,
  confirmMapping,
  validateMapping,
  startSynthesis,
} from "@/api/onboarding";
import type {
  ColumnMappingEntry,
  RelationMappingEntry,
  TargetPropertyOption,
} from "@/features/onboarding/types/onboarding.types";
import type { MappingResultDTO } from "@/api/types/onboarding";
import { MappingSummaryBar } from "@/features/onboarding/components/mapping/MappingSummaryBar";
import { MappingCard } from "@/features/onboarding/components/mapping/MappingCard";
import { UnmappedCard } from "@/features/onboarding/components/mapping/UnmappedCard";
import { RelationMappingCard } from "@/features/onboarding/components/mapping/RelationMappingCard";

export function AIMappingPage() {
  const { t } = useTranslation(["common", "mapping"]);
  const navigate = useNavigate();
  const {
    columnMappings,
    relationMappings,
    mappingHeaders,
    mappingSampleRows,
    targetPropertyOptions,
    primaryUploadId,
    setStep,
    setTargetPropertyOptions,
    setMappingId,
    setMappings,
    approveColumnMapping,
    approveRelationMapping,
    approveAllMappings,
    dismissRelationMapping,
    resetMappings,
    getMappingResult,
    setSynthesisJob,
  } = useOnboardingStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const confirmedMappingRef = useRef<{ id: string; signature: string } | null>(null);

  useEffect(() => {
    setStep(3);
  }, [setStep]);

  // 온톨로지 스키마 로드
  useEffect(() => {
    if (targetPropertyOptions.length > 0) return;

    getOntologySchema()
      .then((schema) => {
        const options: TargetPropertyOption[] = [];
        for (const nodeLabel of schema.node_labels) {
          for (const prop of nodeLabel.properties) {
            options.push({
              label: nodeLabel.label,
              property: prop.name,
              description: prop.description,
              required: prop.required,
              data_type: prop.data_type,
            });
          }
        }
        setTargetPropertyOptions(options);
      })
      .catch((err) => {
        console.error("Failed to load ontology schema:", err);
        toast.error("온톨로지 스키마를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      });
  }, [targetPropertyOptions.length, setTargetPropertyOptions]);

  // 활성/무시 관계 매핑 분리
  const activeRelationMappings = relationMappings.filter((rm) => !rm.dismissed);
  const dismissedRelationMappings = relationMappings.filter((rm) => rm.dismissed);

  // 미매핑 컬럼: 컬럼 매핑이 없는 원본 헤더 (관계 매핑 참조 여부와 무관)
  const columnMappedCols = new Set(columnMappings.map((cm) => cm.source_column));
  const unmappedColumns = mappingHeaders.filter((h) => !columnMappedCols.has(h));

  // 승인 상태 집계 (활성 매핑만)
  const approvedColumnCount = columnMappings.filter((cm) => cm.approved).length;
  const approvedRelationCount = activeRelationMappings.filter((rm) => rm.approved).length;
  const totalMappings = columnMappings.length + activeRelationMappings.length;
  const totalApproved = approvedColumnCount + approvedRelationCount;

  // 샘플 데이터 헬퍼
  const getSampleData = (column: string) => {
    const unique = [
      ...new Set(
        mappingSampleRows
          .map((row) => row[column])
          .filter((value) => value !== null && value !== undefined && String(value).trim() !== "")
          .map((value) => String(value))
      ),
    ];
    return unique.slice(0, 3);
  };

  // 매핑이 하나라도 있는지 확인 (다음 버튼 활성화 조건)
  const hasMappings = columnMappings.length + activeRelationMappings.length > 0;

  const getRelationKey = (rm: RelationMappingEntry) =>
    [
      rm.from_label,
      rm.rel_type,
      rm.to_label,
      JSON.stringify(rm.from_columns),
      JSON.stringify(rm.to_columns),
      JSON.stringify(rm.properties),
    ].join("|");

  const buildDraftMapping = (
    nextColumns: ColumnMappingEntry[],
    nextRelations: RelationMappingEntry[],
  ): MappingResultDTO => ({
    column_mappings: nextColumns.map((cm) => ({
      source_column: cm.source_column,
      target_label: cm.target_label,
      target_property: cm.target_property,
      data_type: cm.data_type,
      confidence: cm.confidence,
      reason: cm.reason,
    })),
    relation_mappings: nextRelations
      .filter((rm) => !rm.dismissed)
      .map((rm) => ({
        from_label: rm.from_label,
        to_label: rm.to_label,
        rel_type: rm.rel_type,
        from_columns: rm.from_columns,
        to_columns: rm.to_columns,
        properties: rm.properties,
        property_types: rm.property_types,
      })),
    extended_properties: [],
  });

  const applyValidatedState = async (
    nextColumns: ColumnMappingEntry[],
    nextRelations: RelationMappingEntry[],
  ) => {
    if (!primaryUploadId) {
      toast.error("업로드 정보가 없습니다. 이전 단계를 다시 진행해주세요.");
      return false;
    }

    try {
      const validation = await validateMapping({
        upload_id: primaryUploadId,
        mapping: buildDraftMapping(nextColumns, nextRelations),
      });

      const errors = validation.errors || [];
      if (errors.length > 0) {
        toast.error(errors[0].message || "매핑 검증에 실패했습니다.");
        return false;
      }

      const warnings = validation.warnings || [];
      if (warnings.length > 0) {
        toast.warning(warnings[0].message || "매핑 검증 경고가 있습니다.");
      }

      const normalized = validation.normalized_mapping;
      const normalizedRelationMap = new Map(
        normalized.relation_mappings.map((rm) => [
          [
            rm.from_label,
            rm.rel_type,
            rm.to_label,
            JSON.stringify(rm.from_columns || {}),
            JSON.stringify(rm.to_columns || {}),
            JSON.stringify(rm.properties || {}),
          ].join("|"),
          rm,
        ]),
      );

      const finalColumns = normalized.column_mappings.map((cm, idx) => {
        const existing =
          nextColumns.find(
            (item) =>
              item.source_column === cm.source_column &&
              item.target_label === cm.target_label &&
              item.target_property === cm.target_property,
          ) ||
          columnMappings.find(
            (item) =>
              item.source_column === cm.source_column &&
              item.target_label === cm.target_label &&
              item.target_property === cm.target_property,
          );

        return {
          id: existing?.id || `cm-auto-${idx + 1}`,
          source_column: cm.source_column,
          target_label: cm.target_label,
          target_property: cm.target_property,
          data_type: cm.data_type,
          confidence: cm.confidence,
          reason: cm.reason,
          approved: existing?.approved ?? false,
        };
      });

      const finalRelations = nextRelations.map((rm) => {
        const relationKey = getRelationKey(rm);
        const normalizedRelation = normalizedRelationMap.get(relationKey);

        if (rm.dismissed) return rm;

        if (!normalizedRelation) {
          return {
            ...rm,
            dismissed: true,
            approved: false,
            dismissed_reason: rm.dismissed_reason || "missing_source_column",
          };
        }

        return {
          ...rm,
          from_columns: { ...normalizedRelation.from_columns },
          to_columns: { ...normalizedRelation.to_columns },
          properties: { ...normalizedRelation.properties },
          property_types: { ...normalizedRelation.property_types },
          dismissed: false,
          dismissed_reason: null,
        };
      });

      setMappings(finalColumns, finalRelations);
      return true;
    } catch (err) {
      console.error("Mapping validate failed:", err);
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      const errorMsg = axiosErr?.response?.data?.detail || "매핑 검증에 실패했습니다.";
      toast.error(errorMsg);
      return false;
    }
  };

  const handleRemoveColumnMapping = async (id: string) => {
    const removed = columnMappings.find((cm) => cm.id === id);
    if (!removed) return;

    const nextColumns = columnMappings.filter((cm) => cm.id !== id);
    let dismissedCount = 0;
    const nextRelations = relationMappings.map((rm) => {
      const usedInFrom = Object.values(rm.from_columns).includes(removed.source_column);
      const usedInTo = Object.values(rm.to_columns).includes(removed.source_column);
      const usedInProps = Object.keys(rm.properties).includes(removed.source_column);
      if (!usedInFrom && !usedInTo && !usedInProps) return rm;

      dismissedCount += rm.dismissed ? 0 : 1;
      return {
        ...rm,
        dismissed: true,
        approved: false,
        dismissed_reason: usedInFrom
          ? "missing_from_endpoint"
          : usedInTo
            ? "missing_to_endpoint"
            : "missing_required_rel_property",
      };
    });

    const ok = await applyValidatedState(nextColumns, nextRelations);
    if (ok && dismissedCount > 0) {
      toast.warning(`참조 컬럼이 제거되어 관계 매핑 ${dismissedCount}건이 제외되었습니다.`);
    }
  };

  const handleChangeColumnMappingTarget = (
    id: string,
    targetLabel: string,
    targetProperty: string
  ) => {
    const nextColumns = columnMappings.map((cm) =>
      cm.id === id
        ? {
            ...cm,
            target_label: targetLabel,
            target_property: targetProperty,
            approved: false,
            confidence: 100,
            reason: "사용자 수동 변경",
          }
        : cm,
    );

    let dismissedCount = 0;
    const nextRelations = relationMappings.map((rm) => {
      const isFromValid = Object.entries(rm.from_columns).every(([prop, sourceColumn]) =>
        nextColumns.some(
          (cm) =>
            cm.source_column === sourceColumn &&
            cm.target_label === rm.from_label &&
            cm.target_property === prop,
        ),
      );
      const isToValid = Object.entries(rm.to_columns).every(([prop, sourceColumn]) =>
        nextColumns.some(
          (cm) =>
            cm.source_column === sourceColumn &&
            cm.target_label === rm.to_label &&
            cm.target_property === prop,
        ),
      );

      if (isFromValid && isToValid) return rm;

      dismissedCount += rm.dismissed ? 0 : 1;
      return {
        ...rm,
        dismissed: true,
        approved: false,
        dismissed_reason: !isFromValid ? "missing_from_endpoint" : "missing_to_endpoint",
      };
    });

    void (async () => {
      const ok = await applyValidatedState(nextColumns, nextRelations);
      if (ok && dismissedCount > 0) {
        toast.warning(`참조 컬럼 대상이 변경되어 관계 매핑 ${dismissedCount}건이 제외되었습니다.`);
      }
    })();
  };

  const handleCreateColumnMapping = (
    sourceColumn: string,
    targetLabel: string,
    targetProperty: string
  ) => {
    const nextColumns = [
      ...columnMappings,
      {
        id: `cm-${Date.now()}`,
        source_column: sourceColumn,
        target_label: targetLabel,
        target_property: targetProperty,
        data_type: "string",
        confidence: 100,
        reason: "사용자 수동 매핑",
        approved: false,
      },
    ];

    void (async () => {
      const ok = await applyValidatedState(nextColumns, relationMappings);
      if (!ok) return;

      const dismissedCount = relationMappings.filter((rm) => rm.dismissed).length;
      if (dismissedCount > 0) {
        toast.warning(`매핑 추가 후에도 제외된 관계 매핑 ${dismissedCount}건이 있습니다.`);
      }
    })();
  };

  const handleRestoreRelationMapping = async (id: string) => {
    const target = relationMappings.find((rm) => rm.id === id);
    if (!target) return;

    const nextRelations = relationMappings.map((rm) =>
      rm.id === id ? { ...rm, dismissed: false, approved: false, dismissed_reason: null } : rm,
    );

    const ok = await applyValidatedState(columnMappings, nextRelations);
    if (!ok) {
      const fallbackReason = "missing_source_column";
      const revertedRelations = relationMappings.map((rm) =>
        rm.id === id ? { ...rm, dismissed: true, approved: false, dismissed_reason: fallbackReason } : rm,
      );
      setMappings(columnMappings, revertedRelations);
      toast.error("참조 컬럼 매핑이 유효하지 않아 관계 매핑을 복원할 수 없습니다.");
    }
  };

  const handleNext = async () => {
    if (!primaryUploadId) {
      toast.error("업로드 정보가 없습니다. 이전 단계를 다시 진행해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const draftMapping = getMappingResult();
      const validation = await validateMapping({
        upload_id: primaryUploadId,
        mapping: draftMapping,
      });
      const validationErrors = validation.errors || [];
      const validationWarnings = validation.warnings || [];

      if (validationErrors.length > 0) {
        toast.error(validationErrors[0].message || "매핑 검증에 실패했습니다.");
        return;
      }

      if (validationWarnings.length > 0) {
        toast.warning(validationWarnings[0].message || "매핑 검증 경고가 있습니다.");
      }

      const normalizedMapping = validation.normalized_mapping || draftMapping;

      // 1. 매핑 확정 (같은 매핑으로 재시도 시 재사용)
      const mappingSignature = JSON.stringify(normalizedMapping);
      let confirmedMappingId =
        confirmedMappingRef.current?.signature === mappingSignature
          ? confirmedMappingRef.current.id
          : null;

      if (!confirmedMappingId) {
        const confirmResponse = await confirmMapping({
          upload_id: primaryUploadId,
          name: `mapping-${Date.now()}`,
          mapping: normalizedMapping,
        });
        confirmedMappingId = confirmResponse.id;
        confirmedMappingRef.current = {
          id: confirmResponse.id,
          signature: mappingSignature,
        };
        setMappingId(confirmResponse.id);
      }

      // 2. 합성 작업 시작
      const synthesisJob = await startSynthesis({
        mapping_id: confirmedMappingId,
      });
      setSynthesisJob(synthesisJob);

      navigate("/onboarding/explore");
    } catch (err) {
      console.error("Mapping confirmation or synthesis failed:", err);
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      const errorMsg =
        axiosErr?.response?.data?.detail || "매핑 확정에 실패했습니다";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            {t("mapping:title")}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {t("mapping:description")}
          </p>
        </div>

        {/* 메인 영역 */}
        <div className="space-y-4 px-8 lg:px-10">
          <MappingSummaryBar
            columnMappingCount={columnMappings.length}
            relationMappingCount={activeRelationMappings.length}
            unmappedCount={unmappedColumns.length}
            approvedCount={totalApproved}
            totalMappings={totalMappings}
            onApproveAll={approveAllMappings}
            onReset={resetMappings}
          />

          {/* 스크롤 영역 */}
          <div className="max-h-[560px] overflow-y-auto pr-1">
            <div className="space-y-6 pb-2">

              {/* -- 컬럼 매핑 섹션 -- */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  {t("mapping:columnMapping")} ({columnMappings.length})
                </h3>

                {columnMappings.length > 0 && (
                  <div className="space-y-2">
                    {columnMappings.map((cm) => (
                      <MappingCard
                        key={cm.id}
                        mapping={cm}
                        sampleData={getSampleData(cm.source_column)}
                        targetOptions={targetPropertyOptions}
                        onApprove={approveColumnMapping}
                        onChangeTarget={handleChangeColumnMappingTarget}
                        onRemove={handleRemoveColumnMapping}
                      />
                    ))}
                  </div>
                )}

                {/* 미매핑 (컬럼 매핑 하위) */}
                {unmappedColumns.length > 0 && (
                  <div className="ml-3 space-y-2 border-l-2 border-dashed border-gray-200 pl-3">
                    <h4 className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                      {t("mapping:excluded")} ({unmappedColumns.length})
                    </h4>
                    <div className="space-y-2">
                      {unmappedColumns.map((col) => (
                        <UnmappedCard
                          key={col}
                          column={col}
                          sampleData={getSampleData(col)}
                          targetOptions={targetPropertyOptions}
                          onCreate={handleCreateColumnMapping}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* -- 관계 매핑 섹션 -- */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-violet-600">
                  {t("mapping:relationMapping")} ({activeRelationMappings.length})
                </h3>

                {activeRelationMappings.length > 0 && (
                  <div className="space-y-2">
                    {activeRelationMappings.map((rm) => (
                      <RelationMappingCard
                        key={rm.id}
                        mapping={rm}
                        onApprove={approveRelationMapping}
                        onDismiss={dismissRelationMapping}
                      />
                    ))}
                  </div>
                )}

                {/* 무시됨 (관계 매핑 하위) */}
                {dismissedRelationMappings.length > 0 && (
                  <div className="ml-3 space-y-2 border-l-2 border-dashed border-gray-200 pl-3">
                    <h4 className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                      {t("mapping:excluded")} ({dismissedRelationMappings.length})
                    </h4>
                    <div className="space-y-2">
                      {dismissedRelationMappings.map((rm) => (
                        <RelationMappingCard
                          key={rm.id}
                          mapping={rm}
                        onApprove={approveRelationMapping}
                        onDismiss={dismissRelationMapping}
                          onRestore={handleRestoreRelationMapping}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

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
            {t("common:prev")}
          </Button>
          <Button
            type="button"
            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-base font-semibold shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/30"
            disabled={!hasMappings || isSubmitting}
            onClick={handleNext}
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
    </div>
  );
}
