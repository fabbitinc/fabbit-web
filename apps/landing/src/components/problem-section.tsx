import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { FileX, AlertTriangle, Truck, ChevronRight, FolderOpen, HardDrive, Server, Rocket } from "lucide-react";

function CountUp({ target, suffix = "", duration = 2, separator = false }: { target: number; suffix?: string; duration?: number; separator?: boolean }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => {
    const num = Math.round(v);
    return separator ? num.toLocaleString() : num.toString();
  });

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(motionValue, target, { duration, ease: "easeOut" });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => { controls.stop(); unsub(); };
  }, [isInView, target, duration, motionValue, rounded]);

  return <span ref={ref}>{display}{suffix}</span>;
}

const problems = [
  {
    icon: FileX,
    title: "최신본 관리 부재",
    scenario: "\"이 도면이 최신본 맞아?\" — 매일 반복되는 질문",
    description:
      "도면이 여러 폴더와 개인 PC에 흩어져 있어 어떤 파일이 유효본인지 즉시 판단하기 어렵습니다. 구버전 도면으로 생산하는 사고가 반복됩니다.",
    stat: { value: 537580, suffix: "개", separator: true },
    statLabel: "국내 제조업 사업체 수",
    color: "blue" as const,
  },
  {
    icon: AlertTriangle,
    title: "변경관리 미흡",
    scenario: "\"누가 이 부품 바꿨어?\" — 추적할 방법이 없음",
    description:
      "검토, 승인, 배포 이력이 남지 않아 변경 영향 추적과 책임 구분이 어렵습니다. 부품 하나가 바뀌어도 어디에 영향이 가는지 파악할 수 없습니다.",
    stat: { value: 95.6, suffix: "%", separator: false },
    statLabel: "PLM 미도입 중소 제조업",
    color: "violet" as const,
  },
  {
    icon: Truck,
    title: "마이그레이션 부담",
    scenario: "\"시스템 도입하고 싶은데 엑셀 옮기는 게...\"",
    description:
      "기존 엑셀 속성, 폴더 체계, 고유 분류를 새 시스템에 옮기는 비용이 높습니다. 기능은 좋지만 도입 자체가 어려워 엑셀을 계속 씁니다.",
    stat: { value: 77389, suffix: "개", separator: true },
    statLabel: "10~299명 규모 제조기업",
    color: "cyan" as const,
  },
];

const colorMap = {
  blue: {
    iconBg: "bg-[var(--lp-brand)]/10",
    iconText: "text-[var(--lp-brand)]",
    statText: "text-[var(--lp-brand)]",
    borderHover: "hover:border-[var(--lp-brand)]/20",
    scenarioText: "text-[var(--lp-brand)]/70",
  },
  violet: {
    iconBg: "bg-[var(--lp-accent)]/10",
    iconText: "text-[var(--lp-accent)]",
    statText: "text-[var(--lp-accent)]",
    borderHover: "hover:border-[var(--lp-accent)]/20",
    scenarioText: "text-[var(--lp-accent)]/70",
  },
  cyan: {
    iconBg: "bg-[var(--lp-gradient-from)]/10",
    iconText: "text-[var(--lp-gradient-from)]",
    statText: "text-[var(--lp-gradient-from)]",
    borderHover: "hover:border-[var(--lp-gradient-from)]/20",
    scenarioText: "text-[var(--lp-gradient-from)]/70",
  },
};

const journeySteps = [
  {
    icon: FolderOpen,
    label: "엑셀/개인PC",
    pain: "버전 충돌, 유실 위험",
    active: false,
  },
  {
    icon: HardDrive,
    label: "공유폴더",
    pain: "접근성↑ 관리는 여전히 수동",
    active: false,
  },
  {
    icon: Server,
    label: "NAS",
    pain: "저장은 되지만 검색·추적 불가",
    active: false,
  },
  {
    icon: Rocket,
    label: "Fabbit",
    pain: "AI 매핑 + 버전관리 + 변경추적",
    active: true,
  },
];

