import { FINAL_FORM_FIELDS } from "@/constants/content";
import { trackEvent } from "@/lib/tracking";
import { useIntersection } from "@/lib/use-intersection";

export function FinalCTASection() {
  const { ref, visible } = useIntersection();

  return (
    <section ref={ref} id="final-cta" className="relative py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="blueprint-grid absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 via-accent-500/6 to-brand-500/4" />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-6 lg:px-10">
        <div
          className={`section-board overflow-hidden rounded-[36px] ${
            visible ? "animate-scale-in" : "opacity-0"
          }`}
        >
          <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="relative overflow-hidden bg-text-primary px-6 py-8 text-background lg:px-10 lg:py-12">
              <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand-500/24 to-transparent" />
              <div className="relative">
                <div className="text-sm font-700 uppercase tracking-[0.24em] text-background/62">
                  도입 제안
                </div>
                <h2 className="mt-5 font-display text-3xl font-700 tracking-tight text-background sm:text-[2.7rem] sm:leading-[1.08]">
                  도입 검토용 데모와
                  <br />
                  파일럿을 먼저 시작하세요
                </h2>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-background/74 lg:text-lg">
                  도면과 BOM을 어떤 방식으로 운영 중인지, 어디서 가장 큰 병목이 생기는지만
                  적어 주시면 현재 단계에 맞는 데모와 파일럿 범위를 빠르게 정리할 수 있습니다.
                </p>

                <div className="mt-8 space-y-3">
                  {[
                    "대표, 설계팀장, 생산기술 담당자가 바로 검토할 수 있는 구조",
                    "현재 운영 맥락을 바로 적을 수 있는 문의 폼",
                    "데모 요청과 파일럿 상담이 같은 화면에서 닫히는 구조",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <div className="mt-2 h-2 w-2 rounded-full bg-accent-500" />
                      <span className="text-sm leading-relaxed text-background/76 lg:text-base">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-2.5">
                  {["도입 문의", "데모 요청", "파일럿 선별"].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-background/12 bg-background/7 px-4 py-2 text-sm font-700 text-background"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div id="lead-form" className="px-6 py-8 lg:px-10 lg:py-12">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-700 uppercase tracking-[0.22em] text-brand-500/75">
                    문의 폼
                  </div>
                  <div className="mt-2 text-2xl font-700 text-text-primary">
                    도입 문의 보내기
                  </div>
                </div>
                <div className="rounded-full border border-border bg-background/78 px-3 py-1.5 text-[11px] font-700 uppercase tracking-[0.16em] text-text-secondary">
                  파일럿 문의
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {FINAL_FORM_FIELDS.map((field) => {
                  const isWide = "wide" in field && field.wide;

                  return (
                    <div
                      key={field.label}
                      className={isWide ? "sm:col-span-2" : ""}
                    >
                      <div className="field-label">{field.label}</div>
                      <div className="mock-field mt-2 px-4 py-4 text-sm text-text-secondary">
                        {field.placeholder}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-[24px] border border-border bg-background/78 p-4 lg:p-5">
                <div className="text-sm font-700 text-text-primary">도입 안내</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["10~49명 제조팀", "ERP 사용 중", "도면/BOM 엑셀 운영"].map((item) => (
                    <span key={item} className="sample-tag">
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-4 text-sm leading-relaxed text-text-secondary">
                  현재 운영 방식과 검토 중인 범위를 남겨주시면, 제품 데모와 파일럿 우선순위를 함께 정리해 드립니다.
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => trackEvent("lead_form_start")}
                  className="inline-flex items-center justify-center rounded-full bg-brand-500 px-6 py-3.5 text-base font-700 text-white shadow-lg shadow-brand-500/18 transition-all hover:bg-brand-600"
                >
                  무료 파일럿 신청
                </button>
                <button
                  type="button"
                  onClick={() => trackEvent("demo_cta_click")}
                  className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-6 py-3.5 text-base font-700 text-text-primary transition-all hover:border-brand-500/25"
                >
                  제품 데모 요청
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
