import type { PropertyMetaResponseOptionMode } from "@/api/generated/orval/model/propertyMetaResponseOptionMode";
import type { PropertyMetaResponsePartSystemPropertyKind } from "@/api/generated/orval/model/propertyMetaResponsePartSystemPropertyKind";
import type { PropertyMetaResponseValueType } from "@/api/generated/orval/model/propertyMetaResponseValueType";

export type PropertyValueType = PropertyMetaResponseValueType;
export type PropertyOptionMode = PropertyMetaResponseOptionMode;
export type PropertyOwnerType = string;
export type PartSystemPropertyKind = PropertyMetaResponsePartSystemPropertyKind;

export interface PropertyOptionModel {
  value: string;
  label: string;
  displayOrder: number;
  active: boolean;
}

export interface PropertyMetaModel {
  activeConfigurable: boolean;
  definitionId: string | null;
  ownerType: PropertyOwnerType;
  propertyKey: string;
  system: boolean;
  partSystemPropertyKind: PartSystemPropertyKind | null;
  columnName: string | null;
  displayName: string;
  description: string | null;
  valueType: PropertyValueType;
  optionMode: PropertyOptionMode | null;
  options: PropertyOptionModel[];
  displayOrder: number;
  required: boolean;
  active: boolean;
}
