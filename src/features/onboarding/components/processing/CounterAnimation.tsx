import { useEffect, useRef, useState } from "react";

interface CounterAnimationProps {
  target: number;
  duration?: number;
  label: string;
  icon: React.ReactNode;
}

export function CounterAnimation({
  target,
  duration = 2000,
  label,
  icon,
}: CounterAnimationProps) {
  const [count, setCount] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const t = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = 1 - Math.pow(2, -10 * t);
      const current = Math.round(target * eased);

      setCount(current);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 text-center">
      <div className="flex justify-center mb-3 text-[#3b82f6]">{icon}</div>
      <div className="text-3xl font-bold text-[#0f172a]">
        {count.toLocaleString()}
      </div>
      <div className="text-sm text-[#64748b] mt-1">{label}</div>
    </div>
  );
}
