import { NAV_ITEMS } from "@/constants/content";

export function Footer() {
  return (
    <footer className="border-t border-border/80 bg-surface/72 py-14 backdrop-blur-sm">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,0.55fr)_minmax(0,0.55fr)] lg:px-10">
        <div>
          <div className="flex items-center gap-3 font-display text-xl font-800 tracking-tight text-text-primary">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500 shadow-lg shadow-brand-500/18">
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
            Fabbit
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-text-secondary lg:text-base">
            설계부터 생산까지 이어지는 제조 데이터 플랫폼.
            도면, BOM, 리비전, 협업 이력을 하나의 워크스페이스로 정리하는 흐름을 중심으로 페이지를 구성했습니다.
          </p>
        </div>

        <div>
          <div className="text-sm font-700 uppercase tracking-[0.22em] text-brand-500/75">
            바로가기
          </div>
          <div className="mt-4 space-y-3">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block text-sm font-600 text-text-secondary transition-colors hover:text-text-primary lg:text-base"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-700 uppercase tracking-[0.22em] text-brand-500/75">안내</div>
          <div className="mt-4 space-y-3 text-sm text-text-secondary lg:text-base">
            <p>제품 화면: 실제 캡처 또는 스켈레톤으로 교체 가능</p>
            <p>카피/수치: 이후 실제 자료로 교체 가능</p>
            <p>&copy; {new Date().getFullYear()} Fabbit. 모든 권리 보유.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
