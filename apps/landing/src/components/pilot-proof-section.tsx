import { PILOT_SECTORS } from "@/constants/content";
import { useIntersection } from "@/lib/use-intersection";
import { SectionHeading } from "@/components/section-heading";

export function PilotProofSection() {
  const { ref, visible } = useIntersection();

  return (
    <section ref={ref} className="relative py-22 lg:py-30">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/44 to-transparent" />

      <div className="relative mx-auto max-w-[1440px] px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div>
            <SectionHeading
              eyebrow="검증 시나리오"
              title="먼저 검증할 업종과 시나리오를 분명하게 제시합니다"
              description="공개 사례가 아직 많지 않더라도, 어떤 업종에서 무엇을 검증할지 분명하게 적어 두면 신뢰 블록이 비어 보이지 않습니다."
              className={visible ? "animate-fade-up" : "opacity-0"}
            />

            <div className="mt-8 grid gap-4 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {PILOT_SECTORS.map((sector, index) => (
                <article
                  key={sector.name}
                  className={`section-board rounded-[28px] p-5 ${
                    visible ? "animate-fade-up" : "opacity-0"
                  }`}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="text-[11px] font-700 uppercase tracking-[0.2em] text-brand-500/75">
                    업종
                  </div>
                  <h3 className="mt-4 font-display text-xl font-700 text-text-primary">
                    {sector.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                    {sector.focus}
                  </p>
                  <div className="mt-5 space-y-2.5">
                    {sector.metrics.map((metric) => (
                      <div
                        key={metric}
                        className="rounded-[18px] border border-border bg-background/78 px-4 py-3 text-sm font-600 text-text-primary"
                      >
                        {metric}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div
            className={`section-board rounded-[32px] p-6 lg:p-8 ${
              visible ? "animate-slide-left" : "opacity-0"
            }`}
            style={{ animationDelay: "160ms" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-700 uppercase tracking-[0.22em] text-brand-500/75">
                  검증 카드
                </div>
                <div className="mt-2 text-2xl font-700 text-text-primary">
                  사례와 검증 포인트를 함께 보여주는 카드
                </div>
              </div>
              <div className="rounded-full border border-border bg-background/76 px-3 py-1.5 text-[11px] font-700 uppercase tracking-[0.16em] text-text-secondary">
                사례 준비 중
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-border bg-background/80 p-5 lg:p-6">
              <div className="text-sm font-700 text-text-primary">대표 인용구 또는 도입 요약</div>
              <div className="mt-5 space-y-3">
                <div className="mock-row h-3 w-4/5" />
                <div className="mock-row h-3 w-full" />
                <div className="mock-row h-3 w-3/4" />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {["문제 전", "적용 중", "적용 후"].map((item) => (
                  <div key={item} className="rounded-[22px] border border-border bg-surface p-4">
                    <div className="text-xs font-700 uppercase tracking-[0.16em] text-text-secondary">
                      {item}
                    </div>
                    <div className="mt-4 space-y-2.5">
                      <div className="mock-row h-2.5 w-20" />
                      <div className="mock-row h-2.5 w-28" />
                      <div className="mock-row h-2.5 w-16" />
                    </div>
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
