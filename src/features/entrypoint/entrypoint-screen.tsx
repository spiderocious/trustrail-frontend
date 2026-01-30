import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@features/auth/providers/auth-provider";
import { ROUTES } from "@shared/constants/routes/routes";

export function EntrypointScreen() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD.ROOT, { replace: true });
    } else {
      navigate(ROUTES.AUTH.LOGIN, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">TrustRail</h1>
        <p className="text-gray-600 mt-2">Redirecting...</p>
      </div>
    </div>
  );
}
