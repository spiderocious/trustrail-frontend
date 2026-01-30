import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/auth-provider";
import { ROUTES } from "@shared/constants/routes/routes";

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH.LOGIN} replace />;
  }

  return <>{children}</>;
}
