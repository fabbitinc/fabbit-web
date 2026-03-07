import { TARGET_FIT } from "@/constants/content";
import { useIntersection } from "@/lib/use-intersection";
import { SectionHeading } from "@/components/section-heading";

export function TargetFitSection() {
  const { ref, visible } = useIntersection();

  return (
    <section ref={ref} className="pt-16 pb-22 lg:pt-18 lg:pb-30">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <SectionHeading
          anchorId="target"
          eyebrow="도입 대상"
          title="이런 팀이라면 Fabbit 도입 우선순위가 높습니다"
          description="누구에게 맞는지와 어떤 조건이면 검토 우선순위가 올라가는지 한 화면에서 정리해 두면 문의 품질도 함께 올라갑니다."
          className={visible ? "animate-fade-up" : "opacity-0"}
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)]">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {TARGET_FIT.profiles.map((profile, index) => (
              <article
                key={profile.title}
                className={`section-board rounded-[28px] p-6 ${
                  visible ? "animate-fade-up" : "opacity-0"
                }`}
                style={{ animationDelay: `${index * 90}ms` }}
              >
              <div className="text-[11px] font-700 uppercase tracking-[0.2em] text-brand-500/75">
                  Team {index + 1}
              </div>
                <h3 className="mt-4 font-display text-xl font-700 text-text-primary">
                  {profile.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  {profile.summary}
                </p>
                <div className="mt-5 space-y-2.5">
                  {profile.bullets.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <div className="mt-2 h-2 w-2 rounded-full bg-status-success" />
                      <span className="text-sm font-600 leading-relaxed text-text-primary">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div
            className={`section-board rounded-[30px] p-6 lg:p-8 ${
              visible ? "animate-slide-left" : "opacity-0"
            }`}
            style={{ animationDelay: "160ms" }}
          >
              <div className="text-sm font-700 uppercase tracking-[0.22em] text-brand-500/75">
              Qualification
              </div>
              <div className="mt-4 text-2xl font-700 text-text-primary">
              이런 조건이면 우선 검토 대상입니다
              </div>

            <div className="mt-6 space-y-3">
              {TARGET_FIT.decisionSignals.map((signal) => (
                <div
                  key={signal}
                  className="rounded-[22px] border border-status-success/14 bg-status-success/5 px-4 py-4 text-sm font-600 leading-relaxed text-text-primary"
                >
                  {signal}
                </div>
              ))}
            </div>

            <div className="section-divider my-6" />

            <div className="text-sm font-700 uppercase tracking-[0.22em] text-text-secondary">
              후순위 유입
            </div>
            <div className="mt-4 space-y-3">
              {TARGET_FIT.notFit.map((item) => (
                <div
                  key={item}
                  className="rounded-[20px] border border-border bg-background/78 px-4 py-3 text-sm leading-relaxed text-text-secondary"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
