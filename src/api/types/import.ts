// POST /api/v1/items/import/bom/analyze

export interface BomAnalyzeRequest {
  fileKey: string;
}

export interface BomAnalyzeParams {
  projectId: string;
  folderId?: string;
}

// 백엔드 AttributeDataType enum
export type AttributeDataType = "STRING" | "NUMBER" | "BOOLEAN" | "DATE" | "SELECT" | "MULTI_SELECT";

export interface AttributeDefinitionDto {
  id: string;
  name: string;
  displayName: string;
  dataType: AttributeDataType;
  required: boolean;
  options: string[] | null;
  description: string | null;
  placeholder: string | null;
  sortOrder: number;
  isSystem: boolean;
  isActive: boolean;
}

export interface SuggestedAttributeResponse {
  name: string;
  displayName: string;
  dataType: AttributeDataType;
  options?: string[];
  confidence: number;
  similarAttribute?: AttributeDefinitionDto;
}

export interface BomAnalyzeResponse {
  existsAttributes: AttributeDefinitionDto[];
  suggestedAttributes: SuggestedAttributeResponse[];
  sampleRows: Record<string, string>[];
}

// POST /api/v1/items/import/bom/execute

export interface ParentItemRequest {
  partNumber?: string;
  partName?: string;
  revision?: string;
  material?: string;
  description?: string;
}

export interface BomEntryRequest {
  itemNumber: number;
  partNumber?: string;
  partName?: string;
  quantity: number;
  unit?: string;
  material?: string;
}

export interface BomExecuteRequest {
  fileUrl?: string;
  parentItem: ParentItemRequest;
  bomEntries: BomEntryRequest[];
}

export interface CreatedItemResponse {
  id: string;
  partNumber: string;
  partName: string;
  isNew: boolean;
}

export interface CreatedBomEntryResponse {
  id: string;
  childItemId: string;
  childPartNumber: string;
  quantity: number;
  unit: string;
}

export interface BomExecuteResponse {
  parentItemId: string;
  parentRevisionId: string;
  createdItems: CreatedItemResponse[];
  createdBomEntries: CreatedBomEntryResponse[];
}
