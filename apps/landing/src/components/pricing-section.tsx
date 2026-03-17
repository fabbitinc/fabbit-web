import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@heroui/react";
import { Check, ArrowRight, Sparkles } from "lucide-react";

interface Plan {
  name: string;
  price: string;
  priceUnit: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
  badge?: string;
}

const plans: Plan[] = [
  {
    name: "Starter",
    price: "무료",
    priceUnit: "",
    description: "도입 검토 및 소규모 팀을 위한 상시 무료 플랜",
    features: [
      "멤버 5명",
      "스토리지 10GB",
      "AI BOM 매핑",
      "기본 도면 관리",
      "이메일 지원",
    ],
    cta: "시작하기",
  },
  {
    name: "Team",
    price: "249,000",
    priceUnit: "원/월",
    description: "10~20명 규모 초기 운영팀",
    features: [
      "멤버 20명",
      "스토리지 100GB",
      "AI BOM 매핑 (무제한)",
      "변경 이력 관리",
      "도면-BOM 연결",
      "우선 지원",
    ],
    highlighted: true,
    cta: "시작하기",
    badge: "인기",
  },
  {
    name: "Business",
    price: "599,000",
    priceUnit: "원/월",
    description: "부서 간 협업이 필요한 운영팀",
    features: [
      "멤버 무제한",
      "스토리지 500GB",
      "Team 플랜의 모든 기능",
      "승인 워크플로우",
      "부서별 권한 관리",
      "전담 매니저",
    ],
    cta: "영업팀 문의",
  },
  {
    name: "Enterprise",
    price: "별도",
    priceUnit: "협의",
    description: "커스텀 연동 및 대용량 운영",
    features: [
      "Business 플랜의 모든 기능",
      "온프레미스 / 하이브리드",
      "ERP 연동",
      "커스텀 매핑 템플릿",
      "SLA 보장",
      "전용 인프라",
    ],
    cta: "상담 요청",
  },
];

export function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="pricing"
      className="section-glow-accent section-padding relative"
      ref={ref}
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-[var(--lp-text-muted)]">Pricing</p>
          <h2 className="section-heading font-[Outfit,sans-serif] text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.75rem]">
            회사 규모에 맞는
            <br />
            <span className="text-[var(--lp-brand)]">합리적인 요금제</span>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-[var(--lp-text-tertiary)] md:text-lg">
            인당 과금이 아닌 회사 단위 과금.
            <br className="hidden md:block" />
            팀 전체가 부담 없이 사용할 수 있습니다.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 * (i + 1) }}
              whileHover={{
                y: -4,
                transition: { duration: 0.2 },
              }}
              className={`pricing-card relative flex flex-col rounded-2xl p-6 transition-all duration-300 md:p-7 ${
                plan.highlighted
                  ? "border border-[var(--lp-brand)]/30 bg-gradient-to-b from-[var(--lp-brand)]/[0.08] to-transparent shadow-xl shadow-[var(--lp-brand)]/10"
                  : "glass-card"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--lp-brand)] px-3 py-1 text-xs font-semibold text-[var(--lp-on-brand)] shadow-lg">
                    <Sparkles size={10} />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <h3 className="font-[Outfit,sans-serif] text-base font-medium text-[var(--lp-text-strong)]">
                  {plan.name}
                </h3>
                <p className="mt-1 text-xs text-[var(--lp-text-muted)]">{plan.description}</p>
              </div>

              <div className="mt-5">
                <div className="flex items-baseline gap-1">
                  <span className="font-[Outfit,sans-serif] text-2xl font-bold tabular-nums text-[var(--lp-text-strong)] md:text-3xl">
                    {plan.price}
                  </span>
                  {plan.priceUnit && (
                    <span className="text-sm text-[var(--lp-text-muted)]">
                      {plan.priceUnit}
                    </span>
                  )}
                </div>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-[var(--lp-text-tertiary)]"
                  >
                    <Check
                      size={16}
                      className={`mt-0.5 flex-shrink-0 ${
                        plan.highlighted ? "text-[var(--lp-brand)]" : "text-[var(--lp-text-dim)]"
                      }`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className={`mt-8 w-full font-[Outfit,sans-serif] font-medium transition-all duration-200 ${
                  plan.highlighted
                    ? "bg-[var(--lp-brand)] text-[var(--lp-on-brand)] shadow-lg shadow-[var(--lp-brand)]/20 hover:shadow-[var(--lp-brand)]/40"
                    : "border border-[var(--lp-border)] bg-transparent text-[var(--lp-text-secondary)] hover:border-[var(--lp-brand)]/30 hover:text-[var(--lp-text-strong)]"
                }`}
                endContent={<ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Voucher note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mx-auto mt-12 max-w-2xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--lp-border-hover)] bg-[var(--lp-border)] px-5 py-3">
            <span className="text-sm text-[var(--lp-text-muted)]">
              💡 정부 바우처(클라우드, AI, 스마트공장) 연계 가능 —{" "}
              <a
                href="#"
                className="text-[var(--lp-brand)] underline decoration-[var(--lp-brand)]/30 underline-offset-4 transition-colors hover:decoration-[var(--lp-brand)]"
              >
                바우처 문의
              </a>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
