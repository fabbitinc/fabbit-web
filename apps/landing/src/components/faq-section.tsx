import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQ_ITEMS } from "@/constants/content";
import { useIntersection } from "@/lib/use-intersection";
import { SectionHeading } from "@/components/section-heading";

export function FAQSection() {
  const { ref, visible } = useIntersection();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section ref={ref} className="pt-16 pb-22 lg:pt-18 lg:pb-30">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        <SectionHeading
          anchorId="faq"
          eyebrow="자주 묻는 질문"
          title="도입 검토 단계에서 자주 나오는 질문을 먼저 정리합니다"
          description="도입 방식, 화면 준비 상태, 제품 증거 표현 방식 같은 질문을 미리 닫아 두면 마지막 CTA까지 흐름이 안정됩니다."
          className={visible ? "animate-fade-up" : "opacity-0"}
        />

        <div className="mt-10 space-y-4">
          {FAQ_ITEMS.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.q}
                className={`section-board overflow-hidden rounded-[26px] ${
                  visible ? "animate-fade-up" : "opacity-0"
                }`}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left lg:px-7 lg:py-6"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-700 text-text-primary lg:text-lg">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-text-secondary transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-200 ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-border px-6 py-5 lg:px-7 lg:py-6">
                      <p className="text-sm leading-relaxed text-text-secondary lg:text-base">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
