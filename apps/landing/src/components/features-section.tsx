import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  FileSpreadsheet,
  Brain,
  Shield,
  GitBranch,
  Search,
  Users,
} from "lucide-react";

const features = [
  {
    icon: FileSpreadsheet,
    title: "엑셀 양식 그대로",
    description:
      "기존에 사용하던 BOM 엑셀의 속성명과 구조를 바꾸지 않아도 됩니다. 업로드만 하면 AI가 알아서 해석합니다.",
    color: "text-[var(--lp-brand)]",
    bg: "bg-[var(--lp-brand)]/10",
    borderColor: "hover:border-[var(--lp-brand)]/20",
    size: "large" as const,
  },
  {
    icon: Brain,
    title: "AI 자동 매핑",
    description:
      "LLM이 헤더와 샘플 데이터를 분석해 시스템 필드와의 매핑 규칙을 생성합니다. 고객별 고유 속성명도 정확하게 연결합니다.",
    color: "text-[var(--lp-accent)]",
    bg: "bg-[var(--lp-accent)]/10",
    borderColor: "hover:border-[var(--lp-accent)]/20",
    size: "large" as const,
  },
  {
    icon: Shield,
    title: "최신본 관리",
    description:
      "도면의 최신 버전을 자동으로 식별하고 관리합니다. 구버전 도면으로 인한 생산 사고를 방지합니다.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    borderColor: "hover:border-emerald-400/20",
    size: "small" as const,
  },
  {
    icon: GitBranch,
    title: "변경 이력 추적",
    description:
      "검토, 승인, 배포의 모든 이력을 기록합니다. 누가 언제 무엇을 변경했는지 즉시 파악할 수 있습니다.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    borderColor: "hover:border-amber-400/20",
    size: "small" as const,
  },
  {
    icon: Search,
    title: "도면-BOM 연결",
    description:
      "도면과 BOM 데이터를 하나의 시스템에서 연결해 관리합니다. 부품 변경 시 영향 범위를 빠르게 파악합니다.",
    color: "text-[var(--lp-gradient-from)]",
    bg: "bg-[var(--lp-gradient-from)]/10",
    borderColor: "hover:border-[var(--lp-gradient-from)]/20",
    size: "small" as const,
  },
  {
    icon: Users,
    title: "부서 간 협업",
    description:
      "설계, 생산, 구매, 품질 부서가 같은 데이터를 보며 협업합니다. 메일과 메신저로 파일을 주고받을 필요가 없습니다.",
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    borderColor: "hover:border-pink-400/20",
    size: "small" as const,
  },
];

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="features"
      className="section-padding relative"
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
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-[var(--lp-text-muted)]">Features</p>
          <h2 className="section-heading font-[Outfit,sans-serif] text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.75rem]">
            제조 현장을 위해
            <br />
            <span className="text-[var(--lp-brand)]">설계된 기능들</span>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-[var(--lp-text-tertiary)] md:text-lg">
            엑셀/NAS 단계에서 정식 운영 시스템으로 넘어가는
            <br className="hidden md:block" />
            가장 부담 없는 진입 경로를 제공합니다.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 * (i + 1) }}
              className={`glass-card group rounded-2xl p-6 transition-all duration-300 hover:translate-y-[-2px] md:p-7 ${feature.borderColor} ${
                feature.size === "large" ? "sm:col-span-2" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`inline-flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl ${feature.bg} transition-transform duration-300 group-hover:scale-110`}
                >
                  <feature.icon size={24} className={feature.color} />
                </div>
                <div className="flex-1">
                  <h3 className="font-[Outfit,sans-serif] text-lg font-semibold text-[var(--lp-text-strong)]">
                    {feature.title}
                  </h3>
                  <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-[var(--lp-text-tertiary)]">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Highlight box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 overflow-hidden rounded-2xl border border-[var(--lp-brand)]/20 bg-gradient-to-r from-[var(--lp-brand)]/[0.06] to-[var(--lp-accent)]/[0.06]"
        >
          <div className="flex flex-col items-center gap-6 p-8 md:flex-row md:p-10">
            <div className="flex-1">
              <h3 className="font-[Outfit,sans-serif] text-lg font-medium text-[var(--lp-text-strong)] md:text-xl">
                핵심은 &ldquo;쉬운 시작&rdquo;입니다
              </h3>
              <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-[var(--lp-text-tertiary)]">
                Fabbit은 기존 도면관리 시장 안에서 엑셀/NAS 단계에서 실제 도입으로
                넘어가는 구간을 공략합니다. 고객의 구매 판단은 &ldquo;더 고급한 기능&rdquo;보다
                &ldquo;기존 방식에서 무리 없이 넘어갈 수 있는가&rdquo;에 더 가깝습니다.
              </p>
            </div>
            <div className="flex flex-shrink-0 flex-col items-center rounded-xl bg-[var(--lp-border)] px-8 py-5">
              <div className="font-[Outfit,sans-serif] text-4xl font-bold text-[var(--lp-brand)]">
                10분
              </div>
              <div className="mt-1 text-xs text-[var(--lp-text-muted)]">
                평균 초기 셋업 시간
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
