import { Button } from "@heroui/react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { ArrowRight, Play } from "lucide-react";

function CountUp({ target, suffix = "", duration = 2 }: { target: number; suffix?: string; duration?: number }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v).toString());

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(motionValue, target, { duration, ease: "easeOut" });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => { controls.stop(); unsub(); };
  }, [isInView, target, duration, motionValue, rounded]);

  return (
    <span ref={ref}>
      {display}{suffix}
    </span>
  );
}

export function HeroSection() {
  return (
    <section className="hero-glow grid-pattern relative overflow-hidden pt-36 pb-24 md:pt-44 md:pb-36 min-h-[70vh] flex items-center">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[800px] -translate-x-1/2 opacity-30">
        <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-[var(--lp-brand)]/20 blur-[120px]" />
        <div className="absolute right-1/4 top-20 h-64 w-64 rounded-full bg-[var(--lp-accent)]/20 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 flex justify-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--lp-brand)]/20 bg-[var(--lp-brand)]/5 px-4 py-1.5 text-sm text-[var(--lp-brand)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--lp-brand)] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--lp-brand)]" />
            </span>
            파일럿 고객 모집 중
          </span>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto max-w-4xl text-center"
        >
          <h1 className="font-[Outfit,sans-serif] text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl md:text-6xl lg:text-[4.25rem]">
            BOM 마이그레이션,
            <br />
            <span className="gradient-text-animated">10분이면 끝납니다</span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mx-auto mt-8 max-w-2xl text-center text-lg leading-relaxed text-[var(--lp-text-tertiary)] md:text-xl"
        >
          엑셀 BOM을 그대로 올리면, AI가 자동으로 매핑합니다.
          <br className="hidden sm:block" />
          <span className="text-[var(--lp-text-secondary)]">
            기존 양식을 바꿀 필요 없이, 지금 바로 시작하세요.
          </span>
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            size="lg"
            className="cta-pulse group bg-[var(--lp-brand)] px-8 font-[Outfit,sans-serif] font-semibold text-[var(--lp-on-brand)] shadow-xl shadow-[var(--lp-brand)]/25 transition-all hover:shadow-[var(--lp-brand)]/40 hover:scale-[1.02]"
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
            startContent={<Play size={16} className="text-[var(--lp-brand)]" />}
          >
            데모 보기
          </Button>
        </motion.div>

        {/* Stats - results-focused */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="mx-auto mt-16 flex max-w-xl items-center justify-center gap-8 border-t border-[var(--lp-border)] pt-8 md:gap-16"
        >
          <div className="text-center">
            <div className="font-[Outfit,sans-serif] text-3xl font-bold text-[var(--lp-text-strong)] md:text-4xl">
              <CountUp target={95} suffix="%" />
            </div>
            <div className="mt-1.5 text-sm text-[var(--lp-text-muted)]">
              매핑 정확도
            </div>
          </div>
          <div className="text-center">
            <div className="font-[Outfit,sans-serif] text-3xl font-bold text-[var(--lp-text-strong)] md:text-4xl">
              <CountUp target={10} suffix="분" />
            </div>
            <div className="mt-1.5 text-sm text-[var(--lp-text-muted)]">
              평균 셋업 시간
            </div>
          </div>
          <div className="text-center">
            <div className="font-[Outfit,sans-serif] text-3xl font-bold text-[var(--lp-brand)] md:text-4xl">
              무료
            </div>
            <div className="mt-1.5 text-sm text-[var(--lp-text-muted)]">
              시작 비용
            </div>
          </div>
        </motion.div>

        {/* Product Screenshot Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="relative mx-auto mt-20 max-w-5xl"
        >
          <div className="product-shadow overflow-hidden rounded-xl border border-[var(--lp-border-hover)] bg-[var(--lp-surface)]">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-[var(--lp-border-hover)] bg-[var(--lp-mockup-chrome)] px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[var(--lp-mockup-dot-1)]" />
                <div className="h-3 w-3 rounded-full bg-[var(--lp-mockup-dot-2)]" />
                <div className="h-3 w-3 rounded-full bg-[var(--lp-mockup-dot-3)]" />
              </div>
              <div className="ml-4 flex-1 rounded-md bg-[var(--lp-mockup-url-bg)] px-3 py-1 text-xs text-[var(--lp-text-muted)]">
                app.fabbit.io
              </div>
            </div>
            {/* App content mockup */}
            <div className="p-6 md:p-8">
              {/* Sidebar + Main area */}
              <div className="flex gap-6">
                {/* Sidebar */}
                <div className="hidden w-48 flex-shrink-0 space-y-3 md:block">
                  <div className="flex items-center gap-2 rounded-lg bg-[var(--lp-brand)]/10 px-3 py-2">
                    <div className="h-4 w-4 rounded bg-[var(--lp-brand)]/30" />
                    <span className="text-xs text-[var(--lp-brand)]">BOM 매핑</span>
                  </div>
                  {["도면 관리", "부품 목록", "변경 이력", "설정"].map(
                    (item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-[var(--lp-text-dim)]"
                      >
                        <div className="h-4 w-4 rounded bg-[var(--lp-surface)]" />
                        <span className="text-xs">{item}</span>
                      </div>
                    ),
                  )}
                </div>
                {/* Main */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-[Outfit,sans-serif] text-sm font-semibold text-[var(--lp-text-strong)]">
                        엑셀 BOM 매핑 결과
                      </div>
                      <div className="mt-0.5 text-xs text-[var(--lp-text-muted)]">
                        AI가 분석한 필드 매핑을 확인하세요
                      </div>
                    </div>
                    <div className="rounded-lg bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                      매핑 완료
                    </div>
                  </div>
                  {/* Mapping table mockup */}
                  <div className="overflow-hidden rounded-lg border border-[var(--lp-border-hover)]">
                    <div className="grid grid-cols-3 gap-px bg-[var(--lp-border)] text-xs">
                      <div className="bg-[var(--lp-surface)] px-4 py-2.5 font-medium text-[var(--lp-text-tertiary)]">
                        엑셀 컬럼
                      </div>
                      <div className="bg-[var(--lp-surface)] px-4 py-2.5 font-medium text-[var(--lp-text-tertiary)]">
                        시스템 필드
                      </div>
                      <div className="bg-[var(--lp-surface)] px-4 py-2.5 font-medium text-[var(--lp-text-tertiary)]">
                        신뢰도
                      </div>
                    </div>
                    {[
                      { excel: "PART NO", field: "품번", conf: "98%" },
                      { excel: "품명", field: "품명", conf: "99%" },
                      { excel: "규격/사양", field: "규격", conf: "95%" },
                      { excel: "수량", field: "수량", conf: "99%" },
                      { excel: "MATERIAL", field: "재질", conf: "92%" },
                    ].map((row, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 1.0 + i * 0.1 }}
                        className="grid grid-cols-3 gap-px border-t border-[var(--lp-border)] text-xs"
                      >
                        <div className="bg-[var(--lp-surface-dim)]/50 px-4 py-2.5 text-[var(--lp-text-secondary)]">
                          {row.excel}
                        </div>
                        <div className="flex items-center gap-1.5 bg-[var(--lp-surface-dim)]/50 px-4 py-2.5">
                          <span className="text-[var(--lp-brand)]">→</span>
                          <span className="text-[var(--lp-text-strong)]">{row.field}</span>
                        </div>
                        <div className="bg-[var(--lp-surface-dim)]/50 px-4 py-2.5">
                          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-400">
                            {row.conf}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom gradient fade */}
          <div className="absolute inset-x-0 -bottom-1 h-32 bg-gradient-to-t from-[var(--lp-bg)] to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
