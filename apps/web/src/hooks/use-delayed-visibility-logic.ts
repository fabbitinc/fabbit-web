import { useEffect, useState } from "react";

export function useDelayedVisibilityLogic(active: boolean, delayMs = 200) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      setIsVisible(false);
      return;
    }

    const timerId = window.setTimeout(() => {
      setIsVisible(true);
    }, delayMs);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [active, delayMs]);

  return isVisible;
}
