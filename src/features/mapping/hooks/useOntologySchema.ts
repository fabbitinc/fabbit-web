import { useEffect } from "react";
import { toast } from "sonner";
import { useMappingStore } from "@/stores/mapping";
import { getOntologySchema } from "@/api/ontology";
import type { TargetPropertyOption } from "@/features/mapping/types/mapping.types";

/**
 * 온톨로지 스키마 기반 타겟 옵션 관리
 * - 항상 /api/v1/ontology/schema 기반으로 옵션 구성
 */
export function useOntologySchema() {
  const ontologySchema = useMappingStore((s) => s.ontologySchema);
  const targetPropertyOptions = useMappingStore((s) => s.targetPropertyOptions);
  const setTargetPropertyOptions = useMappingStore((s) => s.setTargetPropertyOptions);
  const setOntologySchema = useMappingStore((s) => s.setOntologySchema);

  const effectiveTargetOptions = targetPropertyOptions.filter((opt) => opt.label === "Part");

  // 온톨로지 스키마 로드
  useEffect(() => {
    if (ontologySchema) return;

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
              is_merge_key: prop.is_merge_key,
            });
          }
        }
        setOntologySchema(schema);
        setTargetPropertyOptions(options);
      })
      .catch((err) => {
        console.error("Failed to load ontology schema:", err);
        toast.error("온톨로지 스키마를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      });
  }, [ontologySchema, setOntologySchema, setTargetPropertyOptions]);

  return { effectiveTargetOptions };
}
