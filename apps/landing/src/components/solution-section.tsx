import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Upload, Brain, Database, ArrowDown, Check } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "BOM 엑셀 업로드",
    subtitle: "헤더·샘플 분석",
    description:
      "고객이 사용하던 BOM 엑셀을 그대로 업로드합니다. 헤더(컬럼명)와 샘플 데이터 몇 행을 읽어 고객 고유의 속성 체계를 파악합니다.",
    detail: "품번, PART NO, 부품코드 — 같은 의미를 다른 이름으로 쓰는 문제를 해결합니다.",
    color: "from-[var(--lp-brand)] to-blue-400",
    accentColor: "var(--lp-brand)",
    mockup: "upload" as const,
  },
  {
    number: "02",
    icon: Brain,
    title: "AI 매핑 생성",
    subtitle: "LLM 기반 필드 연결",
    description:
      "헤더와 샘플 데이터를 LLM에 전달해 Fabbit 데이터베이스 필드(품번, 품명, 규격, 수량, 재질 등)와의 매핑 규칙을 자동 생성합니다.",
    detail: "매핑 결과는 고객이 직접 확인하고 수정할 수 있습니다.",
    color: "from-[var(--lp-accent)] to-purple-400",
    accentColor: "var(--lp-accent)",
    mockup: "mapping" as const,
  },
  {
    number: "03",
    icon: Database,
    title: "매핑 기반 적재",
    subtitle: "자동 파싱 & 저장",
    description:
      "매핑이 확정되면 이후 같은 양식의 엑셀을 올릴 때 매핑 규칙대로 자동 파싱되어 데이터베이스에 적재됩니다.",
    detail: "기존 엑셀 양식을 바꿀 필요 없이 그대로 사용할 수 있습니다.",
    color: "from-[var(--lp-gradient-from)] to-teal-400",
    accentColor: "var(--lp-gradient-from)",
    mockup: "result" as const,
  },
];

