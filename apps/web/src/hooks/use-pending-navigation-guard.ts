import { useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

interface UsePendingNavigationGuardOptions {
  when: boolean;
  confirmMessage?: string;
}

const DEFAULT_CONFIRM_MESSAGE =
  "진행 중인 업로드가 있습니다. 페이지를 벗어나면 업로드가 중단될 수 있습니다. 이동하시겠습니까?";

export function usePendingNavigationGuard({
  when,
  confirmMessage = DEFAULT_CONFIRM_MESSAGE,
}: UsePendingNavigationGuardOptions) {
  const location = useLocation();
  const currentUrlRef = useRef(
    `${location.pathname}${location.search}${location.hash}`,
  );
  const skipNextHistoryGuardRef = useRef(false);

  const confirmNavigation = useCallback(() => {
    if (!when) {
      return true;
    }

    return window.confirm(confirmMessage);
  }, [confirmMessage, when]);

  useEffect(() => {
    currentUrlRef.current = `${location.pathname}${location.search}${location.hash}`;
  }, [location.hash, location.pathname, location.search]);

  useEffect(() => {
    if (!when) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [when]);

  useEffect(() => {
    if (!when) {
      return;
    }

    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);

    function shouldGuardHistoryNavigation(url?: string | URL | null) {
      if (!url) {
        return false;
      }

      const nextUrl = new URL(String(url), window.location.href);
      const currentUrl = new URL(window.location.href);

      return (
        nextUrl.origin === currentUrl.origin &&
        nextUrl.pathname === currentUrl.pathname &&
          nextUrl.search === currentUrl.search &&
          nextUrl.hash === currentUrl.hash
          ? false
          : true
      );
    }

    window.history.pushState = function pushState(state, unused, url) {
      if (skipNextHistoryGuardRef.current) {
        skipNextHistoryGuardRef.current = false;
        return originalPushState(state, unused, url);
      }

      if (shouldGuardHistoryNavigation(url) && !confirmNavigation()) {
        return;
      }

      return originalPushState(state, unused, url);
    };

    window.history.replaceState = function replaceState(state, unused, url) {
      if (skipNextHistoryGuardRef.current) {
        skipNextHistoryGuardRef.current = false;
        return originalReplaceState(state, unused, url);
      }

      if (shouldGuardHistoryNavigation(url) && !confirmNavigation()) {
        return;
      }

      return originalReplaceState(state, unused, url);
    };

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [confirmNavigation, when]);

  useEffect(() => {
    if (!when) {
      return;
    }

    let isRestoringLocation = false;

    function handlePopState() {
      if (isRestoringLocation) {
        isRestoringLocation = false;
        return;
      }

      if (confirmNavigation()) {
        currentUrlRef.current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        return;
      }

      isRestoringLocation = true;
      skipNextHistoryGuardRef.current = true;
      window.history.pushState(window.history.state, "", currentUrlRef.current);
      window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [confirmNavigation, when]);

  return {
    confirmNavigation,
  };
}
