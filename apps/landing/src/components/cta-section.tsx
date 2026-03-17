import { Button } from "@heroui/react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Mail, Clock, Users } from "lucide-react";

export function CtaSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding relative overflow-hidden" ref={ref}>
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2">
          <div className="absolute inset-0 rounded-full bg-[var(--lp-brand)]/10 blur-[120px]" />
          <div className="absolute inset-10 rounded-full bg-[var(--lp-accent)]/8 blur-[100px]" />
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="section-heading font-[Outfit,sans-serif] text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.75rem]">
            엑셀에서 시스템으로,
            <br />
            <span className="gradient-text">가장 쉬운 첫 걸음</span>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-[var(--lp-text-tertiary)] md:text-lg">
            Fabbit은 기존 엑셀 양식 그대로 도면과 BOM을 체계적으로 관리할 수
            있는 솔루션입니다. 복잡한 초기 셋업 없이 무료로 시작하세요.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="cta-pulse group bg-[var(--lp-brand)] px-10 font-[Outfit,sans-serif] font-semibold text-[var(--lp-on-brand)] shadow-xl shadow-[var(--lp-brand)]/25 transition-all hover:shadow-[var(--lp-brand)]/40 hover:scale-[1.02]"
              endContent={
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              }
            >
              시작하기
            </Button>
            <Button
              size="lg"
              variant="bordered"
              className="border-[var(--lp-border-hover)] px-8 font-[Outfit,sans-serif] text-[var(--lp-text-secondary)] hover:border-[var(--lp-border-hover)] hover:bg-[var(--lp-border-hover)]"
              startContent={<Mail size={16} className="text-[var(--lp-brand)]" />}
            >
              파일럿 문의하기
            </Button>
          </div>

          {/* Trust signals with icons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--lp-text-muted)]">
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-[var(--lp-text-dim)]" />
              5분 안에 시작
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={14} className="text-[var(--lp-text-dim)]" />
              팀 단위 요금제
            </span>
          </div>
        </motion.div>

        {/* Target market badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mt-16 max-w-2xl"
        >
          <div className="text-center text-xs text-[var(--lp-text-dim)]">
            초기 타깃 고객
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {[
              "자동화기기 제조",
              "특수장비 제조",
              "시스템 제작",
              "금속가공",
              "기계장비",
              "전기장비",
            ].map((market) => (
              <span
                key={market}
                className="rounded-full border border-[var(--lp-border-hover)] bg-[var(--lp-border)] px-4 py-1.5 text-xs text-[var(--lp-text-muted)] transition-colors hover:border-[var(--lp-border-hover)] hover:text-[var(--lp-text-tertiary)]"
              >
                {market}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
