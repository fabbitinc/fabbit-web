import { useEffect, useCallback, useState } from "react";

/**
 * 미저장 변경사항 보호 훅
 *
 * - 브라우저 새로고침/닫기 시 beforeunload 경고
 * - 프로그래밍 방식의 네비게이션 가드 (확인 다이얼로그용 상태 제공)
 */
export function useUnsavedChangesGuard(hasChanges: boolean) {
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const showConfirm = pendingAction !== null;

  // 브라우저 새로고침/닫기 경고
  useEffect(() => {
    if (!hasChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  // 네비게이션 가드: 변경사항이 있으면 확인 다이얼로그를 띄우고, 없으면 바로 실행
  const guardedNavigate = useCallback(
    (action: () => void) => {
      if (hasChanges) {
        setPendingAction(() => action);
      } else {
        action();
      }
    },
    [hasChanges],
  );

  // 확인 → 보류된 액션 실행
  const confirmNavigation = useCallback(() => {
    pendingAction?.();
    setPendingAction(null);
  }, [pendingAction]);

  // 취소 → 보류된 액션 해제
  const cancelNavigation = useCallback(() => {
    setPendingAction(null);
  }, []);

  return {
    showConfirm,
    guardedNavigate,
    confirmNavigation,
    cancelNavigation,
  };
}
