import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { AuthProvider } from "@features/auth/providers/auth-provider";
import { EntrypointScreen } from "@features/entrypoint/entrypoint-screen";
import { LoginScreen } from "@features/auth/screen/login-screen";
import { AutoLoginScreen } from "@features/auth/screen/auto-login-screen";
import { RegisterScreen } from "@features/auth/screen/register-screen";
import { DashboardScreen } from "@features/dashboard/screen/dashboard-screen";
import { TrustWalletsListScreen } from "@features/trust-wallets/screen/trust-wallets-list-screen";
import { CreateTrustWalletScreen } from "@features/trust-wallets/screen/create-trust-wallet-screen";
import { TrustWalletDetailsScreen } from "@features/trust-wallets/screen/trust-wallet-details-screen";
import { TrustWalletApplicationsScreen } from "@features/trust-wallets/screen/trust-wallet-applications-screen";
import { ApplicationsListScreen } from "@features/applications/screen/applications-list-screen";
import { ApplicationDetailsScreen } from "@features/applications/screen/application-details-screen";
import { PublicTrustWalletScreen } from "@features/public/screen/public-trustwallet-screen";
import { ApplicationFormScreen } from "@features/public/screen/application-form-screen";
import { ApplicationSubmittedScreen } from "@features/public/screen/application-submitted-screen";
import { ApplicationStatusScreen } from "@features/public/screen/application-status-screen";
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
          <Route path={ROUTES.AUTH.AUTO_LOGIN} element={<AutoLoginScreen />} />
          <Route path={ROUTES.DASHBOARD.ROOT} element={<DashboardScreen />} />
          <Route path="/trustwallets" element={<TrustWalletsListScreen />} />
          <Route
            path="/trustwallets/create"
            element={<CreateTrustWalletScreen />}
          />
          <Route
            path="/trustwallets/:id"
            element={<TrustWalletDetailsScreen />}
          />
          <Route
            path="/trustwallets/:id/applications"
            element={<TrustWalletApplicationsScreen />}
          />
          <Route path="/applications" element={<ApplicationsListScreen />} />
          <Route
            path="/applications/:id"
            element={<ApplicationDetailsScreen />}
          />

          {/* Public Customer Routes (No Auth Required) */}
          <Route
            path="/apply/:trustWalletId"
            element={<PublicTrustWalletScreen />}
          />
          <Route
            path="/apply/:trustWalletId/form"
            element={<ApplicationFormScreen />}
          />
          <Route
            path="/application/:applicationId/submitted"
            element={<ApplicationSubmittedScreen />}
          />
          <Route path="/status" element={<ApplicationStatusScreen />} />
          <Route
            path="/status/:applicationId"
            element={<ApplicationStatusScreen />}
          />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