function StepMockup({ type }: { type: "upload" | "mapping" | "result" }) {
  if (type === "upload") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-[var(--lp-border-hover)] bg-[var(--lp-border)] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--lp-brand)]/10">
            <Upload size={18} className="text-[var(--lp-brand)]" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-medium text-[var(--lp-text-secondary)]">BOM_자동화기기_2026.xlsx</div>
            <div className="mt-0.5 text-[10px] text-[var(--lp-text-dim)]">348KB · 5개 시트 · 1,247행</div>
          </div>
          <div className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">업로드 완료</div>
        </div>
        <div className="rounded-lg border border-[var(--lp-border-hover)] bg-[var(--lp-surface-dim)]/50 p-3">
          <div className="text-[10px] font-medium text-[var(--lp-text-muted)] mb-2">감지된 컬럼 (8개)</div>
          <div className="flex flex-wrap gap-1.5">
            {["PART NO", "품명", "규격/사양", "수량", "재질", "단가", "비고", "도면번호"].map((col) => (
              <span key={col} className="rounded bg-[var(--lp-border)] px-2 py-0.5 text-[10px] text-[var(--lp-text-tertiary)]">
                {col}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === "mapping") {
    return (
      <div className="space-y-2">
        {[
          { from: "PART NO", to: "품번", conf: 98 },
          { from: "품명", to: "품명", conf: 99 },
          { from: "규격/사양", to: "규격", conf: 95 },
          { from: "MATERIAL", to: "재질", conf: 92 },
        ].map((row, i) => (
          <motion.div
            key={row.from}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 rounded-lg border border-[var(--lp-border)] bg-[var(--lp-surface-dim)]/50 px-3 py-2"
          >
            <span className="flex-1 text-[11px] text-[var(--lp-text-tertiary)]">{row.from}</span>
            <span className="text-[var(--lp-accent)]">→</span>
            <span className="flex-1 text-[11px] font-medium text-[var(--lp-text-strong)]">{row.to}</span>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-12 overflow-hidden rounded-full bg-[var(--lp-border-hover)]">
                <motion.div
                  className="h-full rounded-full bg-emerald-400"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${row.conf}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                  viewport={{ once: true }}
                />
              </div>
              <span className="text-[10px] text-emerald-400">{row.conf}%</span>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2">
        <Check size={14} className="text-emerald-400" />
        <span className="text-[11px] font-medium text-emerald-400">1,247행 적재 완료</span>
      </div>
      <div className="overflow-hidden rounded-lg border border-[var(--lp-border-hover)]">
        <div className="grid grid-cols-4 bg-[var(--lp-surface)] text-[10px] font-medium text-[var(--lp-text-muted)]">
          <div className="px-3 py-2">품번</div>
          <div className="px-3 py-2">품명</div>
          <div className="px-3 py-2">규격</div>
          <div className="px-3 py-2">재질</div>
        </div>
        {[
          ["SH-A100", "하우징", "φ45×30", "SUS304"],
          ["SH-B200", "샤프트", "φ20×150", "SCM440"],
          ["SH-C300", "베어링", "6205ZZ", "SUJ2"],
        ].map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            viewport={{ once: true }}
            className="grid grid-cols-4 border-t border-[var(--lp-border)] text-[10px]"
          >
            <div className="px-3 py-2 text-[var(--lp-gradient-from)]">{row[0]}</div>
            <div className="px-3 py-2 text-[var(--lp-text-secondary)]">{row[1]}</div>
            <div className="px-3 py-2 text-[var(--lp-text-tertiary)]">{row[2]}</div>
            <div className="px-3 py-2 text-[var(--lp-text-tertiary)]">{row[3]}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function StepCard({ step, index }: { step: (typeof steps)[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="relative"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
        {/* Left: step info */}
        <div className={`lg:w-5/12 ${index % 2 === 1 ? "lg:order-2" : ""}`}>
          <div className="flex items-center gap-4">
            <div
              className={`relative z-10 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-lg`}
            >
              <step.icon size={24} className="text-[var(--lp-on-brand)]" />
            </div>
            <div>
              <div className="font-[Outfit,sans-serif] text-xs font-bold uppercase tracking-widest text-[var(--lp-text-muted)]">
                Step {step.number}
              </div>
              <h3 className="font-[Outfit,sans-serif] text-lg font-medium text-[var(--lp-text-strong)]">
                {step.title}
              </h3>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[var(--lp-text-tertiary)]">
            {step.description}
          </p>
          <p className="mt-2 text-xs text-[var(--lp-text-muted)]">
            {step.detail}
          </p>
        </div>

        {/* Right: mockup */}
        <div className={`lg:w-7/12 ${index % 2 === 1 ? "lg:order-1" : ""}`}>
          <div
            className="rounded-xl border border-[var(--lp-border-hover)] bg-[var(--lp-surface)] p-4 md:p-5"
            style={{ boxShadow: `0 0 40px ${step.accentColor}08` }}
          >
            <StepMockup type={step.mockup} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function SolutionSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      id="solution"
      className="section-glow-accent section-padding relative"
      ref={sectionRef}
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-[var(--lp-text-muted)]">Solution</p>
          <h2 className="section-heading font-[Outfit,sans-serif] text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.75rem]">
            3단계로 끝나는
            <br />
            <span className="text-[var(--lp-brand)]">BOM 데이터 전환</span>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-[var(--lp-text-tertiary)] md:text-lg">
            기존 방식을 바꾸지 않아도 됩니다.
            <br className="hidden md:block" />
            지금 쓰고 있는 엑셀 양식 그대로 시작하세요.
          </p>
        </motion.div>

        {/* Steps with mockups */}
        <div className="mx-auto mt-20 max-w-5xl space-y-16 lg:space-y-24">
          {steps.map((step, i) => (
            <div key={step.number}>
              <StepCard step={step} index={i} />
              {i < steps.length - 1 && (
                <div className="mt-8 flex justify-center lg:mt-12">
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, repeat: Infinity, repeatType: "reverse", repeatDelay: 0.5 }}
                    viewport={{ once: false }}
                  >
                    <ArrowDown size={20} className="text-[var(--lp-text-dim)]" />
                  </motion.div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
