import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useMappingStore } from "@/stores/onboarding";
import { getOntologySchema } from "@/api/onboarding";
import type { TargetPropertyOption } from "@/features/onboarding/types/onboarding.types";

/**
 * 온톨로지 스키마 기반 타겟 옵션 관리
 * - editableConstraints가 있으면 allowed_part_properties 기반 옵션 사용
 * - 없으면 API에서 스키마 로드
 */
export function useOntologySchema() {
  const editableConstraints = useMappingStore((s) => s.editableConstraints);
  const targetPropertyOptions = useMappingStore((s) => s.targetPropertyOptions);
  const setTargetPropertyOptions = useMappingStore((s) => s.setTargetPropertyOptions);

  // 제약 기반 옵션: allowed_part_properties (플랫 배열 → Part 라벨 고정)
  const constraintTargetOptions = useMemo<TargetPropertyOption[]>(() => {
    if (!editableConstraints) return [];
    const properties = editableConstraints.allowed_part_properties || [];
    return properties.map((property) => ({
      label: "Part",
      property,
      description: "",
      required: false,
      data_type: "string",
    }));
  }, [editableConstraints]);

  const effectiveTargetOptions =
    constraintTargetOptions.length > 0 ? constraintTargetOptions : targetPropertyOptions;

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

  return { effectiveTargetOptions };
}
