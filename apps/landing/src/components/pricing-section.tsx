import { ADOPTION_STAGES } from "@/constants/content";
import { trackEvent } from "@/lib/tracking";
import { useIntersection } from "@/lib/use-intersection";
import { SectionHeading } from "@/components/section-heading";

export function PricingSection() {
  const { ref, visible } = useIntersection();

  return (
    <section
      ref={ref}
      className="relative pt-14 pb-22 lg:pt-18 lg:pb-30"
      onMouseEnter={() => trackEvent("pricing_section_view")}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/42 to-transparent" />

      <div className="relative mx-auto max-w-[1440px] px-6 lg:px-10">
        <SectionHeading
          anchorId="pricing"
          eyebrow="도입 방식"
          title={"파일럿부터 팀 확장까지\n단계적으로 도입합니다"}
          description="실제 가격과 플랜 이름이 아직 바뀔 수 있다면, 먼저 어떤 순서로 도입이 진행되는지와 각 단계에서 무엇을 검증하는지를 보여주는 편이 안전합니다."
          align="center"
          className={visible ? "animate-fade-up" : "opacity-0"}
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {ADOPTION_STAGES.map((stage, index) => (
            <article
              key={stage.name}
              className={`rounded-[30px] border p-6 lg:p-7 ${
                stage.highlighted ? "section-board border-brand-500/25" : "section-board"
              } ${visible ? "animate-fade-up" : "opacity-0"}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-700 uppercase tracking-[0.22em] text-brand-500/75">
                    {stage.name}
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-700 text-text-primary">
                    {stage.title}
                  </h3>
                </div>
                {stage.highlighted ? (
                  <div className="rounded-full bg-brand-500 px-3 py-1.5 text-[11px] font-700 uppercase tracking-[0.16em] text-white">
                    우선 검토
                  </div>
                ) : null}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-text-secondary lg:text-base">
                {stage.description}
              </p>

              <div className="mt-6 space-y-3">
                {stage.deliverables.map((item) => (
                  <div
                    key={item}
                    className="rounded-[20px] border border-border bg-background/78 px-4 py-3 text-sm font-600 text-text-primary"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <a
                href="#lead-form"
                className={`mt-6 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-base font-700 transition-all ${
                  stage.highlighted
                    ? "bg-brand-500 text-white hover:bg-brand-600"
                    : "border border-border bg-surface text-text-primary hover:border-brand-500/25"
                }`}
              >
                상담 흐름 보기
              </a>
            </article>
          ))}
        </div>

        <div
          className={`ink-board mt-8 rounded-[30px] p-5 text-background lg:p-6 ${
            visible ? "animate-fade-up" : "opacity-0"
          }`}
          style={{ animationDelay: "320ms" }}
        >
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.76fr)_minmax(0,1.24fr)] lg:items-center">
            <div>
              <div className="text-sm font-700 uppercase tracking-[0.22em] text-background/58">
                도입 흐름
              </div>
              <div className="mt-3 text-xl font-700 text-background">
                도입 흐름을 한 번 더 정리하는 보드
              </div>
              <p className="mt-3 text-sm leading-relaxed text-background/72 lg:text-base">
                랜딩 초기에는 가격보다 도입 방식과 검증 구조를 정리하는 편이 더 중요합니다.
                실제 가격이 정해지면 이 구조 위에 자연스럽게 확장할 수 있습니다.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              {["문제 확인", "화면 데모", "파일럿 검증", "확장 협의"].map((item) => (
                <div key={item} className="rounded-[22px] border border-background/10 bg-background/7 p-4 backdrop-blur-sm">
                  <div className="text-xs font-700 uppercase tracking-[0.16em] text-background/54">
                    단계
                  </div>
                  <div className="mt-3 text-sm font-700 text-background">{item}</div>
                  <div className="mt-4 h-2.5 w-16 rounded-full bg-background/14" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
