import type { AttributeDataType, AttributeDefinitionDto } from "./import";

// GET /api/v1/projects/:projectId/attributes
export type AttributeListResponse = AttributeDefinitionDto[];

// POST /api/v1/projects/:projectId/attributes
export interface CreateAttributeRequest {
  name: string;
  displayName: string;
  dataType: AttributeDataType;
  required?: boolean;
  options?: string[];
  description?: string;
  placeholder?: string;
}

// PUT /api/v1/projects/:projectId/attributes/:id
export interface UpdateAttributeRequest {
  displayName?: string;
  dataType?: AttributeDataType;
  required?: boolean;
  options?: string[];
  description?: string;
  placeholder?: string;
}

// POST /api/v1/projects/:projectId/attributes/batch
export interface BatchCreateAttributeRequest {
  attributes: CreateAttributeRequest[];
}

// PUT /api/v1/projects/:projectId/attributes/definitions
export interface BulkSaveDefinitionsRequest {
  definitions: BulkDefinitionItem[];
}

export interface BulkDefinitionItem {
  /** 기존 속성이면 id, 신규면 null/undefined */
  id?: string | null;
  name: string;
  displayName: string;
  dataType: AttributeDataType;
  required?: boolean;
  options?: string[] | null;
  description?: string | null;
  placeholder?: string | null;
  isActive?: boolean;
}

// POST /api/v1/items/import/bom/simple
export interface SimpleBomImportRequest {
  projectId: string;
  folderId?: string;
  fileKey: string;
  columnMappings: ColumnMapping[];
}

export interface ColumnMapping {
  /** 엑셀 컬럼 헤더 이름 */
  excelColumn: string;
  /** 매핑할 속성 ID (null이면 건너뛰기) */
  attributeId: string | null;
}

export interface SimpleBomImportResponse {
  importedCount: number;
  skippedCount: number;
  errors: string[];
}
