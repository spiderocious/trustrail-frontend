import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/auth-provider";
import { ROUTES } from "@shared/constants/routes/routes";

interface GuestGuardProps {
  children: ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD.ROOT} replace />;
  }

  return <>{children}</>;
}
