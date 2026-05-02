import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { APP_LOGIN_URL, APP_SIGNUP_URL } from "@/constants/urls";

const navLinks = [
  { label: "제품", href: "/#features" },
  { label: "도입", href: "/#workflow" },
  { label: "요금제", href: "/pricing" },
  { label: "고객사례", href: "/#" },
  { label: "문서", href: "/#" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`lp2-nav ${scrolled ? "scrolled" : ""}`}>
      <div className="wrap lp2-nav-inner">
        <Link to="/" className="lp2-brand">
          <div className="lp2-brand-mark">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="lp2-brand-wm">Fabbit</div>
        </Link>
        <nav className="lp2-nav-links">
          {navLinks.map((l) =>
            l.href.startsWith("/#") ? (
              <a key={l.label} href={l.href}>
                {l.label}
              </a>
            ) : (
              <Link key={l.label} to={l.href}>
                {l.label}
              </Link>
            ),
          )}
        </nav>
        <div className="lp2-nav-right">
          <a className="lp2-btn ghost" href={APP_LOGIN_URL}>
            로그인
          </a>
          <a className="lp2-btn primary" href={APP_SIGNUP_URL}>
            무료로 시작
          </a>
        </div>
      </div>
    </header>
  );
}
