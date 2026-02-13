import { useEffect, useMemo, useRef, useState } from "react";
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
  ExtendedPropertyEntry,
  RelationMappingEntry,
  TargetPropertyOption,
} from "@/features/onboarding/types/onboarding.types";
import type { MappingResultDTO } from "@/api/types/onboarding";
import { MappingSummaryBar } from "@/features/onboarding/components/mapping/MappingSummaryBar";
import { MappingCard } from "@/features/onboarding/components/mapping/MappingCard";
import { UnmappedCard } from "@/features/onboarding/components/mapping/UnmappedCard";
import { RelationMappingCard } from "@/features/onboarding/components/mapping/RelationMappingCard";
import { ExtendedMappingCard } from "@/features/onboarding/components/mapping/ExtendedMappingCard";
import { MAPPING_TERMS } from "@/features/onboarding/constants/mappingTerminology";

export function AIMappingPage() {
  const { t } = useTranslation(["common", "mapping"]);
  const navigate = useNavigate();
  const {
    columnMappings,
    relationMappings,
    extendedMappings,
    mappingHeaders,
    mappingSampleRows,
    editableConstraints,
    targetPropertyOptions,
    primaryUploadId,
    setStep,
    setTargetPropertyOptions,
    setMappingId,
    setMappings,
    approveColumnMapping,
    approveExtendedMapping,
    approveAllMappings,
    resetMappings,
    getMappingResult,
    setSynthesisJob,
  } = useOnboardingStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const confirmedMappingRef = useRef<{ id: string; signature: string } | null>(null);
  const validateRequestSeqRef = useRef(0);

  const constraintTargetOptions = useMemo<TargetPropertyOption[]>(() => {
    if (!editableConstraints) return [];
    const byLabel = editableConstraints.allowed_properties_by_label || {};
    return Object.entries(byLabel).flatMap(([label, properties]) =>
      properties.map((property) => ({
        label,
        property,
        description: "",
        required: false,
        data_type: "string",
      })),
    );
  }, [editableConstraints]);

  const effectiveTargetOptions =
    constraintTargetOptions.length > 0 ? constraintTargetOptions : targetPropertyOptions;

  const relationTypeOptions = useMemo(
    () =>
      editableConstraints?.allowed_rel_types ||
      [...new Set(relationMappings.map((rm) => rm.rel_type))],
    [editableConstraints?.allowed_rel_types, relationMappings],
  );
  const relationPropertyByType = useMemo(
    () =>
      editableConstraints?.allowed_rel_properties_by_type ||
      relationMappings.reduce<Record<string, string[]>>((acc, rm) => {
        const props = Object.values(rm.properties);
        if (!acc[rm.rel_type]) acc[rm.rel_type] = [];
        props.forEach((prop) => {
          if (!acc[rm.rel_type].includes(prop)) acc[rm.rel_type].push(prop);
        });
        return acc;
      }, {}),
    [editableConstraints?.allowed_rel_properties_by_type, relationMappings],
  );

  const relationEndpointOptionsByType = useMemo(() => {
    const catalogByType = new Map(
      (editableConstraints?.relation_catalog || []).map((item) => [item.rel_type, item]),
    );
    const mergeKeysByLabel = editableConstraints?.merge_keys_by_label || {};

    return relationTypeOptions.reduce<
      Record<string, { fromColumns: string[]; toColumns: string[]; fromLabel: string; toLabel: string }>
    >((acc, relType) => {
      const catalog = catalogByType.get(relType);
      const fallback = relationMappings.find((rm) => rm.rel_type === relType);

      const fromLabel = catalog?.from_label || fallback?.from_label || "";
      const toLabel = catalog?.to_label || fallback?.to_label || "";
      const fromMergeKey = fromLabel ? mergeKeysByLabel[fromLabel]?.[0] : undefined;
      const toMergeKey = toLabel ? mergeKeysByLabel[toLabel]?.[0] : undefined;

      const fromColumns = [
        ...new Set(
          columnMappings
            .filter(
              (cm) =>
                cm.approved &&
                (!fromLabel || cm.target_label === fromLabel) &&
                (!fromMergeKey || cm.target_property === fromMergeKey),
            )
            .map((cm) => cm.source_column),
        ),
      ];

      const toColumns = [
        ...new Set(
          columnMappings
            .filter(
              (cm) =>
                cm.approved &&
                (!toLabel || cm.target_label === toLabel) &&
                (!toMergeKey || cm.target_property === toMergeKey),
            )
            .map((cm) => cm.source_column),
        ),
      ];

      acc[relType] = {
        fromColumns,
        toColumns,
        fromLabel,
        toLabel,
      };
      return acc;
    }, {});
  }, [editableConstraints, relationMappings, relationTypeOptions, columnMappings]);

  const selectableRelationTypeOptions = relationTypeOptions.filter((relType) => {
    const endpoint = relationEndpointOptionsByType[relType];
    return Boolean(endpoint && endpoint.fromColumns.length > 0 && endpoint.toColumns.length > 0);
  });
  useEffect(() => {
    setStep(3);
  }, [setStep]);

  // 온톨로지 스키마 로드
  useEffect(() => {
    if (effectiveTargetOptions.length > 0) return;

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
  }, [effectiveTargetOptions.length, setTargetPropertyOptions]);

  // 활성/제외 관계 매핑 분리
  const activeRelationMappings = relationMappings.filter((rm) => !rm.dismissed);

  // 미매핑 원본 컬럼: 기본 매핑/확장 매핑에 모두 없는 원본 헤더
  const columnMappedCols = new Set([
    ...columnMappings.map((cm) => cm.source_column),
    ...extendedMappings.map((ep) => ep.source_column),
    ...relationMappings
      .filter((rm) => !rm.dismissed)
      .flatMap((rm) => Object.keys(rm.properties)),
  ]);
  const unmappedColumns = mappingHeaders.filter((h) => !columnMappedCols.has(h));

  // 승인 상태 집계 (활성 매핑만)
  const approvedColumnCount = columnMappings.filter((cm) => cm.approved).length;
  const approvedRelationCount = activeRelationMappings.filter((rm) => rm.approved).length;
  const approvedExtendedCount = extendedMappings.filter((ep) => ep.approved).length;
  const totalMappings = columnMappings.length + activeRelationMappings.length + extendedMappings.length;
  const totalApproved = approvedColumnCount + approvedRelationCount + approvedExtendedCount;
  const excludedCount = unmappedColumns.length;

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
  const hasMappings = columnMappings.length + activeRelationMappings.length + extendedMappings.length > 0;

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
    nextExtended: ExtendedPropertyEntry[],
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
    extended_properties: nextExtended.map((ep) => ({
      source_column: ep.source_column,
      target_label: ep.target_label,
      property_name: ep.property_name,
      data_type: ep.data_type,
      confidence: ep.confidence,
      reason: ep.reason,
    })),
  });

  const applyValidatedState = async (
    nextColumns: ColumnMappingEntry[],
    nextRelations: RelationMappingEntry[],
    nextExtended: ExtendedPropertyEntry[],
  ) => {
    const requestSeq = ++validateRequestSeqRef.current;

    if (!primaryUploadId) {
      toast.error("업로드 정보가 없습니다. 이전 단계를 다시 진행해주세요.");
      return false;
    }

    try {
      const validation = await validateMapping({
        upload_id: primaryUploadId,
        mapping: buildDraftMapping(nextColumns, nextRelations, nextExtended),
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

      if (requestSeq !== validateRequestSeqRef.current) {
        return false;
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
          approved: existing?.approved ?? cm.confidence >= 90,
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

      const finalExtended = normalized.extended_properties.map((ep, idx) => {
        const existing =
          nextExtended.find(
            (item) =>
              item.source_column === ep.source_column &&
              item.target_label === ep.target_label &&
              item.property_name === ep.property_name,
          ) ||
          extendedMappings.find(
            (item) =>
              item.source_column === ep.source_column &&
              item.target_label === ep.target_label &&
              item.property_name === ep.property_name,
          );

        return {
          id: existing?.id || `ep-auto-${idx + 1}`,
          source_column: ep.source_column,
          target_label: ep.target_label,
          property_name: ep.property_name,
          data_type: ep.data_type,
          confidence: ep.confidence,
          reason: ep.reason,
          approved: existing?.approved ?? true,
        };
      });

      setMappings(finalColumns, finalRelations, finalExtended);
      return true;
    } catch (err) {
      console.error("Mapping validate failed:", err);
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      const errorMsg = axiosErr?.response?.data?.detail || "매핑 검증에 실패했습니다.";
      toast.error(errorMsg);
      return false;
    }
  };

  const handleResetMappings = () => {
    validateRequestSeqRef.current += 1;
    resetMappings();
    toast.success("초기 매핑 상태로 되돌렸습니다.");
  };

  const handleRemoveColumnMapping = async (id: string) => {
    const removed = columnMappings.find((cm) => cm.id === id);
    if (!removed) return;

    const nextColumns = columnMappings.filter((cm) => cm.id !== id);
    let dismissedCount = 0;
    const nextRelations = relationMappings.map((rm) => {
      const usedInFrom = Object.values(rm.from_columns).includes(removed.source_column);
      const usedInTo = Object.values(rm.to_columns).includes(removed.source_column);
      // 관계 속성(properties)은 기본 매핑 존재 자체가 아니라
      // 원본 헤더 존재 여부로 유효성을 판단하므로 여기서는 제외 처리하지 않음.
      if (!usedInFrom && !usedInTo) return rm;

      dismissedCount += rm.dismissed ? 0 : 1;
      return {
        ...rm,
        dismissed: true,
        approved: false,
        dismissed_reason: usedInFrom
          ? "missing_from_endpoint"
          : "missing_to_endpoint",
      };
    });

    const ok = await applyValidatedState(nextColumns, nextRelations, extendedMappings);
    if (ok && dismissedCount > 0) {
      toast.warning(`${MAPPING_TERMS.sourceColumn}이 제거되어 ${MAPPING_TERMS.relationMapping} ${dismissedCount}건이 제외되었습니다.`);
    }
  };

  const handleCreateColumnMapping = (
    sourceColumn: string,
    targetLabel: string,
    targetProperty: string
  ) => {
    const confidence = 100;
    const nextColumns = [
      ...columnMappings,
      {
        id: `cm-${Date.now()}`,
        source_column: sourceColumn,
        target_label: targetLabel,
        target_property: targetProperty,
        data_type: "string",
        confidence,
        reason: "사용자 수동 매핑",
        approved: confidence >= 90,
      },
    ];

    void (async () => {
      const ok = await applyValidatedState(nextColumns, relationMappings, extendedMappings);
      if (!ok) return;

      const dismissedCount = relationMappings.filter((rm) => rm.dismissed).length;
      if (dismissedCount > 0) {
        toast.warning(`${MAPPING_TERMS.baseMapping} 추가 후에도 제외된 ${MAPPING_TERMS.relationMapping} ${dismissedCount}건이 있습니다.`);
      }
    })();
  };

  const handleApproveRelationMapping = async (id: string) => {
    const target = relationMappings.find((rm) => rm.id === id);
    if (!target || target.dismissed) return;

    const missingFrom = Object.entries(target.from_columns)
      .filter(([prop, sourceColumn]) =>
        !columnMappings.some(
          (cm) =>
            cm.source_column === sourceColumn &&
            cm.target_label === target.from_label &&
            cm.target_property === prop,
        ),
      )
      .map(([, sourceColumn]) => sourceColumn);

    const missingTo = Object.entries(target.to_columns)
      .filter(([prop, sourceColumn]) =>
        !columnMappings.some(
          (cm) =>
            cm.source_column === sourceColumn &&
            cm.target_label === target.to_label &&
            cm.target_property === prop,
        ),
      )
      .map(([, sourceColumn]) => sourceColumn);

    const missingEndpointColumns = [...new Set([...missingFrom, ...missingTo])];

    if (missingEndpointColumns.length > 0) {
      const mappedAsExtended = missingEndpointColumns.filter((col) =>
        extendedMappings.some((ep) => ep.source_column === col),
      );
      if (mappedAsExtended.length > 0) {
        toast.warning(
          <span>
            {MAPPING_TERMS.relationMapping}의 연결 기준은 {MAPPING_TERMS.baseMapping}에 있어야 합니다. {MAPPING_TERMS.extendedMapping}에만 있는 {MAPPING_TERMS.sourceColumn}:{" "}
            <strong>{mappedAsExtended.join(", ")}</strong>
          </span>,
        );
      } else {
        toast.warning(
          <span>
            {MAPPING_TERMS.relationMapping} 할당에 필요한 연결 기준이 없습니다. 누락된 {MAPPING_TERMS.sourceColumn}:{" "}
            <strong>{missingEndpointColumns.join(", ")}</strong>
          </span>,
        );
      }
      return;
    }

    const nextRelations = relationMappings.map((rm) =>
      rm.id === id ? { ...rm, approved: true, dismissed: false, dismissed_reason: null } : rm,
    );
    await applyValidatedState(columnMappings, nextRelations, extendedMappings);
  };

  const toExtendedPropertyName = (sourceColumn: string) => {
    const hash = Array.from(sourceColumn).reduce(
      (acc, ch) => ((acc * 31 + ch.charCodeAt(0)) >>> 0),
      7,
    );
    const normalizeName = sourceColumn
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    return `_ext_${normalizeName || `col_${hash.toString(36)}`}`;
  };

  const handleCreateExtendedMapping = (
    sourceColumn: string,
    targetLabel: string,
    propertyName?: string,
  ) => {
    const nextPropertyName =
      propertyName && propertyName.startsWith("_ext_")
        ? propertyName
        : toExtendedPropertyName(sourceColumn);

    const nextExtended = [
      ...extendedMappings,
      {
        id: `ep-${Date.now()}`,
        source_column: sourceColumn,
        target_label: targetLabel,
        property_name: nextPropertyName,
        data_type: "string",
        confidence: 100,
        reason: "사용자 확장 속성 추가",
        approved: true,
      },
    ];

    void applyValidatedState(columnMappings, relationMappings, nextExtended);
  };

  const handleCreateRelationPropertyMapping = (
    sourceColumn: string,
    relType: string,
    fromSourceColumn: string,
    toSourceColumn: string,
    relationProperty: string,
  ) => {
    const endpointOptions = relationEndpointOptionsByType[relType];
    if (endpointOptions) {
      const fromAllowed = endpointOptions.fromColumns.includes(fromSourceColumn);
      const toAllowed = endpointOptions.toColumns.includes(toSourceColumn);
      if (!fromAllowed || !toAllowed) {
        toast.warning("선택한 관계 타입에 맞는 연결 기준 컬럼(할당됨)만 선택할 수 있습니다.");
        return;
      }
    }

    if (!editableConstraints) {
      toast.error("관계 속성 제약 정보를 찾을 수 없습니다.");
      return;
    }

    const relationCatalog = editableConstraints.relation_catalog || [];
    const relationDef = relationCatalog.find((item) => item.rel_type === relType);
    if (!relationDef) {
      toast.error("선택한 관계 타입의 정의를 찾을 수 없습니다.");
      return;
    }

    const mergeKeysByLabel = editableConstraints.merge_keys_by_label || {};
    const fromMergeKey = mergeKeysByLabel[relationDef.from_label]?.[0];
    const toMergeKey = mergeKeysByLabel[relationDef.to_label]?.[0];

    if (!fromMergeKey || !toMergeKey) {
      toast.error("관계 엔드포인트 머지키 정보가 없어 적용할 수 없습니다.");
      return;
    }

    const relationPropertyCatalog = editableConstraints.relation_property_catalog || [];
    const relationPropertyDef = relationPropertyCatalog.find(
      (item) => item.rel_type === relType && item.property === relationProperty,
    );
    const propertyType = relationPropertyDef?.data_type || "string";

    const fromColumns = { [fromMergeKey]: fromSourceColumn };
    const toColumns = { [toMergeKey]: toSourceColumn };

    const existingIndex = relationMappings.findIndex(
      (rm) =>
        rm.rel_type === relType &&
        rm.from_label === relationDef.from_label &&
        rm.to_label === relationDef.to_label &&
        JSON.stringify(rm.from_columns) === JSON.stringify(fromColumns) &&
        JSON.stringify(rm.to_columns) === JSON.stringify(toColumns),
    );

    const existingRelation = existingIndex >= 0 ? relationMappings[existingIndex] : null;
    if (existingRelation) {
      const sameFrom = Object.values(existingRelation.from_columns)[0] === fromSourceColumn;
      const sameTo = Object.values(existingRelation.to_columns)[0] === toSourceColumn;
      const prevProp = existingRelation.properties[sourceColumn];
      if (sameFrom && sameTo && prevProp === relationProperty) {
        toast.info("이미 동일한 관계 속성 매핑이 적용되어 있습니다.");
        return;
      }
      if (prevProp && prevProp !== relationProperty) {
        toast.warning(`관계 속성 매핑이 변경되었습니다: ${sourceColumn} (${prevProp} -> ${relationProperty})`);
      }
    }

    const nextRelations =
      existingIndex >= 0
        ? relationMappings.map((rm, idx) =>
            idx === existingIndex
              ? {
                  ...rm,
                  dismissed: false,
                  dismissed_reason: null,
                  approved: false,
                  properties: {
                    ...rm.properties,
                    [sourceColumn]: relationProperty,
                  },
                  property_types: {
                    ...rm.property_types,
                    [relationProperty]: propertyType,
                  },
                }
              : rm,
          )
        : [
            ...relationMappings,
            {
              id: `rm-${Date.now()}`,
              from_label: relationDef.from_label,
              to_label: relationDef.to_label,
              rel_type: relType,
              from_columns: fromColumns,
              to_columns: toColumns,
              properties: {
                [sourceColumn]: relationProperty,
              },
              property_types: {
                [relationProperty]: propertyType,
              },
              approved: false,
              dismissed: false,
              dismissed_reason: null,
            },
          ];

    void applyValidatedState(columnMappings, nextRelations, extendedMappings);
  };

  const handleRemoveExtendedMapping = (id: string) => {
    const nextExtended = extendedMappings.filter((ep) => ep.id !== id);
    void applyValidatedState(columnMappings, relationMappings, nextExtended);
  };

  const handleRemoveRelationMapping = (id: string) => {
    const nextRelations = relationMappings.filter((rm) => rm.id !== id);
    void applyValidatedState(columnMappings, nextRelations, extendedMappings);
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
          columnMappingCount={columnMappings.length}
          relationMappingCount={activeRelationMappings.length}
          extendedMappingCount={extendedMappings.length}
          unmappedCount={excludedCount}
          approvedCount={totalApproved}
          totalMappings={totalMappings}
          onApproveAll={approveAllMappings}
          onReset={handleResetMappings}
        />

          <section className="space-y-5 pb-2">

              {/* -- 기본 매핑 섹션 -- */}
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
                        onApprove={handleApproveRelationMapping}
                        onDismiss={handleRemoveRelationMapping}
                      />
                    ))}
                  </div>
                )}

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
                        onApprove={approveExtendedMapping}
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
  );
}
