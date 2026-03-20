import { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { APP_SIGNUP_URL } from "@/constants/urls";

export function MobileStickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-0 inset-x-0 z-50 border-t border-[var(--lp-border-hover)] bg-[var(--lp-bg)]/90 backdrop-blur-xl p-4 md:hidden"
        >
          <Button
            as="a"
            href={APP_SIGNUP_URL}
            size="lg"
            fullWidth
            className="group bg-[var(--lp-brand)] font-[Outfit,sans-serif] font-semibold text-[var(--lp-on-brand)] shadow-xl shadow-[var(--lp-brand)]/25"
            endContent={
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            }
          >
            무료로 시작
          </Button>
          <p className="mt-2 text-center text-[10px] text-[var(--lp-text-dim)]">
            무료로 시작 · 역할별 좌석 과금
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
