import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { cloneRelationMappingModel } from "@/features/part-template-mapping/lib/template-mapping-helpers";
import type {
  ColumnMappingModel,
  MappingDefinitionModel,
  MappingPreviewModel,
  MappingSampleRowModel,
  RelationMappingModel,
} from "@/features/part-template-mapping/types/part-template-mapping-model";

const AUTO_APPROVE_CONFIDENCE_THRESHOLD = 90;

interface PartTemplateMappingStore {
  currentStep: number;
  mappingHeaders: string[];
  mappingSampleRows: MappingSampleRowModel[];
  columnMappings: ColumnMappingModel[];
  relationMappings: RelationMappingModel[];
  initialColumnMappings: ColumnMappingModel[];
  initialRelationMappings: RelationMappingModel[];
  mappingId: string | null;
  setStep: (step: number) => void;
  setMappingPreview: (preview: MappingPreviewModel) => void;
  setMappingId: (mappingId: string | null) => void;
  setMappings: (
    columnMappings: ColumnMappingModel[],
    relationMappings: RelationMappingModel[],
  ) => void;
  resetMappings: () => void;
  resetTemplateMappingState: () => void;
  getMappingDefinition: () => MappingDefinitionModel;
}

const INITIAL_PART_TEMPLATE_MAPPING_STATE = {
  currentStep: 1,
  mappingHeaders: [] as string[],
  mappingSampleRows: [] as MappingSampleRowModel[],
  columnMappings: [] as ColumnMappingModel[],
  relationMappings: [] as RelationMappingModel[],
  initialColumnMappings: [] as ColumnMappingModel[],
  initialRelationMappings: [] as RelationMappingModel[],
  mappingId: null as string | null,
};

export const usePartTemplateMappingStore = create<PartTemplateMappingStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_PART_TEMPLATE_MAPPING_STATE,
      setStep: (step) => set({ currentStep: step }),
      setMappingPreview: (preview) => {
        const columnMappings = preview.mapping.propertyMappings.map(
          (mapping, index) => ({
            id: `cm-${index + 1}`,
            sourceColumn: mapping.sourceColumn,
            targetProperty: mapping.targetProperty,
            dataType: mapping.dataType || "string",
            confidence: mapping.confidence ?? 0,
            reason: mapping.reason ?? "",
            approved:
              mapping.isExtended ||
              (mapping.confidence ?? 0) >= AUTO_APPROVE_CONFIDENCE_THRESHOLD,
            isExtended: mapping.isExtended ?? false,
          }),
        );

        const relationMappings = preview.mapping.relationMappings.map(
          (mapping, index) => ({
            id: `rm-${index + 1}`,
            relType: mapping.relType,
            targetLabel: mapping.targetLabel,
            nodeColumns: mapping.nodeColumns ?? {},
            relColumns: mapping.relColumns ?? {},
            relColumnTypes: mapping.relColumnTypes ?? {},
            confidence: mapping.confidence ?? 0,
            reason: mapping.reason ?? "",
            approved: false,
            dismissed: false,
            dismissedReason: null,
          }),
        );

        const initialColumnMappings = columnMappings.map((mapping) => ({
          ...mapping,
        }));
        const initialRelationMappings = relationMappings.map(
          cloneRelationMappingModel,
        );

        set({
          mappingHeaders: preview.headers,
          mappingSampleRows: preview.sampleRows,
          columnMappings: initialColumnMappings.map((mapping) => ({
            ...mapping,
          })),
          relationMappings: initialRelationMappings.map(
            cloneRelationMappingModel,
          ),
          initialColumnMappings,
          initialRelationMappings,
        });
      },
      setMappingId: (mappingId) => set({ mappingId }),
      setMappings: (columnMappings, relationMappings) =>
        set({
          columnMappings: columnMappings.map((mapping) => ({ ...mapping })),
          relationMappings: relationMappings.map(cloneRelationMappingModel),
        }),
      resetMappings: () =>
        set((state) => ({
          columnMappings: state.initialColumnMappings.map((mapping) => ({
            ...mapping,
          })),
          relationMappings: state.initialRelationMappings.map(
            cloneRelationMappingModel,
          ),
        })),
      resetTemplateMappingState: () => set(INITIAL_PART_TEMPLATE_MAPPING_STATE),
      getMappingDefinition: () => {
        const state = get();

        return {
          propertyMappings: state.columnMappings.map((mapping) => ({
            sourceColumn: mapping.sourceColumn,
            targetProperty: mapping.targetProperty,
            dataType: mapping.dataType,
            confidence: mapping.confidence,
            reason: mapping.reason,
            isExtended: mapping.isExtended,
          })),
          relationMappings: state.relationMappings
            .filter((mapping) => !mapping.dismissed)
            .map((mapping) => ({
              relType: mapping.relType,
              targetLabel: mapping.targetLabel,
              nodeColumns: { ...mapping.nodeColumns },
              relColumns: { ...mapping.relColumns },
              relColumnTypes: { ...mapping.relColumnTypes },
              confidence: mapping.confidence,
              reason: mapping.reason,
            })),
        };
      },
    }),
    {
      name: "web-part-template-mapping-store",
      version: 1,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        mappingHeaders: state.mappingHeaders,
        mappingSampleRows: state.mappingSampleRows,
        columnMappings: state.columnMappings,
        relationMappings: state.relationMappings,
        initialColumnMappings: state.initialColumnMappings,
        initialRelationMappings: state.initialRelationMappings,
        mappingId: state.mappingId,
      }),
    },
  ),
);
