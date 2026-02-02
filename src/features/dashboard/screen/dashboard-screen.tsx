import { useState } from "react";
import { AuthGuard } from "@features/auth/guards/auth-guard";
import { DashboardSidebar } from "./parts/dashboard-sidebar";
import { DashboardHeader } from "./parts/dashboard-header";
import { useDashboardOverview } from "../api/use-dashboard-overview";
import { formatCurrencyCompact } from "../helpers/format-currency";
import { formatTimeAgo } from "../helpers/format-date";
import { FaPlus, FaSpinner } from "react-icons/fa";
import { businessName } from "../../auth/helpers/token-storage";
import { Link } from "react-router-dom";

function DashboardScreenContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data, isLoading, error } = useDashboardOverview();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load dashboard</p>
            <p className="text-gray-600 text-sm">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const overview = data?.data;
  if (!overview) {
    return (
      <div className="flex h-screen">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">
              Invalid dashboard data structure
            </p>
            <p className="text-gray-600 text-sm">No data received from API</p>
            <p className="text-xs text-gray-400 mt-2">
              Check that the backend is running on{" "}
              {import.meta.env.VITE_API_BASE_URL || "http://localhost:3030"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-8">
            {/* Greeting Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                  {getGreeting()}, {businessName()}
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Welcome back to your command center. Here's what's happening
                  today.
                </p>
              </div>
              <Link to="/trustwallets/create" className="self-start sm:self-auto">
                <button className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base">
                  <FaPlus />
                  Create TrustWallet
                </button>
              </Link>
            </div>

            {/* Stats Grid - All data from API */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
              {/* Total TrustWallets */}
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="text-[10px] sm:text-xs font-semibold text-gray-500 mb-1 sm:mb-2">
                  TOTAL TRUSTWALLETS
                </div>
                <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1">
                  {overview.trustWallets.total}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  {overview.trustWallets.active} active
                </div>
              </div>

              {/* Applications */}
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="text-[10px] sm:text-xs font-semibold text-gray-500 mb-1 sm:mb-2">
                  APPLICATIONS
                </div>
                <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1">
                  {overview.applications.total}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  {overview.applications.pending} pending
                </div>
              </div>

              {/* Total Revenue */}
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="text-[10px] sm:text-xs font-semibold text-gray-500 mb-1 sm:mb-2">
                  TOTAL REVENUE
                </div>
                <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1">
                  {formatCurrencyCompact(overview.revenue.totalCollected)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  {formatCurrencyCompact(
                    overview.revenue.availableForWithdrawal,
                  )}{" "}
                  available
                </div>
              </div>

              {/* Active Applications */}
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="text-[10px] sm:text-xs font-semibold text-gray-500 mb-1 sm:mb-2">
                  ACTIVE APPLICATIONS
                </div>
                <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1">
                  {overview.applications.active}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  {overview.applications.completed} completed
                </div>
              </div>
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="text-[10px] sm:text-xs font-semibold text-gray-500 mb-1 sm:mb-2">
                  OUTSTANDING BALANCE
                </div>
                <div className="text-lg sm:text-2xl font-bold text-gray-900">
                  {formatCurrencyCompact(overview.revenue.outstandingBalance)}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="text-[10px] sm:text-xs font-semibold text-gray-500 mb-1 sm:mb-2">
                  PAYMENT SUCCESS RATE
                </div>
                <div className="text-lg sm:text-2xl font-bold text-gray-900">
                  {overview.payments.successRate}%
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  {overview.payments.successfulCount} successful,{" "}
                  {overview.payments.failedCount} failed
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="text-[10px] sm:text-xs font-semibold text-gray-500 mb-1 sm:mb-2">
                  APPLICATIONS STATUS
                </div>
                <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                  <div>Approved: {overview.applications.approved}</div>
                  <div>Declined: {overview.applications.declined}</div>
                  <div>Flagged: {overview.applications.flaggedForReview}</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            {overview.recentActivity.length > 0 && (
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    Recent Activity
                  </h2>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {overview.recentActivity.map((activity) => {
                    const actionLabels: Record<string, string> = {
                      "business.register": "Business Registered",
                      "trustwallet.create": "TrustWallet Created",
                      "application.submit": "Application Submitted",
                      "application.approve": "Application Approved",
                      "application.decline": "Application Declined",
                      "payment.success": "Payment Successful",
                      "payment.failed": "Payment Failed",
                      "withdrawal.request": "Withdrawal Requested",
                    };

                    const actionColors: Record<string, string> = {
                      "business.register": "bg-purple-100 text-purple-700",
                      "trustwallet.create": "bg-blue-100 text-blue-700",
                      "application.submit": "bg-yellow-100 text-yellow-700",
                      "application.approve": "bg-green-100 text-green-700",
                      "application.decline": "bg-red-100 text-red-700",
                      "payment.success": "bg-green-100 text-green-700",
                      "payment.failed": "bg-red-100 text-red-700",
                      "withdrawal.request": "bg-orange-100 text-orange-700",
                    };

                    return (
                      <div
                        key={activity.logId}
                        className="flex items-start gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-100 last:border-0"
                      >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold text-xs sm:text-sm flex-shrink-0">
                          {getInitials(activity.actor.email)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                            {actionLabels[activity.action] || activity.action}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">
                            {activity.resourceType} • {activity.resourceId}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">
                            {formatTimeAgo(activity.timestamp)}
                          </p>
                        </div>
                        <span
                          className={`hidden sm:inline-block text-xs font-medium px-3 py-1 rounded-full flex-shrink-0 ${actionColors[activity.action] || "bg-gray-100 text-gray-700"}`}
                        >
                          {activity.actor.type}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
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
