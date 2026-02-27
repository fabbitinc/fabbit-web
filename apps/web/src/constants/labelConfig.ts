import type { ChangeLabel } from "@/pages/projects/changeRequestMock";

// 색상 프리셋 — 라벨 생성 시 팔레트로 사용
export const COLOR_PRESETS = [
  { label: "파랑", value: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  { label: "보라", value: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  { label: "호박", value: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  { label: "빨강", value: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  { label: "노랑", value: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  { label: "청록", value: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300" },
  { label: "초록", value: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  { label: "분홍", value: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300" },
] as const;

// 조직 기본 레이블 — 프로젝트에 읽기 전용으로 상속
export const ORG_DEFAULT_LABELS: ChangeLabel[] = [
  { name: "설계변경", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  { name: "BOM변경", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  { name: "재질변경", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  { name: "긴급", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  { name: "리뷰필요", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  { name: "공정변경", color: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300" },
];
