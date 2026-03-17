import { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "문제", href: "#problem" },
  { label: "솔루션", href: "#solution" },
  { label: "기능", href: "#features" },
  { label: "비교", href: "#comparison" },
  { label: "요금제", href: "#pricing" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-[var(--lp-border)] bg-[var(--lp-bg)]/80 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <a href="#" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--lp-logo-from)] to-[var(--lp-logo-to)]">
              <span className="font-[Outfit,sans-serif] text-sm font-bold text-[var(--lp-on-brand)]">F</span>
            </div>
            <span className="font-[Outfit,sans-serif] text-lg font-bold tracking-tight">
              Fabbit
            </span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3.5 py-2 text-sm text-[var(--lp-text-tertiary)] transition-colors hover:bg-[var(--lp-border-hover)] hover:text-[var(--lp-text-strong)]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button
              variant="light"
              size="sm"
              className="text-sm text-[var(--lp-text-tertiary)] hover:text-[var(--lp-text-strong)]"
            >
              로그인
            </Button>
            <Button
              size="sm"
              className="bg-[var(--lp-brand)] font-medium text-[var(--lp-on-brand)] shadow-lg shadow-[var(--lp-brand)]/20"
            >
              시작하기
            </Button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--lp-text-tertiary)] hover:bg-[var(--lp-border-hover)] hover:text-[var(--lp-text-strong)] md:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-16 z-40 border-b border-[var(--lp-border)] bg-[var(--lp-bg)]/95 backdrop-blur-xl md:hidden"
          >
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm text-[var(--lp-text-tertiary)] transition-colors hover:bg-[var(--lp-border-hover)] hover:text-[var(--lp-text-strong)]"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-[var(--lp-border)] pt-4">
                <Button variant="light" className="justify-start text-[var(--lp-text-tertiary)]">
                  로그인
                </Button>
                <Button className="bg-[var(--lp-brand)] font-medium text-[var(--lp-on-brand)]">
                  시작하기
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
