export type KanbanColumnId =
  | "Part"
  | "parent_part"
  | "Supplier"
  | "Drawing"
  | "Project"
  | "unmapped";

export interface KanbanCardData {
  id: string;
  sourceColumn: string;
  targetProperty: string | null;
  confidence: number;
  approved: boolean;
  isExtended: boolean;
  isRelation: boolean;
  relType?: string;
  relNodeProperty?: string;
  relProperty?: string;
  sampleData: string[];
}

export interface KanbanColumnModel {
  id: KanbanColumnId;
  title: string;
  color: string;
  cards: KanbanCardData[];
}

export const COLUMN_TO_REL_TYPE: Record<string, string> = {
  parent_part: "CONSISTS_OF",
  Supplier: "SUPPLIED_BY",
  Drawing: "DEFINED_BY",
  Project: "HAS_ITEM",
};
