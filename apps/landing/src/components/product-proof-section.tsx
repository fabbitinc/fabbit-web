import { PRODUCT_SCREENS } from "@/constants/content";
import { SectionHeading } from "@/components/section-heading";
import { useIntersection } from "@/lib/use-intersection";

type ProductLayout = (typeof PRODUCT_SCREENS)[number]["layout"];

function renderPreview(layout: ProductLayout, isUpcoming: boolean) {
  switch (layout) {
    case "workspace":
      return (
        <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="space-y-3">
            {[
              ["프로젝트", "2개 활성"],
              ["도면", "12개 등록"],
              ["BOM", "기준본 유지"],
              ["대시보드", "최근 업데이트"],
            ].map(([item, note]) => (
              <div key={item} className="rounded-[18px] border border-border bg-background/76 px-3 py-3">
                <div className="text-sm font-700 text-text-primary">{item}</div>
                <div className="mt-1 text-xs text-text-secondary">{note}</div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="rounded-[22px] border border-border bg-background/78 p-4">
              <div className="grid gap-4 sm:grid-cols-[1.25fr_0.75fr]">
                <div className="dash-panel rounded-[18px] p-4">
                  <div className="flex aspect-[1.24/1] flex-col items-center justify-center rounded-[14px] border border-dashed border-border bg-brand-50/55">
                    <div className="rounded-[18px] bg-brand-500/12 px-4 py-3 text-sm font-700 text-brand-500">
                      assy-frame-v3.pdf
                    </div>
                    <div className="mt-4 text-sm font-600 text-text-secondary">
                      업로드 후 자동 인식 시작
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    ["품목 인식", "32개 항목"],
                    ["검토 필요", "2개 항목"],
                    ["등록 준비", "BOM 생성"],
                  ].map(([title, detail]) => (
                    <div key={title} className="rounded-[18px] border border-border bg-surface p-3">
                      <div className="text-sm font-700 text-text-primary">{title}</div>
                      <div className="mt-1 text-xs text-text-secondary">{detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["도면", "PDF / DWG"],
                ["인식", "부품표 분리"],
                ["등록", "구조화 BOM"],
              ].map(([item, detail]) => (
                <div key={item} className="rounded-[18px] border border-border bg-background/76 p-3">
                  <div className="text-xs font-700 uppercase tracking-[0.14em] text-text-secondary">
                    {item}
                  </div>
                  <div className="mt-2 text-sm font-700 text-text-primary">{detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case "tree":
      return (
        <div className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-[22px] border border-border bg-background/76 p-4">
            <div className="text-sm font-700 text-text-primary">BOM 트리</div>
            <div className="mt-4 space-y-2.5">
              {[
                ["ASSY-001", "w-4/5", ""],
                ["FRAME-210", "w-3/5", "ml-4"],
                ["BRKT-214", "w-2/5", "ml-8"],
                ["CTRL-301", "w-1/2", "ml-4"],
              ].map(([item, width, margin]) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-brand-500/70" />
                  <div className={`rounded-full bg-text-primary/8 px-3 py-1.5 text-xs font-700 text-text-primary ${margin} ${width}`}>
                    {item}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["품목 속성", "재질 / 규격 / 수량"],
              ["공급사", "거래처 / 리드타임"],
              ["리비전", "Rev.B 비교 상태"],
              ["이슈 연결", "ECO / 승인 요청"],
            ].map(([item, detail]) => (
              <div key={item} className="rounded-[22px] border border-border bg-surface p-4">
                <div className="text-sm font-700 text-text-primary">{item}</div>
                <div className="mt-2 text-xs text-text-secondary">{detail}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case "timeline":
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="relative rounded-[24px] border border-border bg-background/76 p-4 lg:p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-status-info/12 text-sm font-800 text-status-info">
                  0{item}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-700 text-text-primary">
                    {item === 1 ? "변경 요청 생성" : item === 2 ? "승인 검토 진행" : "현장 반영 확인"}
                  </div>
                  <div className="mt-1 text-xs text-text-secondary">
                    {item === 1
                      ? "설계 기준본 변경 요청 등록"
                      : item === 2
                        ? "담당자 검토 및 승인 상태 노출"
                        : "후속 작업과 이슈 연결"}
                  </div>
                </div>
                <div className="status-chip" data-tone={item === 3 ? "success" : item === 2 ? "warning" : "info"}>
                  {item === 1 ? "접수" : item === 2 ? "검토" : "완료"}
                </div>
              </div>
            </div>
          ))}
        </div>
      );

    case "roadmap":
      return (
        <div className="grid gap-4 md:grid-cols-3">
          {["작업지시", "실적", "품질"].map((item) => (
            <div
              key={item}
              className={`rounded-[24px] border p-4 lg:p-5 ${
                isUpcoming
                  ? "border-dashed border-border bg-background/76"
                  : "border-border bg-surface"
              }`}
            >
              <div className="text-sm font-700 text-text-primary">{item}</div>
              <div className="mt-2 text-xs text-text-secondary">
                {item === "작업지시"
                  ? "설계 기준본 기준 작업 전달"
                  : item === "실적"
                    ? "후속 실적 흐름 연결"
                    : "품질 이슈 추적 확장"}
              </div>
            </div>
          ))}
        </div>
      );
  }
}

export function ProductProofSection() {
  const { ref, visible } = useIntersection();
  const spanClasses = ["xl:col-span-8", "xl:col-span-4", "xl:col-span-4", "xl:col-span-8"];
  const offsetClasses = ["", "xl:translate-y-8", "xl:-translate-y-2", "xl:translate-y-6"];

  return (
    <section ref={ref} className="pt-16 pb-24 lg:pt-20 lg:pb-30">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <div
          className={`midnight-board relative overflow-hidden rounded-[40px] px-6 py-6 text-background lg:px-8 lg:py-8 ${
            visible ? "animate-scale-in" : "opacity-0"
          }`}
        >
          <SectionHeading
            anchorId="proof"
            eyebrow="제품 화면"
            title="현재 제품 구조와 확장 방향을 화면 중심으로 보여줍니다"
            description="실제 캡처가 아직 전부 준비되지 않아도, 워크스페이스, 트리, 타임라인, 로드맵을 화면형 카드로 정리하면 제품 신뢰가 빠르게 올라갑니다."
            tone="inverse"
            className={visible ? "animate-fade-up" : "opacity-0"}
          />

          <div className="mt-8 grid gap-3 md:grid-cols-4">
            {[
              ["현재 중심", "도면 업로드에서 구조화 BOM까지"],
              ["기준본", "트리·상세 패널·속성 보드"],
              ["변경 흐름", "요청, 승인, 반영 상태 노출"],
              ["확장 영역", "생산·품질·후속 연결 로드맵"],
            ].map(([title, detail], index) => (
              <div
                key={title}
                className={`rounded-[22px] border px-4 py-4 ${
                  index === 0
                    ? "border-background/10 bg-background text-text-primary"
                    : "border-background/10 bg-background/7 text-background"
                } ${visible ? "animate-fade-up" : "opacity-0"}`}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div
                  className={`text-[11px] font-700 uppercase tracking-[0.18em] ${
                    index === 0 ? "text-brand-500/72" : "text-background/48"
                  }`}
                >
                  화면 신호
                </div>
                <div
                  className={`mt-2 text-sm font-700 ${
                    index === 0 ? "text-text-primary" : "text-background"
                  }`}
                >
                  {title}
                </div>
                <div
                  className={`mt-2 text-xs leading-relaxed ${
                    index === 0 ? "text-text-secondary" : "text-background/66"
                  }`}
                >
                  {detail}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-5 xl:grid-cols-12">
            {PRODUCT_SCREENS.map((screen, index) => {
              const isUpcoming = screen.status === "준비 중";
              const cardClass = isUpcoming
                ? "dash-panel bg-background/88"
                : index === 0
                  ? "bg-background text-text-primary shadow-2xl shadow-black/20"
                  : "midnight-panel text-background";

              return (
                <article
                  key={screen.title}
                  className={`${spanClasses[index]} ${offsetClasses[index]} overflow-hidden rounded-[32px] border p-5 transition-transform duration-300 lg:p-6 ${cardClass} ${
                    visible ? "animate-fade-up" : "opacity-0"
                  }`}
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div
                        className={`text-[11px] font-700 uppercase tracking-[0.22em] ${
                          index === 0 && !isUpcoming
                            ? "text-brand-500/75"
                            : isUpcoming
                              ? "text-brand-500/75"
                              : "text-background/48"
                        }`}
                      >
                        {index < 3 ? "현재 화면" : "로드맵"}
                      </div>
                      <h3
                        className={`mt-3 text-xl font-700 ${
                          index === 0 && !isUpcoming
                            ? "text-text-primary"
                            : isUpcoming
                              ? "text-text-primary"
                              : "text-background"
                        }`}
                      >
                        {screen.title}
                      </h3>
                      <p
                        className={`mt-2 text-sm leading-relaxed lg:text-base ${
                          index === 0 && !isUpcoming
                            ? "text-text-secondary"
                            : isUpcoming
                              ? "text-text-secondary"
                              : "text-background/68"
                        }`}
                      >
                        {screen.message}
                      </p>
                    </div>
                    <div
                      className={`rounded-full px-3 py-1.5 text-[11px] font-700 uppercase tracking-[0.16em] ${
                        isUpcoming
                          ? "border border-status-warning/20 bg-status-warning/8 text-status-warning"
                          : "border border-status-success/20 bg-status-success/8 text-status-success"
                      }`}
                    >
                      {screen.status}
                    </div>
                  </div>

                  <div
                    className={`mt-5 rounded-[26px] border p-4 lg:p-5 ${
                      index === 0 && !isUpcoming
                        ? "border-border bg-surface/72"
                        : isUpcoming
                          ? "border-border bg-background/80"
                          : "border-background/10 bg-background/6"
                    }`}
                  >
                    {renderPreview(screen.layout, isUpcoming)}
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
