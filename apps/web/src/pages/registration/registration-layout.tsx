import { Outlet } from "react-router-dom";

export function RegistrationLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="auth-hero absolute inset-0 opacity-45" />
      <div className="absolute inset-x-0 top-0 h-px bg-border/80" />
      <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <main className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
        <div className="w-full max-w-[1000px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
