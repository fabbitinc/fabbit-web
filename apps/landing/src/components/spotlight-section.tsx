import { SPOTLIGHT } from "@/constants/content";
import { trackEvent } from "@/lib/tracking";
import { useIntersection } from "@/lib/use-intersection";

const SIGNAL_CARDS = [
  { title: "도면 입력", detail: "도면 1건 업로드 후 인식 시작" },
  { title: "AI 인식", detail: "품목, 규격, 수량 자동 분리" },
  { title: "검토 연결", detail: "검토 항목과 상태가 한 화면에 표시" },
];

export function SpotlightSection() {
  const { ref, visible } = useIntersection();

  return (
    <section ref={ref} className="relative py-12 lg:py-18">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <div
          className={`ink-board overflow-hidden rounded-[38px] px-6 py-8 text-background lg:px-10 lg:py-10 ${
            visible ? "animate-scale-in" : "opacity-0"
          }`}
        >
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-start">
            <div className={visible ? "animate-fade-up" : "opacity-0"}>
              <div className="text-sm font-700 uppercase tracking-[0.26em] text-background/58">
                핵심 시나리오
              </div>
              <h2 className="mt-5 font-display text-3xl font-700 tracking-tight text-background sm:text-[2.9rem] sm:leading-[1.06]">
                {SPOTLIGHT.title.split("\n").map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-background/72 lg:text-lg">
                {SPOTLIGHT.description}
              </p>

              <div className="mt-7 flex flex-wrap gap-2.5">
                {SPOTLIGHT.steps.map((step, index) => (
                  <span
                    key={step}
                    className="rounded-full border border-background/12 bg-background/7 px-4 py-2 text-sm font-700 text-background/82"
                  >
                    {index + 1}. {step}
                  </span>
                ))}
              </div>

              <div className="mt-8 space-y-3">
                {SPOTLIGHT.bullets.map((item, index) => (
                  <div
                    key={item}
                    className="rounded-[22px] border border-background/10 bg-background/6 px-4 py-4 backdrop-blur-sm"
                  >
                    <div className="text-[11px] font-700 uppercase tracking-[0.2em] text-background/46">
                      0{index + 1}
                    </div>
                    <div className="mt-2 text-sm leading-relaxed text-background/78 lg:text-base">
                      {item}
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="#lead-form"
                onClick={() => trackEvent("demo_cta_click")}
                className="mt-9 inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-base font-700 text-text-primary shadow-lg transition-transform hover:-translate-y-0.5"
              >
                제품 데모 요청
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8h10m0 0L9 4m4 4L9 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>

            <div className={visible ? "animate-slide-left" : "opacity-0"} style={{ animationDelay: "120ms" }}>
              <div className="rounded-[32px] border border-background/10 bg-background/6 p-4 backdrop-blur-sm lg:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-background/10 bg-background/7 px-4 py-3">
                  <div>
                    <div className="text-sm font-700 text-background">첫 입력 시나리오</div>
                    <div className="mt-1 text-xs font-600 uppercase tracking-[0.18em] text-background/48">
                      업로드부터 기준본 생성까지
                    </div>
                  </div>
                  <div className="rounded-full bg-background px-3 py-1.5 text-xs font-700 text-text-primary">
                    운영 장면
                  </div>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.16fr)_minmax(0,0.84fr)]">
                  <div className="rounded-[28px] border border-background/10 bg-background p-5 text-text-primary shadow-2xl shadow-black/10">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-base font-700">DWG / PDF 업로드</div>
                        <div className="mt-1 text-xs text-text-secondary">assembly-main-revB.dwg · 14.2MB</div>
                      </div>
                      <span className="status-chip" data-tone="success">
                        업로드 완료
                      </span>
                    </div>

                    <div className="mt-5 rounded-[22px] border border-dashed border-border bg-brand-50/72 p-4">
                      <div className="flex aspect-[1.28/1] flex-col justify-between rounded-[18px] border border-border/70 bg-white/76 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="rounded-full bg-brand-500/12 px-3 py-1.5 text-xs font-700 text-brand-500">
                            production-bom-v2.dwg
                          </div>
                          <div className="text-xs font-700 text-text-secondary">자동 인식 대기열 1건</div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          {["부품 32개", "규격 11건", "검토 2건"].map((item) => (
                            <div key={item} className="rounded-[16px] border border-border bg-surface px-3 py-3 text-sm font-700">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {[
                        ["입력 파일", "DWG / PDF"],
                        ["결과 형태", "구조화 BOM"],
                        ["후속 연결", "검토 / 리비전"],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-[18px] border border-border bg-surface px-3 py-3">
                          <div className="text-[11px] font-700 uppercase tracking-[0.16em] text-text-secondary">
                            {label}
                          </div>
                          <div className="mt-2 text-sm font-700 text-text-primary">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[26px] border border-background/10 bg-background/8 p-4">
                      <div className="text-sm font-700 text-background">인식 결과</div>
                      <div className="mt-4 space-y-3">
                        {[
                          ["FBT-201", "메인 프레임", "추출 완료"],
                          ["FBT-202", "센서 브라켓", "검토 필요"],
                          ["FBT-203", "제어 커버", "등록 준비"],
                        ].map(([code, label, status]) => (
                          <div key={code} className="rounded-[18px] border border-background/10 bg-background/8 px-3 py-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-sm font-700 text-background">{code}</div>
                              <div className="text-xs text-background/54">{status}</div>
                            </div>
                            <div className="mt-2 text-xs text-background/68">{label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[26px] border border-background/10 bg-background/8 p-4">
                      <div className="text-sm font-700 text-background">등록 전 검토</div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                        {SIGNAL_CARDS.map((item) => (
                          <div key={item.title} className="rounded-[18px] border border-background/10 bg-background/8 px-3 py-3">
                            <div className="text-sm font-700 text-background">{item.title}</div>
                            <div className="mt-2 text-xs leading-relaxed text-background/62">{item.detail}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
