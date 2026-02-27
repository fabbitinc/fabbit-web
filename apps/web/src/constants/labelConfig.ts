import type { ChangeLabel } from "@/pages/projects/changeRequestMock";

// 색상 프리셋 — 라벨 생성 시 팔레트로 사용
export const COLOR_PRESETS = [
  { label: "파랑", value: "#3b82f6" },
  { label: "보라", value: "#8b5cf6" },
  { label: "호박", value: "#f59e0b" },
  { label: "빨강", value: "#ef4444" },
  { label: "노랑", value: "#eab308" },
  { label: "청록", value: "#14b8a6" },
  { label: "초록", value: "#22c55e" },
  { label: "분홍", value: "#ec4899" },
] as const;

// 조직 기본 레이블 — 프로젝트에 읽기 전용으로 상속
export const ORG_DEFAULT_LABELS: ChangeLabel[] = [
  { name: "설계변경", colorHex: "#3b82f6" },
  { name: "BOM변경", colorHex: "#8b5cf6" },
  { name: "재질변경", colorHex: "#f59e0b" },
  { name: "긴급", colorHex: "#ef4444" },
  { name: "리뷰필요", colorHex: "#eab308" },
  { name: "공정변경", colorHex: "#14b8a6" },
];
