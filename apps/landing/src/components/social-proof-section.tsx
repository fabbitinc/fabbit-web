import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Factory, Cpu, Wrench, Cog, Zap } from "lucide-react";

const logos = [
  { name: "자동화기기 제조사 A", icon: Cpu },
  { name: "특수장비 제조사 B", icon: Wrench },
  { name: "시스템 제작사 C", icon: Cog },
  { name: "금속가공 기업 D", icon: Factory },
  { name: "전기장비 제조사 E", icon: Zap },
];

export function SocialProofSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section className="relative border-y border-[var(--lp-border)] py-12 md:py-16" ref={ref}>
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-sm text-[var(--lp-text-muted)]">
            경기도 소재 중소 제조기업들이 <span className="text-[var(--lp-text-secondary)]">Fabbit으로 전환</span>하고 있습니다
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-6 md:gap-10"
        >
          {logos.map((logo, i) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
              className="flex items-center gap-2.5 rounded-lg border border-[var(--lp-border)] bg-[var(--lp-border)] px-4 py-2.5 transition-colors hover:border-[var(--lp-border-hover)] hover:bg-[var(--lp-border)]"
            >
              <logo.icon size={18} className="text-[var(--lp-text-dim)]" />
              <span className="text-sm text-[var(--lp-text-muted)]">{logo.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
