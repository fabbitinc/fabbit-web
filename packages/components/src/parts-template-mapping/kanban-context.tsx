import { createContext, useContext } from "react";
import type {
  PartsTemplateMappingBoardColumnMapping,
  PartsTemplateMappingBoardRelationMapping,
  PartsTemplateMappingBoardRelationTargetInfo,
  PartsTemplateMappingBoardTargetPropertyOption,
} from "./types";

export interface PartsTemplateMappingBoardContextValue {
  effectiveTargetOptions: PartsTemplateMappingBoardTargetPropertyOption[];
  columnMappings: PartsTemplateMappingBoardColumnMapping[];
  propertyLabelByName: Record<string, string>;
  relationMappings: PartsTemplateMappingBoardRelationMapping[];
  relationPropertyByType: Record<string, string[]>;
  relationTargetInfoByType: Record<string, PartsTemplateMappingBoardRelationTargetInfo>;
  mergeKeysByLabel: Record<string, string[]>;
  onSetPartMapping: (sourceColumn: string, targetProperty: string) => void;
  onSetRelationCardMapping: (
    relType: string,
    sourceColumn: string,
    mappingType: "node" | "rel",
    property: string,
  ) => void;
  onRemoveColumnMapping: (mappingId: string) => void | Promise<void>;
  onRemoveExtendedMapping: (mappingId: string) => void;
  onRemoveRelationCardMapping: (sourceColumn: string) => void;
}

const PartsTemplateMappingBoardContext =
  createContext<PartsTemplateMappingBoardContextValue | null>(null);

export const PartsTemplateMappingBoardProvider =
  PartsTemplateMappingBoardContext.Provider;

export function usePartsTemplateMappingBoardContext() {
  const context = useContext(PartsTemplateMappingBoardContext);

  if (!context) {
    throw new Error("usePartsTemplateMappingBoardContext는 Provider 내부에서 사용해야 합니다.");
  }

  return context;
}
