import { COVERAGE } from "@/constants/content";
import { useIntersection } from "@/lib/use-intersection";
import { SectionHeading } from "@/components/section-heading";

export function CoverageStripSection() {
  const { ref, visible } = useIntersection();

  return (
    <section ref={ref} className="relative py-22 lg:py-30">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/42 to-transparent" />

      <div className="relative mx-auto max-w-[1440px] px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
          <SectionHeading
            eyebrow="적용 범위"
            title="하나의 기준본 위에 데이터 범위를 단계적으로 확장합니다"
            description="현재 다루는 영역과 이후 연결될 데이터를 분리해 보여주면, 제품의 현재 범위와 확장 방향이 동시에 읽힙니다."
            className={visible ? "animate-fade-up" : "opacity-0"}
          />

          <div className="space-y-4">
            {COVERAGE.lanes.map((lane, index) => (
              <div
                key={lane.label}
                className={`section-board rounded-[28px] p-5 lg:p-6 ${
                  visible ? "animate-fade-up" : "opacity-0"
                }`}
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-700 text-text-primary">{lane.label}</div>
                    <div className="mt-1 text-sm text-text-secondary">{lane.note}</div>
                  </div>
                  <div className="rounded-full border border-border bg-background/76 px-3 py-1.5 text-[11px] font-700 uppercase tracking-[0.16em] text-text-secondary">
                    {index === 2 ? "확장 예정" : "현재 범위"}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  {lane.items.map((item) => (
                    <span
                      key={item}
                      className={`rounded-full border px-4 py-2 text-sm font-600 ${
                        index === 2
                          ? "border-dashed border-border bg-background/76 text-text-secondary"
                          : "border-border bg-surface text-text-primary"
                      }`}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
