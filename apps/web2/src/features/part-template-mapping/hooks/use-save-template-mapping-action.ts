import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  confirmTemplateMapping,
  updateTemplateMapping,
  validateTemplateMapping,
} from "@/features/part-template-mapping/api/part-template-mapping.api";
import type {
  MappingConfirmRequestDto,
  MappingValidateRequestDto,
} from "@/features/part-template-mapping/api/part-template-mapping.types";
import { partTemplateMappingKeys } from "@/features/part-template-mapping/api/part-template-mapping.queries";
import { extractTemplateMappingError } from "@/features/part-template-mapping/lib/template-mapping-utils";
import { usePartTemplateMappingStore } from "@/features/part-template-mapping/stores/template-mapping-store";
import type { MappingDefinitionModel } from "@/features/part-template-mapping/types/part-template-mapping-model";

interface SaveTemplateMappingActionInput {
  mode: "existing" | "new";
  uploadId: string;
  mappingId?: string;
  mappingName?: string;
}

type MappingPropertyRequestDto =
  NonNullable<MappingValidateRequestDto["mapping"]["property_mappings"]>[number];
type MappingRelationRequestDto =
  NonNullable<MappingValidateRequestDto["mapping"]["relation_mappings"]>[number];
type MappingPayloadDto = Pick<MappingConfirmRequestDto, "file_id" | "mapping">;

export function useSaveTemplateMappingAction() {
      const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["part-template-mapping", "save-template-mapping-action"],
    mutationFn: async ({ mode, uploadId, mappingId, mappingName }: SaveTemplateMappingActionInput) => {
      const mappingStore = usePartTemplateMappingStore.getState();
      const draftMapping = mappingStore.getMappingDefinition();
      const validation = await validateTemplateMapping(toMappingPayload(uploadId, draftMapping));

      const blockingError = validation.errors.find((issue) => issue.severity === "error");
      if (blockingError) {
        throw new Error(blockingError.message);
      }

      const normalizedMapping = validation.normalizedMapping;
      const request = toMappingPayload(uploadId, normalizedMapping);

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

function toMappingPayload(fileId: string, mapping: MappingDefinitionModel): MappingPayloadDto {
  return {
    file_id: fileId,
    mapping: {
      property_mappings: mapping.propertyMappings.map(toMappingPropertyRequest),
      relation_mappings: mapping.relationMappings.map(toMappingRelationRequest),
    },
  };
}

function toMappingPropertyRequest(
  mapping: MappingDefinitionModel["propertyMappings"][number],
): MappingPropertyRequestDto {
  return {
    source_column: mapping.sourceColumn,
    target_property: mapping.targetProperty,
    data_type: mapping.dataType as MappingPropertyRequestDto["data_type"],
    confidence: mapping.confidence,
    reason: mapping.reason,
    is_extended: mapping.isExtended,
  };
}

function toMappingRelationRequest(
  mapping: MappingDefinitionModel["relationMappings"][number],
): MappingRelationRequestDto {
  return {
    rel_type: mapping.relType as MappingRelationRequestDto["rel_type"],
    target_label: mapping.targetLabel,
    node_columns: mapping.nodeColumns,
    rel_columns: mapping.relColumns,
    rel_column_types: Object.fromEntries(
      Object.entries(mapping.relColumnTypes).map(([key, value]) => [
        key,
        value as NonNullable<MappingRelationRequestDto["rel_column_types"]>[string],
      ]),
    ),
    confidence: mapping.confidence,
    reason: mapping.reason,
  };
}
