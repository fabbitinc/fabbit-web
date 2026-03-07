import { HERO } from "@/constants/content";
import { trackEvent } from "@/lib/tracking";
import { useIntersection } from "@/lib/use-intersection";

const NAV_LINKS = ["프로젝트", "도면", "BOM", "변경 요청", "대시보드"];

const REVIEW_ITEMS = [
  { title: "FBT-210 프레임 본체", meta: "도면 인식 완료", tone: "success" as const },
  { title: "M8 볼트 세트", meta: "수량 검토 필요", tone: "warning" as const },
  { title: "제어부 브라켓", meta: "Rev.B 반영 대기", tone: "info" as const },
];

const BOM_ROWS = [
  ["FBT-210", "프레임 본체", "SUS304", "1EA", "승인"],
  ["FBT-214", "브라켓 세트", "AL6061", "4EA", "검토"],
  ["FBT-301", "제어 모듈", "Rev.B", "1EA", "변경"],
];

export function HeroSection() {
  const { ref, visible } = useIntersection(0.1);
  const headlineLines = HERO.headline.split("\n");

  return (
    <section
      ref={ref}
      className="relative overflow-hidden px-0 pt-28 pb-12 lg:pt-32 lg:pb-18 xl:pt-36"
    >
      <div className="blueprint-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-brand-500/8 to-transparent" />
      <div className="pointer-events-none absolute top-24 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-[1520px] px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(560px,1.08fr)] lg:items-start xl:grid-cols-[minmax(0,0.82fr)_minmax(640px,1.18fr)] xl:gap-12">
          <div className={visible ? "animate-fade-up lg:pt-6 xl:pt-10" : "opacity-0"}>
            <div className="inline-flex rounded-full border border-brand-500/20 bg-brand-50 px-4 py-2 text-xs font-700 uppercase tracking-[0.24em] text-brand-500">
              {HERO.eyebrow}
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              {HERO.badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-border bg-background/82 px-4 py-2 text-sm font-700 text-text-secondary shadow-sm"
                >
                  {badge}
                </span>
              ))}
            </div>

            <h1 className="mt-7 max-w-[620px] font-display text-[2.75rem] leading-[0.98] font-800 tracking-[-0.05em] text-text-primary sm:text-[3.25rem] lg:text-[3.45rem] xl:text-[3.8rem]">
              {headlineLines.map((line, index) => (
                <span key={line} className="block">
                  {index === 1 ? <span className="gradient-text">{line}</span> : line}
                </span>
              ))}
            </h1>

            <p className="mt-5 max-w-[600px] text-[15px] leading-relaxed text-text-secondary lg:text-[17px]">
              {HERO.sub}
            </p>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row">
              <a
                href="#lead-form"
                onClick={() => trackEvent("hero_cta_click")}
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-brand-500 px-8 py-4 text-base font-700 text-white shadow-xl shadow-brand-500/18 transition-all hover:bg-brand-600 hover:shadow-2xl"
              >
                무료 파일럿 신청
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
              <a
                href="#lead-form"
                onClick={() => trackEvent("demo_cta_click")}
                className="inline-flex items-center justify-center gap-2.5 rounded-full border border-border bg-surface px-8 py-4 text-base font-700 text-text-primary transition-all hover:border-brand-500/30 hover:shadow-lg"
              >
                제품 데모 요청
              </a>
            </div>

            <div className="mt-7 grid max-w-[620px] gap-2.5 sm:grid-cols-[1fr_1fr_0.92fr]">
              {HERO.focusCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-[20px] border border-border bg-background/82 px-4 py-3.5 shadow-sm shadow-text-primary/4 backdrop-blur-sm"
                >
                  <div className="text-[10px] font-700 uppercase tracking-[0.2em] text-brand-500/70">
                    {card.label}
                  </div>
                  <div className="mt-1.5 text-[15px] font-700 leading-snug text-text-primary">
                    {card.value}
                  </div>
                  <p className="mt-1.5 text-[12px] leading-5 text-text-secondary">
                    {card.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            className={visible ? "animate-scale-in lg:mt-2" : "opacity-0"}
            style={{ animationDelay: "180ms" }}
          >
            <div className="relative">
              <div className="workspace-shell relative overflow-hidden rounded-[38px] p-3.5 text-background lg:p-4">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand-500/18 to-transparent" />
                <div className="relative flex flex-wrap items-center justify-between gap-3 rounded-[24px] workspace-panel px-4 py-3">
                  <div>
                    <div className="text-sm font-700 text-background">Fabbit 워크스페이스</div>
                    <div className="mt-1 text-xs font-600 uppercase tracking-[0.18em] text-background/48">
                      프로젝트 / 리비전 / 변경 추적
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="workspace-soft rounded-full px-3 py-1.5 text-xs font-700 text-background">
                      프로젝트
                    </div>
                    <div className="workspace-soft rounded-full px-3 py-1.5 text-xs font-700 text-background">
                      리비전
                    </div>
                    <div className="workspace-soft rounded-full px-3 py-1.5 text-xs font-700 text-background">
                      변경 추적
                    </div>
                  </div>
                </div>

                <div className="relative mt-3.5 grid gap-3.5 lg:grid-cols-[164px_minmax(0,1fr)]">
                  <div className="space-y-4">
                    <div className="workspace-panel rounded-[24px] p-3.5">
                      <div className="text-[11px] font-700 uppercase tracking-[0.22em] text-background/48">
                        탐색
                      </div>
                      <div className="mt-3 space-y-2.5">
                        {NAV_LINKS.map((item, index) => (
                          <div
                            key={item}
                            className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${
                              index === 1
                                ? "bg-background text-text-primary"
                                : "workspace-soft text-background"
                            }`}
                          >
                            <div className={`h-2.5 w-2.5 rounded-full ${index === 1 ? "bg-brand-500" : "bg-background/50"}`} />
                            <span className={`text-sm font-600 ${index === 1 ? "text-text-primary" : "text-background"}`}>
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="workspace-panel rounded-[24px] p-3.5">
                      <div className="text-[11px] font-700 uppercase tracking-[0.22em] text-background/48">
                        최근 업데이트
                      </div>
                      <div className="mt-3 space-y-2.5">
                        {REVIEW_ITEMS.slice(0, 2).map((item) => (
                          <div key={item.title} className="workspace-soft rounded-2xl p-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-700 text-background">{item.title}</div>
                              <span className="status-chip" data-tone={item.tone}>
                                {item.tone === "success" ? "완료" : item.tone === "warning" ? "검토" : "대기"}
                              </span>
                            </div>
                            <div className="mt-2 text-xs text-background/58">{item.meta}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <div className="workspace-panel rounded-[28px] p-4 lg:p-[1.125rem]">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-base font-700 text-background">도면 업로드 / BOM 등록</div>
                          <div className="mt-1 text-xs font-600 uppercase tracking-[0.18em] text-background/48">
                            운영 중 프로젝트 · FBT Assembly v2
                          </div>
                        </div>
                        <div className="rounded-full bg-background px-3 py-1.5 text-xs font-700 text-text-primary">
                          메인 화면
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.08fr)_minmax(220px,0.92fr)]">
                        <div className="rounded-[24px] bg-background p-4 text-text-primary">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <div className="text-sm font-700">DWG / PDF 업로드</div>
                              <div className="mt-1 text-xs text-text-secondary">도면 인식 후 품목표 생성</div>
                            </div>
                            <span className="status-chip" data-tone="success">
                              준비 완료
                            </span>
                          </div>
                          <div className="mt-3 rounded-[20px] border border-dashed border-border bg-brand-50/70 p-3.5">
                            <div className="flex aspect-[1.18/1] flex-col items-center justify-center rounded-[16px] border border-border/70 bg-white/70">
                              <div className="rounded-[18px] bg-brand-500/12 px-4 py-3 text-sm font-700 text-brand-500">
                                production-bom-v2.dwg
                              </div>
                              <div className="mt-4 text-sm font-600 text-text-secondary">
                                업로드 후 품목, 규격, 수량 자동 분리
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2.5">
                          {[
                            { title: "인식 결과", detail: "32개 항목 분리" },
                            { title: "품목 검토", detail: "2개 항목 확인 필요" },
                            { title: "리비전 상태", detail: "Rev.B 비교 중" },
                          ].map((item) => (
                            <div
                              key={item.title}
                              className="workspace-soft rounded-[22px] p-3"
                            >
                              <div className="text-sm font-700 text-background">{item.title}</div>
                              <div className="mt-2 text-xs text-background/58">{item.detail}</div>
                              <div className="workspace-divider mt-3" />
                              <div className="mt-3 flex items-center justify-between text-xs text-background/62">
                                <span>상태 동기화</span>
                                <span>열기</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3.5 rounded-[24px] bg-background p-3.5 text-text-primary">
                        <div className="grid grid-cols-[1.2fr_1.2fr_0.9fr_0.7fr_0.8fr] gap-3 border-b border-border pb-3 text-[11px] font-700 uppercase tracking-[0.14em] text-text-secondary">
                          <span>품목</span>
                          <span>설명</span>
                          <span>규격</span>
                          <span>수량</span>
                          <span>상태</span>
                        </div>
                        <div className="mt-2 space-y-1.5">
                          {BOM_ROWS.map(([id, name, spec, qty, status]) => (
                            <div
                              key={id}
                              className="grid grid-cols-[1.2fr_1.2fr_0.9fr_0.7fr_0.8fr] items-center gap-3 rounded-[16px] bg-surface px-3 py-2.5 text-sm"
                            >
                              <span className="font-700 text-brand-500">{id}</span>
                              <span>{name}</span>
                              <span className="text-text-secondary">{spec}</span>
                              <span>{qty}</span>
                              <span
                                className="status-chip"
                                data-tone={
                                  status === "승인"
                                    ? "success"
                                    : status === "검토"
                                      ? "warning"
                                      : "info"
                                }
                              >
                                {status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="workspace-panel rounded-[24px] p-3.5">
                        <div className="text-[11px] font-700 uppercase tracking-[0.22em] text-brand-500/75">
                          변경 대기
                        </div>
                        <div className="mt-3 space-y-2.5">
                          {[
                            ["BOM 수량 수정", "검토 중"],
                            ["리비전 비교", "승인 대기"],
                            ["협력사 메모", "반영 완료"],
                          ].map(([title, status]) => (
                            <div
                              key={title}
                              className="workspace-soft flex items-center gap-3 rounded-2xl px-3 py-2"
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background text-xs font-700 text-text-primary">
                                ECO
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-700 text-background">{title}</div>
                                <div className="mt-1 text-xs text-background/56">{status}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="workspace-panel rounded-[24px] p-3.5">
                        <div className="text-[11px] font-700 uppercase tracking-[0.22em] text-brand-500/75">
                          연결 데이터
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2.5">
                          {["작업지시", "실적", "품질", "이슈"].map((item) => (
                            <div
                              key={item}
                              className="workspace-soft rounded-2xl p-2.5"
                            >
                              <div className="text-sm font-700 text-background">{item}</div>
                              <div className="mt-2 text-xs text-background/56">연결 준비</div>
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
      </div>
    </section>
  );
}
