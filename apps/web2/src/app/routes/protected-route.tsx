import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { isRootDomain } from "@/lib/subdomain";

export function ProtectedRoute({ children }: PropsWithChildren) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={isRootDomain() ? "/signup" : "/login"} replace />;
  }

  return children;
}
