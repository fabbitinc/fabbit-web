import type { PartLifecycleState } from "@/features/parts/types/parts-model";
import type { PartWorkflowMode } from "@/features/settings/types/settings-model";
import { getAllowedLifecycleTransitions } from "@/features/parts/lib/part-lifecycle";

interface PartActionContext {
  workflowMode: PartWorkflowMode | null;
  revisionStatus: string | null;
  lifecycleState: string | null;
}

interface PartAvailableActions {
  /** DRAFT 리비전을 릴리즈할 수 있는가 */
  canRelease: boolean;
  /** DRAFT 리비전을 취소(폐기)할 수 있는가 */
  canCancel: boolean;
  /** 기존 리비전으로부터 새 DRAFT를 생성할 수 있는가 */
  canCreateDraft: boolean;
  /** DRAFT 리비전의 속성을 편집할 수 있는가 */
  canEditDraft: boolean;
  /** 허용된 Lifecycle 전환 목록 (빈 배열이면 전환 불가) */
  lifecycleTransitions: PartLifecycleState[];
  /** EC 모드일 때 비활성 사유 메시지 (null이면 DIRECT 모드) */
  disabledReason: string | null;
}

const EC_DISABLED_REASON = "변경관리를 통해 처리해야 합니다";

/**
 * Part의 현재 상태와 워크플로 모드를 기반으로 사용 가능한 액션을 계산한다.
 *
 * 이 함수는 순수 함수로, 모든 UI 컴포넌트에서 공유하는 단일 규칙 계층이다.
 */
export function getAvailablePartActions(
  ctx: PartActionContext,
): PartAvailableActions {
  const isDraft = ctx.revisionStatus === "DRAFT";
  const isReleased = ctx.revisionStatus === "RELEASED";
  const isEol = ctx.lifecycleState === "EOL";
  const isObsolete = ctx.lifecycleState === "OBSOLETE";
  const isEcMode = ctx.workflowMode === "ENGINEERING_CHANGE_REQUIRED";

  // DRAFT가 아니면 릴리즈/취소/편집 불가
  const canEditDraft = isDraft;

  // 단종 예정(EOL) 또는 폐기(OBSOLETE) Part에서는 새 DRAFT 생성 차단
  const canCreateDraft = isReleased && !isEol && !isObsolete;

  if (isEcMode) {
    // EC 모드: 릴리즈/취소/Lifecycle 전환은 비활성화
    return {
      canRelease: false,
      canCancel: false,
      canCreateDraft,
      canEditDraft,
      lifecycleTransitions: [],
      disabledReason: EC_DISABLED_REASON,
    };
  }

  // DIRECT 모드
  return {
    canRelease: isDraft,
    canCancel: isDraft,
    canCreateDraft,
    canEditDraft,
    lifecycleTransitions: getAllowedLifecycleTransitions(ctx.lifecycleState),
    disabledReason: null,
  };
}

export type { PartActionContext, PartAvailableActions };
