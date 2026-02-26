// BOM 전개 뷰 전용 타입

export type BomViewType = "multi-level" | "single-level" | "flattened";
export type BomDirection = "forward" | "reverse";

// UI용 확장 트리 노드
export interface BomDisplayNode {
  nodeKey: string; // 트리 위치 기반 고유 키 ("root.0.2")
  partId: string | null; // 클릭 시 /parts/:id 이동용
  part_number: string;
  name: string | null;
  quantity: number;
  material: string | null;
  revision: string | null;
  lifecycle_state: string | null;
  unit: string | null;
  category: string | null;
  children: BomDisplayNode[];
}

// Flattened 뷰용 합산 행
export interface BomFlatRow {
  part_number: string;
  partId: string | null;
  name: string | null;
  totalQuantity: number; // 경로 수량 곱 합산
  material: string | null;
  revision: string | null;
  lifecycle_state: string | null;
  unit: string | null;
  category: string | null;
  occurrences: number; // 출현 횟수
}
