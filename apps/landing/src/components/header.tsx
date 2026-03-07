import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS } from "@/constants/content";
import { trackEvent } from "@/lib/tracking";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-[1520px] px-6 pt-4 lg:px-10">
        <div
          className={`rounded-[30px] border px-4 py-3.5 transition-all duration-300 lg:px-6 ${
            scrolled
              ? "border-border/85 bg-background/86 shadow-xl shadow-text-primary/6 backdrop-blur-xl"
              : "border-border/72 bg-background/72 shadow-lg shadow-text-primary/4 backdrop-blur-md"
          }`}
        >
          <div className="flex items-center gap-4">
            <a href="#" className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-500 shadow-lg shadow-brand-500/20">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="font-display text-lg font-800 tracking-tight text-text-primary">
                  Fabbit
                </div>
                <div className="mt-0.5 text-[10px] font-700 uppercase tracking-[0.24em] text-text-secondary/72">
                  제조 데이터 플랫폼
                </div>
              </div>
            </a>

            <nav className="ml-6 hidden items-center gap-1.5 lg:flex">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-4 py-2.5 text-[14px] font-700 text-text-secondary transition-colors hover:bg-brand-50 hover:text-text-primary"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-3">
              <div className="hidden rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] font-700 uppercase tracking-[0.18em] text-text-secondary xl:inline-flex">
                제조팀 대상
              </div>
              <a
                href="#lead-form"
                onClick={() => trackEvent("hero_cta_click")}
                className="hidden rounded-full bg-brand-500 px-5 py-2.5 text-[14px] font-700 text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-600 lg:inline-flex"
              >
                무료 파일럿 신청
              </a>
              <button
                onClick={() => setMobileOpen((open) => !open)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface text-text-secondary transition-colors hover:bg-brand-50 lg:hidden"
                aria-label="메뉴"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {mobileOpen ? (
            <div className="mt-4 rounded-[24px] border border-border bg-background/94 p-3 shadow-xl shadow-text-primary/8 backdrop-blur-xl lg:hidden">
              <nav className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl px-4 py-3 text-base font-600 text-text-secondary transition-colors hover:bg-brand-50 hover:text-text-primary"
                  >
                    {item.label}
                  </a>
                ))}
                <a
                  href="#lead-form"
                  onClick={() => {
                    setMobileOpen(false);
                    trackEvent("hero_cta_click");
                  }}
                  className="mt-2 rounded-2xl bg-brand-500 px-4 py-3 text-center text-base font-700 text-white"
                >
                  무료 파일럿 신청
                </a>
              </nav>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
