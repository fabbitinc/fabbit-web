export function SiteNotFoundPage() {
  const hostname = window.location.hostname;
  const appDomain = import.meta.env.VITE_APP_DOMAIN?.split(":")[0] || "";
  const subdomain = hostname.endsWith(`.${appDomain}`)
    ? hostname.slice(0, -(appDomain.length + 1))
    : hostname;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0f172a]">
      {/* 배경 그라데이션 오브 */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-200px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[#3b82f6]/15 blur-[120px]" />
        <div className="absolute bottom-[-100px] right-[-200px] h-[500px] w-[500px] rounded-full bg-[#8b5cf6]/10 blur-[100px]" />
        <div className="absolute left-[-150px] top-1/3 h-[300px] w-[300px] rounded-full bg-[#3b82f6]/8 blur-[80px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-6">
        {/* 로고 */}
        <div className="mb-16 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] shadow-lg shadow-blue-500/25">
            <svg
              className="h-5 w-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white">Fabbit</span>
        </div>

        {/* 메인 메시지 */}
        <h1 className="mb-3 text-center text-2xl font-bold tracking-tight text-white">
          워크스페이스를 찾을 수 없습니다
        </h1>
        <p className="mb-10 max-w-xs text-center text-sm leading-relaxed text-slate-400">
          입력하신 주소에 해당하는 워크스페이스가 없습니다.
          <br />
          주소를 다시 확인해 주세요.
        </p>

        {/* URL 바 스타일 주소 표시 */}
        <div className="w-full max-w-sm rounded-xl border border-white/10 bg-white/5 shadow-lg shadow-black/20 backdrop-blur-sm">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
            </div>
          </div>
          <div className="flex items-center justify-center px-5 py-4">
            <span className="font-mono text-sm">
              <span className="font-semibold text-red-400">{subdomain}</span>
              <span className="text-slate-500">.{appDomain}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
