import { PROBLEMS } from "@/constants/content";
import { useIntersection } from "@/lib/use-intersection";
import { SectionHeading } from "@/components/section-heading";

const BREAK_STAGES = [
  {
    title: "도면 수집",
    detail: "업로드와 최신본 판별이 파일 단위로 흩어진 채 시작됩니다.",
    chips: ["최신본 설명", "업로드 이력 부재"],
  },
  {
    title: "BOM 정리",
    detail: "구조화되지 않은 상태로 엑셀과 로컬 파일에 분산됩니다.",
    chips: ["중복 입력", "기준본 불명확"],
  },
  {
    title: "변경 전파",
    detail: "승인, 전달, 반영 상태가 분리되어 추적이 어려워집니다.",
    chips: ["리비전 혼선", "반영 지연"],
  },
  {
    title: "생산 연결",
    detail: "현장 이슈가 설계 기준본으로 다시 올라오지 않습니다.",
    chips: ["후속 연결 단절", "이슈 히스토리 누락"],
  },
] as const;

export function ProblemSection() {
  const { ref, visible } = useIntersection();

  return (
    <section ref={ref} className="relative pt-16 pb-24 lg:pt-20 lg:pb-30">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/46 to-transparent" />

      <div className="relative mx-auto max-w-[1440px] px-6 lg:px-10">
        <SectionHeading
          anchorId="problem"
          eyebrow="운영 이슈"
          title="도면과 BOM이 분리되는 순간 운영 비용이 커집니다"
          description="반복 입력, 최신본 혼선, 변경 반영 지연, 현장 피드백 단절은 각각의 문제가 아니라 하나의 기준본이 부재할 때 같이 나타나는 현상입니다."
          className={visible ? "animate-fade-up" : "opacity-0"}
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="grid gap-5 md:grid-cols-2">
            {PROBLEMS.map((problem, index) => (
              <article
                key={problem.title}
                className={`section-board rounded-[30px] p-6 lg:p-7 ${
                  visible ? "animate-fade-up" : "opacity-0"
                }`}
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-status-danger/18 bg-status-danger/6 px-3 py-1 text-[11px] font-700 uppercase tracking-[0.16em] text-status-danger">
                    {problem.tag}
                  </span>
                  <span className="text-[11px] font-700 uppercase tracking-[0.16em] text-text-secondary">
                    운영 손실
                  </span>
                </div>
                <h3 className="mt-5 font-display text-[1.45rem] font-700 text-text-primary">
                  {problem.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-text-primary">
                  “{problem.quote}”
                </p>
                <p className="mt-4 text-sm leading-relaxed text-text-secondary lg:text-base">
                  {problem.detail}
                </p>
              </article>
            ))}
          </div>

          <div
            className={`midnight-board overflow-hidden rounded-[34px] p-6 text-background lg:p-8 ${
              visible ? "animate-slide-left" : "opacity-0"
            }`}
            style={{ animationDelay: "160ms" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-700 uppercase tracking-[0.22em] text-background/56">
                  운영 단절
                </div>
                <div className="mt-2 text-2xl font-700 text-background">
                  기준본이 없을 때 끊기는 흐름
                </div>
              </div>
              <div className="rounded-full border border-background/10 bg-background/8 px-3 py-1.5 text-[11px] font-700 uppercase tracking-[0.16em] text-background/70">
                기준본 공백
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {BREAK_STAGES.map((stage, index) => (
                <div key={stage.title} className="relative">
                  <div className="rounded-[24px] border border-background/10 bg-background/7 p-4 backdrop-blur-sm lg:p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-background text-sm font-800 text-text-primary">
                        0{index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-base font-700 text-background">{stage.title}</div>
                        <p className="mt-2 text-sm leading-relaxed text-background/66 lg:text-base">
                          {stage.detail}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {stage.chips.map((chip) => (
                            <span
                              key={chip}
                              className="rounded-full border border-background/10 bg-background/7 px-3 py-1 text-xs font-700 text-background/72"
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {index < BREAK_STAGES.length - 1 ? (
                    <div className="ml-5 h-6 border-l border-dashed border-background/14" />
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {[
                ["중복 입력", "도면을 보고 다시 옮기는 반복"],
                ["최신본 혼선", "누가 무엇을 기준으로 보는지 불명확"],
                ["반영 지연", "설계 변경이 현장까지 닿는 시간이 길어짐"],
              ].map(([title, detail]) => (
                <div key={title} className="rounded-[22px] border border-background/10 bg-background/7 px-4 py-4 backdrop-blur-sm">
                  <div className="text-sm font-700 text-background">{title}</div>
                  <div className="mt-2 text-xs leading-relaxed text-background/62">{detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
