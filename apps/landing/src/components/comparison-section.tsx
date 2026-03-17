import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, Minus, X, Star } from "lucide-react";

type CellValue = "check" | "partial" | "none" | string;

interface ComparisonRow {
  feature: string;
  excel: CellValue;
  aiTool: CellValue;
  plm: CellValue;
  fabbit: CellValue;
}

const rows: ComparisonRow[] = [
  {
    feature: "초기 사용성",
    excel: "익숙함",
    aiTool: "보통",
    plm: "교육 필요",
    fabbit: "기존과 유사",
  },
  {
    feature: "데이터 입력",
    excel: "수동 정리",
    aiTool: "추출 후 정리",
    plm: "수동 등록",
    fabbit: "AI 자동 매핑",
  },
  {
    feature: "최신본 관리",
    excel: "none",
    aiTool: "none",
    plm: "check",
    fabbit: "check",
  },
  {
    feature: "변경관리",
    excel: "none",
    aiTool: "none",
    plm: "check",
    fabbit: "partial",
  },
  {
    feature: "마이그레이션",
    excel: "none",
    aiTool: "partial",
    plm: "자사 체계 적응",
    fabbit: "매핑 기반 도입",
  },
  {
    feature: "도입 비용",
    excel: "무료",
    aiTool: "저가",
    plm: "고가",
    fabbit: "무료 시작",
  },
];

function CellContent({ value, highlight }: { value: CellValue; highlight?: boolean }) {
  if (value === "check")
    return (
      <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${highlight ? "bg-emerald-500/20" : "bg-emerald-500/10"}`}>
        <Check size={18} className="text-emerald-400" />
      </span>
    );
  if (value === "partial")
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10">
        <Minus size={18} className="text-amber-400" />
      </span>
    );
  if (value === "none")
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10">
        <X size={18} className="text-red-400" />
      </span>
    );
  return <span className={`text-sm ${highlight ? "font-semibold text-[var(--lp-text-strong)]" : "text-[var(--lp-text-tertiary)]"}`}>{value}</span>;
}

export function ComparisonSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="comparison"
      className="section-glow-brand section-padding relative"
      ref={ref}
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[var(--lp-text-muted)]">Comparison</p>
          <h2 className="section-heading font-[Outfit,sans-serif] text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.75rem]">
            왜 <span className="text-[var(--lp-brand)]">Fabbit</span>인가요?
          </h2>
          <p className="mt-6 text-base leading-relaxed text-[var(--lp-text-tertiary)] md:text-lg">
            고객 관점에서 보면 이미 선택지는 있습니다.
            <br className="hidden md:block" />
            Fabbit은 &ldquo;넘어가기 쉬운&rdquo; 솔루션입니다.
          </p>
        </motion.div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 overflow-x-auto"
        >
          <div className="min-w-[720px]">
            <div className="overflow-hidden rounded-2xl border border-[var(--lp-border-hover)]">
              {/* Header */}
              <div className="grid grid-cols-5 bg-[var(--lp-surface)]">
                <div className="px-8 py-5 text-base font-semibold text-[var(--lp-text-tertiary)]">
                  기능
                </div>
                <div className="px-6 py-5 text-center text-sm font-semibold text-[var(--lp-text-muted)]">
                  엑셀 / NAS
                </div>
                <div className="px-6 py-5 text-center text-sm font-semibold text-[var(--lp-text-muted)]">
                  AI 추출 도구
                </div>
                <div className="px-6 py-5 text-center text-sm font-semibold text-[var(--lp-text-muted)]">
                  기존 PLM
                </div>
                <div className="relative px-6 py-5 text-center">
                  <div className="absolute inset-0 bg-gradient-to-b from-[var(--lp-brand)]/15 to-[var(--lp-brand)]/5" />
                  <div className="relative flex items-center justify-center gap-2">
                    <Star size={16} className="fill-[var(--lp-brand)] text-[var(--lp-brand)]" />
                    <span className="font-[Outfit,sans-serif] text-base font-bold text-[var(--lp-brand)]">
                      Fabbit
                    </span>
                  </div>
                </div>
              </div>

              {/* Rows */}
              {rows.map((row, i) => (
                <motion.div
                  key={row.feature}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                  className={`grid grid-cols-5 border-t border-[var(--lp-border)] ${
                    i % 2 === 0 ? "bg-[var(--lp-surface-dim)]/30" : "bg-transparent"
                  }`}
                >
                  <div className="px-8 py-5 text-[0.9375rem] font-medium text-[var(--lp-text-secondary)]">
                    {row.feature}
                  </div>
                  <div className="flex items-center justify-center px-6 py-5">
                    <CellContent value={row.excel} />
                  </div>
                  <div className="flex items-center justify-center px-6 py-5">
                    <CellContent value={row.aiTool} />
                  </div>
                  <div className="flex items-center justify-center px-6 py-5">
                    <CellContent value={row.plm} />
                  </div>
                  <div className="relative flex items-center justify-center px-6 py-5">
                    <div className="absolute inset-0 bg-[var(--lp-brand)]/[0.04]" />
                    <span className="relative">
                      <CellContent value={row.fabbit} highlight />
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Footer - position */}
              <div className="grid grid-cols-5 border-t border-[var(--lp-border-hover)] bg-[var(--lp-surface)]">
                <div className="px-8 py-5 text-sm font-semibold text-[var(--lp-text-muted)]">
                  포지션
                </div>
                <div className="px-6 py-5 text-center text-sm text-[var(--lp-text-dim)]">
                  버티는 방식
                </div>
                <div className="px-6 py-5 text-center text-sm text-[var(--lp-text-dim)]">
                  보조 도구
                </div>
                <div className="px-6 py-5 text-center text-sm text-[var(--lp-text-dim)]">
                  정식 시스템
                </div>
                <div className="relative px-6 py-5 text-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--lp-brand)]/10 to-transparent" />
                  <span className="relative text-sm font-bold text-[var(--lp-brand)]">
                    가장 쉬운 진입 제품
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom conclusion */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 text-center text-base text-[var(--lp-text-muted)]"
        >
          엑셀처럼 익숙하면서, PLM처럼 체계적인 — <span className="text-[var(--lp-text-secondary)]">그 사이의 유일한 선택지</span>
        </motion.p>
      </div>
    </section>
  );
}
