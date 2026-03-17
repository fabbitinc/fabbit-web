import { Suspense } from "react";
import { AppRouter } from "@/app/app-router";
import { AppLoadingScreen } from "@/app/components/app-loading-screen";

export function App() {
  return (
    <Suspense fallback={<AppLoadingScreen />}>
      <AppRouter />
    </Suspense>
  );
}
