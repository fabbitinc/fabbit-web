import { useEffect, useState } from "react";

export function useCounter(target: number, visible: boolean, duration = 1800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!visible) return;

    let raf: number;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setCount(target);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, target, duration]);

  return count;
}
