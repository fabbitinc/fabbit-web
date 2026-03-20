import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@heroui/react";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { plans } from "@/constants/plans";
import { APP_SIGNUP_URL } from "@/constants/urls";

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
            무료로 시작하고,
            <br />
            <span className="text-[var(--lp-brand)]">역할별 좌석으로 확장</span>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-[var(--lp-text-tertiary)] md:text-lg">
            Starter는 무료로 시작하고, 유료 플랜은 Viewer·Collaborator·Full 좌석을 조합해
            <br className="hidden md:block" />
            팀 운영 방식에 맞는 과금 구조를 만듭니다.
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
                as={!plan.disabled ? "a" : undefined}
                href={!plan.disabled ? APP_SIGNUP_URL : undefined}
                isDisabled={plan.disabled}
                className={`mt-8 w-full font-[Outfit,sans-serif] font-medium transition-all duration-200 ${
                  plan.disabled
                    ? "border border-[var(--lp-border)] bg-transparent text-[var(--lp-text-dim)] cursor-not-allowed opacity-60"
                    : plan.highlighted
                      ? "bg-[var(--lp-brand)] text-[var(--lp-on-brand)] shadow-lg shadow-[var(--lp-brand)]/20 hover:shadow-[var(--lp-brand)]/40"
                      : "border border-[var(--lp-border)] bg-transparent text-[var(--lp-text-secondary)] hover:border-[var(--lp-brand)]/30 hover:text-[var(--lp-text-strong)]"
                }`}
                endContent={!plan.disabled ? <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" /> : undefined}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Inactive plan note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mx-auto mt-6 max-w-2xl text-center text-xs text-[var(--lp-text-dim)]"
        >
          Organization과 Enterprise는 가격과 과금 구조를 공개하지만, 현재 공개 사이트에서는 비활성 상태로만 노출합니다.
        </motion.p>

        {/* 독립 요금 페이지 링크 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mx-auto mt-8 max-w-2xl text-center"
        >
          <Link
            to="/pricing"
            className="inline-flex items-center gap-1 text-sm text-[var(--lp-brand)] underline decoration-[var(--lp-brand)]/30 underline-offset-4 transition-colors hover:decoration-[var(--lp-brand)]"
          >
            전체 요금·비교표·계산기 보기
            <ArrowRight size={14} />
          </Link>
        </motion.div>

        {/* Voucher note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mx-auto mt-8 max-w-2xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--lp-border-hover)] bg-[var(--lp-border)] px-5 py-3">
            <span className="text-sm text-[var(--lp-text-muted)]">
              정부 바우처(클라우드, AI, 스마트공장) 연계 가능
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
