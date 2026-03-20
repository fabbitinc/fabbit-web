import { useState } from "react";
import { Button } from "@heroui/react";
import { ArrowRight } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="border-t border-[var(--lp-border)] bg-[var(--lp-surface-dim)]">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          {/* Brand + Newsletter */}
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--lp-logo-from)] to-[var(--lp-logo-to)]">
                <span className="font-[Outfit,sans-serif] text-sm font-bold text-[var(--lp-on-brand)]">
                  F
                </span>
              </div>
              <span className="font-[Outfit,sans-serif] text-lg font-bold tracking-tight text-[var(--lp-text-strong)]">
                Fabbit
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[var(--lp-text-muted)]">
              AI 기반 중소 제조업 도면·BOM 관리 솔루션.
              <br />
              엑셀에서 시스템으로, 가장 쉬운 첫 걸음.
            </p>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-xs font-medium text-[var(--lp-text-tertiary)]">제품 업데이트 소식 받기</p>
              <div className="mt-2 flex gap-2">
                <input
                  type="email"
                  placeholder="work@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-lg border border-[var(--lp-border)] bg-[var(--lp-surface)] px-3 py-2 text-sm text-[var(--lp-text-strong)] placeholder-[var(--lp-text-dim)] outline-none transition-colors focus:border-[var(--lp-brand)]/30"
                />
                <Button
                  isIconOnly
                  size="sm"
                  className="border border-[var(--lp-border)] bg-transparent text-[var(--lp-text-tertiary)] hover:border-[var(--lp-brand)]/30 hover:text-[var(--lp-text-strong)]"
                >
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-10 md:grid-cols-3 md:gap-16">
            <div>
              <h4 className="font-[Outfit,sans-serif] text-sm font-semibold text-[var(--lp-text-strong)]">
                제품
              </h4>
              <ul className="mt-4 space-y-3">
                {[
                  { label: "기능 소개", href: "/#features" },
                  { label: "요금제", href: "/pricing" },
                  { label: "파일럿 신청", href: "#" },
                  { label: "업데이트", href: "#" },
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm text-[var(--lp-text-muted)] transition-colors hover:text-[var(--lp-text-secondary)]"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-[Outfit,sans-serif] text-sm font-semibold text-[var(--lp-text-strong)]">
                회사
              </h4>
              <ul className="mt-4 space-y-3">
                {["팀 소개", "블로그", "채용", "문의하기"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-[var(--lp-text-muted)] transition-colors hover:text-[var(--lp-text-secondary)]"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-[Outfit,sans-serif] text-sm font-semibold text-[var(--lp-text-strong)]">
                지원
              </h4>
              <ul className="mt-4 space-y-3">
                {["도움말 센터", "이용약관", "개인정보처리방침"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-[var(--lp-text-muted)] transition-colors hover:text-[var(--lp-text-secondary)]"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--lp-border)] pt-8 md:flex-row">
          <p className="text-xs text-[var(--lp-text-dim)]">
            &copy; 2026 Fabbit. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="rounded-full bg-[var(--lp-border)] px-3 py-1 text-xs text-[var(--lp-text-dim)]">
              경기도 소재
            </span>
            <span className="rounded-full bg-[var(--lp-border)] px-3 py-1 text-xs text-[var(--lp-text-dim)]">
              AI / 스마트제조
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