export function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="problem"
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
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[var(--lp-text-muted)]">Problem</p>
          <h2 className="section-heading font-[Outfit,sans-serif] text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.75rem]">
            엑셀과 폴더로는
            <br />
            <span className="text-[var(--lp-brand)]">더 이상 버틸 수 없습니다</span>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-[var(--lp-text-tertiary)] md:text-lg">
            ERP는 있어도 도면과 BOM은 별도 폴더와 엑셀로 관리하는 것이
            현실입니다.
            <br className="hidden md:block" />
            공유는 되지만 관리가 안 되는 시점, 그때 솔루션을 찾게 됩니다.
          </p>
        </motion.div>

        {/* Problem cards */}
        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {problems.map((problem, i) => {
            const colors = colorMap[problem.color];
            return (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.15 * (i + 1) }}
                className={`glass-card group rounded-2xl p-7 transition-all duration-300 md:p-9 ${colors.borderHover}`}
              >
                <div
                  className={`inline-flex h-14 w-14 items-center justify-center rounded-xl ${colors.iconBg}`}
                >
                  <problem.icon size={26} className={colors.iconText} />
                </div>
                <h3 className="mt-5 font-[Outfit,sans-serif] text-xl font-semibold text-[var(--lp-text-strong)]">
                  {problem.title}
                </h3>
                <p className={`mt-2 text-sm italic ${colors.scenarioText}`}>
                  {problem.scenario}
                </p>
                <p className="mt-4 text-[0.9375rem] leading-relaxed text-[var(--lp-text-tertiary)]">
                  {problem.description}
                </p>
                <div className="mt-7 border-t border-[var(--lp-border-hover)] pt-5">
                  <div className={`font-[Outfit,sans-serif] text-3xl font-bold ${colors.statText}`}>
                    <CountUp
                      target={problem.stat.value}
                      suffix={problem.stat.suffix}
                      separator={problem.stat.separator}
                    />
                  </div>
                  <div className="mt-1 text-sm text-[var(--lp-text-muted)]">
                    {problem.statLabel}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Journey bar — enriched */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mx-auto mt-20 max-w-4xl"
        >
          <div className="glass-card rounded-2xl p-8 md:p-10">
            <div className="mb-8 text-center">
              <h3 className="font-[Outfit,sans-serif] text-lg font-semibold text-[var(--lp-text-strong)] md:text-xl">
                제조업의 데이터 관리 진화 경로
              </h3>
              <p className="mt-2 text-sm text-[var(--lp-text-muted)]">
                각 단계의 한계를 넘어, 다음 단계로 진화합니다
              </p>
            </div>

            {/* Desktop: horizontal */}
            <div className="hidden md:block">
              <div className="grid grid-cols-4 gap-3">
                {journeySteps.map((step, i) => (
                  <div key={step.label} className="flex items-start gap-3">
                    <div className="flex flex-1 flex-col items-center text-center">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-xl transition-colors ${
                          step.active
                            ? "bg-[var(--lp-brand)] shadow-lg shadow-[var(--lp-brand)]/20"
                            : "bg-[var(--lp-border)] border border-[var(--lp-border-hover)]"
                        }`}
                      >
                        <step.icon
                          size={24}
                          className={step.active ? "text-[var(--lp-on-brand)]" : "text-[var(--lp-text-muted)]"}
                        />
                      </div>
                      <div
                        className={`mt-3 font-[Outfit,sans-serif] text-sm font-semibold ${
                          step.active ? "text-[var(--lp-text-strong)]" : "text-[var(--lp-text-tertiary)]"
                        }`}
                      >
                        {step.label}
                      </div>
                      <div
                        className={`mt-1.5 text-xs leading-relaxed ${
                          step.active ? "text-[var(--lp-brand)]" : "text-[var(--lp-text-dim)]"
                        }`}
                      >
                        {step.pain}
                      </div>
                    </div>
                    {i < journeySteps.length - 1 && (
                      <div className="flex h-14 items-center pt-0.5">
                        <ChevronRight size={18} className="text-[var(--lp-text-dim)]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile: vertical */}
            <div className="space-y-4 md:hidden">
              {journeySteps.map((step, i) => (
                <div key={step.label}>
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${
                        step.active
                          ? "bg-[var(--lp-brand)] shadow-lg shadow-[var(--lp-brand)]/20"
                          : "bg-[var(--lp-border)] border border-[var(--lp-border-hover)]"
                      }`}
                    >
                      <step.icon
                        size={20}
                        className={step.active ? "text-[var(--lp-on-brand)]" : "text-[var(--lp-text-muted)]"}
                      />
                    </div>
                    <div>
                      <div
                        className={`font-[Outfit,sans-serif] text-sm font-semibold ${
                          step.active ? "text-[var(--lp-text-strong)]" : "text-[var(--lp-text-tertiary)]"
                        }`}
                      >
                        {step.label}
                      </div>
                      <div
                        className={`text-xs ${
                          step.active ? "text-[var(--lp-brand)]" : "text-[var(--lp-text-dim)]"
                        }`}
                      >
                        {step.pain}
                      </div>
                    </div>
                  </div>
                  {i < journeySteps.length - 1 && (
                    <div className="ml-6 flex h-4 items-center">
                      <div className="h-full w-px bg-[var(--lp-border-hover)]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
