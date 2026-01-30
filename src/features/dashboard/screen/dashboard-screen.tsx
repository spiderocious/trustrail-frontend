import { useAuth } from "@features/auth/providers/auth-provider";
import { AuthGuard } from "@features/auth/guards/auth-guard";

function DashboardScreenContent() {
  const { logout, businessId } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            TrustRail Dashboard
          </h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Welcome to Dashboard
          </h2>
          <p className="text-gray-600 mb-2">
            Dashboard content will be implemented here
          </p>
          {businessId && (
            <p className="text-sm text-gray-500">Business ID: {businessId}</p>
          )}
        </div>
      </main>
    </div>
  );
}

export function DashboardScreen() {
  return (
    <AuthGuard>
      <DashboardScreenContent />
    </AuthGuard>
  );
}
