import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { isRootDomain } from "@/lib/subdomain";

export function RegistrationRoute({ children }: PropsWithChildren) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!isRootDomain()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
