import { Outlet } from "react-router-dom";

export function OnboardingLayout() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="mx-auto flex w-full max-w-[1200px] items-center px-6 pt-10">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6]">
            <svg
              className="h-4 w-4 text-white"
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
          <span className="text-2xl font-semibold text-gray-500">Fabbit</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1200px] justify-center px-4 pb-8 pt-6">
        <Outlet />
      </main>
    </div>
  );
}
