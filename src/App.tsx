import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { AuthProvider } from "@features/auth/providers/auth-provider";
import { EntrypointScreen } from "@features/entrypoint/entrypoint-screen";
import { LoginScreen } from "@features/auth/screen/login-screen";
import { RegisterScreen } from "@features/auth/screen/register-screen";
import { DashboardScreen } from "@features/dashboard/screen/dashboard-screen";
import { ROUTES } from "@shared/constants/routes/routes";

function App() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        }
      >
        <Routes>
          <Route path={ROUTES.ROOT} element={<EntrypointScreen />} />
          <Route path={ROUTES.AUTH.LOGIN} element={<LoginScreen />} />
          <Route path={ROUTES.AUTH.REGISTER} element={<RegisterScreen />} />
          <Route path={ROUTES.DASHBOARD.ROOT} element={<DashboardScreen />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
