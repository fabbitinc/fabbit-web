import { Outlet } from "react-router-dom";

export function RegistrationLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <section className="auth-hero hidden p-8 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">Fabbit</p>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight">
            제조 데이터를
            <br />
            더 강한 구조로 연결합니다.
          </h1>
          <p className="mt-5 text-base leading-7 text-white/78">
            `web2`는 기존 흐름을 그대로 복제하지 않고, 페이지/컴포넌트/훅/API/store 경계를 분리한 새 구조 위에 다시 올라갑니다.
          </p>
        </div>

        <div className="grid gap-3 text-sm text-white/76">
          <p>AI 도면 분석</p>
          <p>구조화된 BOM 관리</p>
          <p>프로젝트/변경 이력 추적</p>
        </div>
      </section>

      <main className="flex min-h-screen items-center justify-center px-4 py-8 lg:px-10">
        <div className="w-full max-w-xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
