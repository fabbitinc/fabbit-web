import { BEFORE_AFTER } from "@/constants/content";
import { useIntersection } from "@/lib/use-intersection";
import { SectionHeading } from "@/components/section-heading";

export function BeforeAfterSection() {
  const { ref, visible } = useIntersection();

  return (
    <section ref={ref} className="py-22 lg:py-30">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <SectionHeading
          eyebrow="전환 구조"
          title="흩어진 파일 중심 운영에서 기준본 중심 운영으로 전환합니다"
          description={BEFORE_AFTER.summary}
          className={visible ? "animate-fade-up" : "opacity-0"}
        />

        <div
          className={`section-board mt-12 overflow-hidden rounded-[34px] p-5 lg:p-7 ${
            visible ? "animate-scale-in" : "opacity-0"
          }`}
          style={{ animationDelay: "120ms" }}
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_auto_minmax(0,1.08fr)] lg:items-center">
            <div className="rounded-[28px] border border-status-danger/18 bg-status-danger/5 p-5 lg:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-700 uppercase tracking-[0.24em] text-status-danger">
                  이전
                </div>
                <div className="rounded-full border border-status-danger/12 bg-background/70 px-3 py-1 text-[11px] font-700 uppercase tracking-[0.16em] text-status-danger">
                  분산 운영
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {BEFORE_AFTER.before.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[22px] border border-status-danger/10 bg-background/86 p-4"
                  >
                    <div className="text-sm font-700 text-text-primary">{item.label}</div>
                    <div className="mt-3 text-sm leading-relaxed text-status-danger">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background shadow-lg shadow-text-primary/6">
                <svg width="22" height="22" viewBox="0 0 16 16" fill="none" className="text-brand-500">
                  <path
                    d="M3 8h10m0 0L9 4m4 4L9 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <div className="rounded-[28px] border border-status-success/18 bg-status-success/5 p-5 lg:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-700 uppercase tracking-[0.24em] text-status-success">
                  이후
                </div>
                <div className="rounded-full border border-status-success/12 bg-background/70 px-3 py-1 text-[11px] font-700 uppercase tracking-[0.16em] text-status-success">
                  기준본 중심
                </div>
              </div>

              <div className="mt-5 rounded-[26px] border border-status-success/10 bg-background/86 p-4 lg:p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  {BEFORE_AFTER.after.map((item, index) => (
                    <div key={item.label} className="relative rounded-[22px] border border-border bg-surface p-4">
                      <div className="text-xs font-700 uppercase tracking-[0.16em] text-text-secondary">
                        {item.label}
                      </div>
                      <div className="mt-3 text-base font-700 text-text-primary">{item.value}</div>
                      {index < BEFORE_AFTER.after.length - 1 ? (
                        <div className="mt-4 flex items-center gap-2 text-xs font-700 uppercase tracking-[0.14em] text-status-success">
                          <div className="h-px flex-1 bg-status-success/25" />
                          다음 단계
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {BEFORE_AFTER.checkpoints.map((item) => (
                  <div key={item} className="rounded-[20px] border border-border bg-background/86 p-4">
                    <div className="text-sm leading-relaxed text-text-secondary">{item}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
