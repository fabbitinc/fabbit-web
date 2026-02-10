import { useEffect, useRef } from "react";
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LogEntry } from "@/features/onboarding/types/onboarding.types";

interface LogStreamProps {
  logs: LogEntry[];
}

const typeConfig = {
  info: { icon: Info, color: "text-[#64748b]" },
  success: { icon: CheckCircle2, color: "text-[#22c55e]" },
  warning: { icon: AlertTriangle, color: "text-[#f59e0b]" },
  error: { icon: XCircle, color: "text-[#ef4444]" },
} as const;

export function LogStream({ logs }: LogStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = scrollRef.current?.querySelector(
      '[data-slot="scroll-area-viewport"]'
    );
    if (viewport) {
      viewport.scrollTo({ top: 99999, behavior: "smooth" });
    }
  }, [logs]);

  return (
    <div ref={scrollRef}>
      <ScrollArea className="h-[200px]">
        <div className="space-y-0.5">
          {logs.map((log) => {
            const config = typeConfig[log.type];
            const Icon = config.icon;

            return (
              <div
                key={log.id}
                className="font-mono text-xs py-1 px-3 flex items-center gap-2"
              >
                <Icon className={`size-3 shrink-0 ${config.color}`} />
                <span className="text-[#94a3b8]">[{log.timestamp}]</span>
                <span className={config.color}>{log.message}</span>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
