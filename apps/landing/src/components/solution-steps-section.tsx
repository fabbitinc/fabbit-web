import { SOLUTION_STEPS } from "@/constants/content";
import { useIntersection } from "@/lib/use-intersection";
import { SectionHeading } from "@/components/section-heading";

export function SolutionStepsSection() {
  const { ref, visible } = useIntersection();

  return (
    <section ref={ref} className="relative pt-16 pb-22 lg:pt-18 lg:pb-30">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/45 to-transparent" />

      <div className="relative mx-auto max-w-[1440px] px-6 lg:px-10">
        <SectionHeading
          anchorId="solution"
          eyebrow="제품 흐름"
          title="도면 입력, 기준본 관리, 확장 연결까지 하나의 흐름으로 보여줍니다"
          description="제품 구조가 복잡할수록 같은 크기의 카드보다 큰 화면과 단계별 설명을 함께 배치하는 편이 이해가 빠릅니다."
          className={visible ? "animate-fade-up" : "opacity-0"}
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className={visible ? "animate-slide-right" : "opacity-0"}>
            <div className="lg:sticky lg:top-28">
              <div className="section-board overflow-hidden rounded-[34px] p-4 lg:p-5">
                <div className="flex items-center justify-between gap-3 rounded-[24px] border border-border bg-background/82 px-4 py-3">
                  <div>
                    <div className="text-sm font-700 text-text-primary">기준본 워크스페이스</div>
                    <div className="mt-1 text-xs font-700 uppercase tracking-[0.18em] text-text-secondary">
                      입력 / 기준본 / 확장
                    </div>
                  </div>
                  <div className="rounded-full border border-brand-500/16 bg-brand-50 px-3 py-1 text-[11px] font-700 uppercase tracking-[0.16em] text-brand-500">
                    흐름 설계
                  </div>
                </div>

                <div className="mt-4 rounded-[28px] border border-border bg-background/80 p-4 lg:p-5">
                  <div className="grid gap-4">
                    <div className="rounded-[24px] border border-border bg-surface p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-base font-700 text-text-primary">기준본 워크스페이스</div>
                        <div className="mock-pill px-3 py-1.5 text-xs font-700 text-text-primary">중심 화면</div>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
                        <div className="dash-panel rounded-[22px] p-4">
                          <div className="text-xs font-700 uppercase tracking-[0.14em] text-text-secondary">업로드 큐</div>
                          <div className="mt-4 space-y-2.5">
                            {["도면 업로드", "품목 인식", "검토 대기", "등록 완료"].map((item) => (
                              <div key={item} className="flex items-center gap-3">
                                <div className="h-2.5 w-2.5 rounded-full bg-brand-500/75" />
                                <div className="rounded-full bg-text-primary/8 px-3 py-1.5 text-xs font-700 text-text-primary">
                                  {item}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="mock-block p-4">
                          <div className="grid grid-cols-3 gap-3">
                            {["품목", "규격", "상태"].map((item) => (
                              <div key={item} className="rounded-[18px] border border-border bg-background/74 p-3">
                                <div className="text-xs font-700 uppercase tracking-[0.14em] text-text-secondary">{item}</div>
                                <div className="mt-3 text-sm font-700 text-text-primary">
                                  {item === "품목" ? "FRAME-210" : item === "규격" ? "SUS304" : "승인"}
                                </div>
                                <div className="mt-1 text-xs text-text-secondary">
                                  {item === "품목" ? "메인 프레임" : item === "규격" ? "주요 자재" : "최신 기준본"}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        ["입력", "업로드와 인식"],
                        ["기준본", "구조화 BOM"],
                        ["확장", "이슈와 후속 연결"],
                      ].map(([item, detail]) => (
                        <div key={item} className="rounded-[22px] border border-border bg-background/78 p-4">
                          <div className="text-xs font-700 uppercase tracking-[0.16em] text-text-secondary">
                            {item}
                          </div>
                          <div className="mt-2 text-sm font-700 text-text-primary">{detail}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {SOLUTION_STEPS.map((step, index) => {
              const isUpcoming = step.status === "준비 중";
              return (
                <article
                  key={step.step}
                  className={`rounded-[30px] border p-6 lg:p-8 ${
                    isUpcoming
                      ? "dash-panel"
                      : "section-board"
                  } ${visible ? "animate-fade-up" : "opacity-0"}`}
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-base font-800 text-white shadow-lg shadow-brand-500/18">
                        0{step.step}
                      </div>
                      <div>
                        <div className="text-xs font-700 uppercase tracking-[0.18em] text-text-secondary">
                          {step.step}단계
                        </div>
                        <div className="mt-1 text-xl font-700 text-text-primary">{step.title}</div>
                      </div>
                    </div>
                    <div
                      className={`rounded-full px-3 py-1.5 text-[11px] font-700 uppercase tracking-[0.16em] ${
                        isUpcoming
                          ? "border border-status-warning/20 bg-status-warning/8 text-status-warning"
                          : "border border-status-success/20 bg-status-success/8 text-status-success"
                      }`}
                    >
                      {step.status}
                    </div>
                  </div>

                  <p className="mt-5 text-base leading-relaxed text-text-secondary lg:text-lg">
                    {step.description}
                  </p>

                  <div className="mt-5 rounded-[22px] border border-border bg-background/76 p-4">
                    <div className="text-sm font-700 text-brand-500">핵심 포인트</div>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">{step.compare}</p>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {step.points.map((point) => (
                      <div
                        key={point}
                        className="rounded-[20px] border border-border bg-background/76 px-4 py-3 text-sm font-600 text-text-primary"
                      >
                        {point}
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
