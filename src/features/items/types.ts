export interface ConflictData {
  id: string;
  type: "material" | "quantity" | "dimension";
  field: string;
  drawingValue: string;
  excelValue: string;
  severity: "warning" | "error";
}

export interface ItemData {
  id: string;
  partNumber: string;
  name: string;
  material?: string;
  quantity: number;
  unit?: string;
  drawingStatus?: "none" | "draft" | "approved";
  drawingThumbnail?: string;
  aiAnalyzed?: boolean;
  conflicts?: ConflictData[];
  children?: ItemData[];
}

// 트리 노드 상태 (아이템 전용)
export type TreeNodeStatus = "approved" | "draft" | "conflict" | "none";

// 통합 트리 노드 타입
export interface TreeNodeData {
  id: string;
  name: string;
  type: "project" | "folder" | "item";

  // 공통
  children?: TreeNodeData[];

  // 프로젝트 전용
  description?: string;
  lastUpdated?: string;

  // 폴더 전용
  itemCount?: number;

  // 아이템 전용
  partNumber?: string;
  status?: TreeNodeStatus;
  hasDrawing?: boolean;
}

// 기존 FolderData는 TreeNodeData의 별칭으로 유지 (호환성)
export type FolderData = TreeNodeData;

export interface ItemTreeState {
  expandedIds: Set<string>;
  selectedId: string | null;
}
