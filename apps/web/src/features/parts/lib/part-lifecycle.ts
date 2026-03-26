import type { PartLifecycleState } from "@/features/parts/types/parts-model";

// 허용된 Lifecycle 전환 규칙
const ALLOWED_TRANSITIONS: Record<string, PartLifecycleState[]> = {
  ACTIVE: ["EOL", "OBSOLETE"],
  EOL: ["OBSOLETE"],
  OBSOLETE: [],
};

// Lifecycle 상태별 한글 라벨
const LIFECYCLE_LABELS: Record<string, string> = {
  ACTIVE: "활성",
  EOL: "단종 예정",
  OBSOLETE: "폐기",
};

/**
 * 현재 상태에서 허용된 Lifecycle 전환 목록을 반환한다.
 */
export function getAllowedLifecycleTransitions(
  state: PartLifecycleState | string | null,
): PartLifecycleState[] {
  if (!state) {
    return [];
  }

  return ALLOWED_TRANSITIONS[state] ?? [];
}

/**
 * Lifecycle 상태의 한글 라벨을 반환한다.
 */
export function getLifecycleLabel(state: string | null): string {
  if (!state) {
    return "";
  }

  return LIFECYCLE_LABELS[state] ?? state;
}

/**
 * Lifecycle 상태에 맞는 Badge variant를 반환한다.
 */
export function getLifecycleVariant(
  lifecycleState: string | null,
): "outline" | "neutral" | "accent" | "success" {
  if (lifecycleState === "ACTIVE") {
    return "success";
  }

  if (lifecycleState === "EOL") {
    return "accent";
  }

  if (lifecycleState === "OBSOLETE") {
    return "neutral";
  }

  return "outline";
}

/**
 * Lifecycle 상태에 맞는 Badge CSS 클래스를 반환한다.
 */
export function getLifecycleBadgeClassName(
  lifecycleState: string | null,
): string | undefined {
  if (lifecycleState === "ACTIVE") {
    return "border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success)]";
  }

  if (lifecycleState === "EOL") {
    return "border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning)]";
  }

  if (lifecycleState === "OBSOLETE") {
    return "border-[var(--status-neutral-border)] bg-[var(--status-neutral-bg)] text-muted-foreground";
  }

  return undefined;
}
