import { useState, useEffect, useCallback } from "react";
import type { MappingConnection } from "@/features/onboarding/types/onboarding.types";

interface LineData {
  id: string;
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  confidence: number;
  confidenceLevel: string;
  approved: boolean;
}

interface ConnectionCanvasProps {
  connections: MappingConnection[];
  sourceRefs: Map<string, HTMLElement>;
  targetRefs: Map<string, HTMLElement>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onRemoveConnection: (connectionId: string) => void;
}

export function ConnectionCanvas({
  connections,
  sourceRefs,
  targetRefs,
  containerRef,
  onRemoveConnection,
}: ConnectionCanvasProps) {
  const [lineData, setLineData] = useState<LineData[]>([]);
  const [hoveredLine, setHoveredLine] = useState<string | null>(null);

  const calculateLines = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const lines: LineData[] = [];

    for (const conn of connections) {
      const sourceEl = sourceRefs.get(conn.sourceId);
      const targetEl = targetRefs.get(conn.targetId);

      if (!sourceEl || !targetEl) continue;

      const sourceRect = sourceEl.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();

      // 소스 우측 중간 → 타겟 좌측 중간
      const sx = sourceRect.right - containerRect.left;
      const sy = sourceRect.top + sourceRect.height / 2 - containerRect.top;
      const ex = targetRect.left - containerRect.left;
      const ey = targetRect.top + targetRect.height / 2 - containerRect.top;

      lines.push({
        id: conn.id,
        sx,
        sy,
        ex,
        ey,
        confidence: conn.confidence,
        confidenceLevel: conn.confidenceLevel,
        approved: conn.approved,
      });
    }

    setLineData(lines);
  }, [connections, sourceRefs, targetRefs, containerRef]);

  useEffect(() => {
    const frame = requestAnimationFrame(calculateLines);
    return () => cancelAnimationFrame(frame);
  }, [calculateLines]);

  // 리사이즈 감지
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(calculateLines);
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [containerRef, calculateLines]);

  // 윈도우 리사이즈
  useEffect(() => {
    const handleResize = () => requestAnimationFrame(calculateLines);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [calculateLines]);

  // 패널 스크롤 시 재계산
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => requestAnimationFrame(calculateLines);

    // ScrollArea의 viewport를 찾아 스크롤 이벤트 리스닝
    const viewports = container.querySelectorAll(
      '[data-slot="scroll-area-viewport"]'
    );
    viewports.forEach((vp) => vp.addEventListener("scroll", handleScroll));

    return () => {
      viewports.forEach((vp) =>
        vp.removeEventListener("scroll", handleScroll)
      );
    };
  }, [containerRef, calculateLines]);

  const getStrokeColor = (line: LineData) => {
    if (line.approved && line.confidenceLevel === "high") return "#22c55e";
    if (line.confidenceLevel === "medium") return "#f59e0b";
    if (line.confidenceLevel === "low") return "#94a3b8";
    if (line.approved) return "#22c55e";
    return "#f59e0b";
  };

  const getStrokeDasharray = (line: LineData) => {
    if (line.approved && line.confidenceLevel === "high") return undefined;
    return "8 4";
  };

  const getStrokeWidth = (line: LineData) => {
    if (line.confidenceLevel === "low") return 1;
    return 2;
  };

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      {lineData.map((line) => {
        const offset = (line.ex - line.sx) / 2;
        const cx1 = line.sx + offset;
        const cx2 = line.ex - offset;
        const midX = (line.sx + line.ex) / 2;
        const midY = (line.sy + line.ey) / 2;
        const isHovered = hoveredLine === line.id;

        return (
          <g key={line.id}>
            {/* 투명한 히트 영역 (호버 감지) */}
            <path
              d={`M ${line.sx},${line.sy} C ${cx1},${line.sy} ${cx2},${line.ey} ${line.ex},${line.ey}`}
              fill="none"
              stroke="transparent"
              strokeWidth={12}
              style={{ pointerEvents: "all", cursor: "pointer" }}
              onMouseEnter={() => setHoveredLine(line.id)}
              onMouseLeave={() => setHoveredLine(null)}
            />
            {/* 실제 연결선 */}
            <path
              d={`M ${line.sx},${line.sy} C ${cx1},${line.sy} ${cx2},${line.ey} ${line.ex},${line.ey}`}
              fill="none"
              stroke={getStrokeColor(line)}
              strokeWidth={getStrokeWidth(line)}
              strokeDasharray={getStrokeDasharray(line)}
              opacity={isHovered ? 1 : 0.7}
            />
            {/* 호버 시 삭제 버튼 */}
            {isHovered && (
              <g
                style={{ pointerEvents: "all", cursor: "pointer" }}
                onClick={() => onRemoveConnection(line.id)}
                onMouseEnter={() => setHoveredLine(line.id)}
                onMouseLeave={() => setHoveredLine(null)}
              >
                <circle
                  cx={midX}
                  cy={midY}
                  r={10}
                  fill="white"
                  stroke="#ef4444"
                  strokeWidth={1.5}
                />
                <line
                  x1={midX - 4}
                  y1={midY - 4}
                  x2={midX + 4}
                  y2={midY + 4}
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <line
                  x1={midX + 4}
                  y1={midY - 4}
                  x2={midX - 4}
                  y2={midY + 4}
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
