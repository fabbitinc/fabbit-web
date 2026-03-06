import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  confirmTemplateMapping,
  updateTemplateMapping,
  validateTemplateMapping,
} from "@/features/part-template-mapping/api/part-template-mapping.api";
import { partTemplateMappingKeys } from "@/features/part-template-mapping/api/part-template-mapping.queries";
import { extractTemplateMappingError } from "@/features/part-template-mapping/lib/template-mapping-utils";
import { usePartTemplateMappingStore } from "@/features/part-template-mapping/stores/template-mapping-store";

interface SaveTemplateMappingActionInput {
  mode: "existing" | "new";
  uploadId: string;
  mappingId?: string;
  mappingName?: string;
}

export function useSaveTemplateMappingAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["part-template-mapping", "save-template-mapping-action"],
    mutationFn: async ({ mode, uploadId, mappingId, mappingName }: SaveTemplateMappingActionInput) => {
      const mappingStore = usePartTemplateMappingStore.getState();
      const draftMapping = mappingStore.getMappingDefinition();
      const validation = await validateTemplateMapping({
        file_id: uploadId,
        mapping: {
          property_mappings: draftMapping.propertyMappings.map((mapping) => ({
            source_column: mapping.sourceColumn,
            target_property: mapping.targetProperty,
            data_type: mapping.dataType,
            confidence: mapping.confidence,
            reason: mapping.reason,
            is_extended: mapping.isExtended,
          })),
          relation_mappings: draftMapping.relationMappings.map((mapping) => ({
            rel_type: mapping.relType,
            target_label: mapping.targetLabel,
            node_columns: mapping.nodeColumns,
            rel_columns: mapping.relColumns,
            rel_column_types: mapping.relColumnTypes,
            confidence: mapping.confidence,
            reason: mapping.reason,
          })),
        },
      });

      const blockingError = validation.errors.find((issue) => issue.severity === "error");
      if (blockingError) {
        throw new Error(blockingError.message);
      }

      const normalizedMapping = validation.normalizedMapping;
      const request = {
        file_id: uploadId,
        mapping: {
          property_mappings: normalizedMapping.propertyMappings.map((mapping) => ({
            source_column: mapping.sourceColumn,
            target_property: mapping.targetProperty,
            data_type: mapping.dataType,
            confidence: mapping.confidence,
            reason: mapping.reason,
            is_extended: mapping.isExtended,
          })),
          relation_mappings: normalizedMapping.relationMappings.map((mapping) => ({
            rel_type: mapping.relType,
            target_label: mapping.targetLabel,
            node_columns: mapping.nodeColumns,
            rel_columns: mapping.relColumns,
            rel_column_types: mapping.relColumnTypes,
            confidence: mapping.confidence,
            reason: mapping.reason,
          })),
        },
      };

      if (mode === "existing") {
        if (!mappingId) {
          throw new Error("업데이트할 매핑을 선택해주세요.");
        }

        return updateTemplateMapping(mappingId, request);
      }

      if (!mappingName?.trim()) {
        throw new Error("매핑 이름을 입력해주세요.");
      }

      return confirmTemplateMapping({
        ...request,
        name: mappingName.trim(),
      });
    },
    onSuccess: async (mappingRecord, variables) => {
      usePartTemplateMappingStore.getState().setMappingId(mappingRecord.id);
      await queryClient.invalidateQueries({ queryKey: partTemplateMappingKeys.mappingList() });
      toast.success(
        variables.mode === "existing" ? "기존 매핑을 업데이트했습니다." : "매핑을 저장했습니다.",
      );
    },
    onError: (error) => {
      toast.error(extractTemplateMappingError(error, "매핑 저장에 실패했습니다."));
    },
  });
}
