// 공통 타입 정의

export interface ErrorResponse {
  code: string;
  message: string;
}

export type ItemType = "PART" | "ASSEMBLY";

export type ItemStatus = "ACTIVE" | "OBSOLETE";

export type RevisionStatus = "DRAFT" | "RELEASED";

export type ProjectStatus = "ACTIVE" | "ARCHIVED";
