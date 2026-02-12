import { Outlet } from "react-router-dom";

export function RegistrationLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">
      <main className="flex flex-1 items-center justify-center overflow-y-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
