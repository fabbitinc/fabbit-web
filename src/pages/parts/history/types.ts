export type HistoryEntryType =
  | "revision" // 리비전 변경 (마일스톤)
  | "property_change" // 속성 변경
  | "bom_change" // BOM 변경
  | "drawing_change" // 도면 변경
  | "attachment_change" // 첨부 변경
  | "lifecycle_change"; // 상태 변경

export interface ChangeDetail {
  field: string;
  label: string;
  old_value: string | null;
  new_value: string | null;
}

export interface PartHistoryEntry {
  id: string;
  type: HistoryEntryType;
  revision: string | null;
  previous_revision: string | null;
  summary: string;
  details: ChangeDetail[] | null;
  user_name: string;
  created_at: string;
}
