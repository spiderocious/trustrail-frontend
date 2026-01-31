import { AuthGuard } from "@features/auth/guards/auth-guard";
import { formatCurrency } from "@features/dashboard/helpers/format-currency";
import { DashboardHeader } from "@features/dashboard/screen/parts/dashboard-header";
import { DashboardSidebar } from "@features/dashboard/screen/parts/dashboard-sidebar";
import { useState } from "react";
import {
  FaChartBar,
  FaCheckCircle,
  FaCopy,
  FaSpinner,
  FaTimesCircle,
} from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { useTrustWalletAnalytics } from "../api/use-trust-wallet-analytics";
import { useTrustWalletDetails } from "../api/use-trust-wallet-details";
import {
  calculateDownPaymentAmount,
  calculateInstallmentAmount,
  getFrequencyLabel,
} from "../helpers/calculations";

function TrustWalletDetailsContent() {
  const { id } = useParams<{ id: string }>();
  const {
    data: detailsData,
    isLoading: detailsLoading,
    error: detailsError,
  } = useTrustWalletDetails(id);
  const { data: analyticsData, isLoading: analyticsLoading } =
    useTrustWalletAnalytics({ trustWalletId: id });

  const [copied, setCopied] = useState(false);

  const publicUrl = `${window.location.origin}/apply/${id}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (detailsLoading) {
    return (
      <div className="flex h-screen">
        <DashboardSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading TrustWallet details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (detailsError || !detailsData?.data) {
    return (
      <div className="flex h-screen">
        <DashboardSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load TrustWallet</p>
            <p className="text-gray-600 text-sm">
              {detailsError instanceof Error
                ? detailsError.message
                : "Unknown error"}
            </p>
            <Link
              to="/trustwallets"
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              Back to TrustWallets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const wallet = detailsData.data;
  const analytics = analyticsData?.data;

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-8 py-8">
            {/* Header with Title and Status */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {wallet.name}
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${wallet.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                  >
                    {wallet.isActive ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>
                <p className="text-gray-600">
                  Created on{" "}
                  {new Date(wallet.createdAt).toLocaleDateString("en-NG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  • Managed by Admin Panel
                </p>
              </div>
            </div>

            {/* Public URL Section */}
            <div className="bg-gray-100 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    PUBLIC URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={publicUrl}
                      readOnly
                      className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {copied ? <FaCheckCircle /> : <FaCopy />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-semibold text-gray-500">
                    TOTAL APPLICATIONS
                  </div>
                  <FaChartBar className="text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {analytics?.applications?.total || 0}
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-semibold text-gray-500">
                    APPROVED
                  </div>
                  <FaCheckCircle className="text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {analytics?.applications?.approved || 0}
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-semibold text-gray-500">
                    PENDING
                  </div>
                  <FaCheckCircle className="text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {analytics?.applications?.pending || 0}
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-semibold text-gray-500">
                    DECLINED
                  </div>
                  <FaTimesCircle className="text-red-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {analytics?.applications.declined || 0}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Payment Plan Details */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Payment Plan Details
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-1">
                      TOTAL AMOUNT
                    </div>
                    <div className="text-xl font-bold text-gray-900">
                      {formatCurrency(wallet.installmentPlan.totalAmount)}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-1">
                      DOWN PAYMENT
                    </div>
                    <div className="text-xl font-bold text-gray-900">
                      {formatCurrency(
                        calculateDownPaymentAmount(
                          wallet.installmentPlan.totalAmount,
                          wallet.installmentPlan.downPaymentPercentage,
                        ),
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-1">
                      INSTALLMENTS
                    </div>
                    <div className="text-xl font-bold text-gray-900">
                      {wallet.installmentPlan.installmentCount} ×{" "}
                      {getFrequencyLabel(wallet.installmentPlan.frequency)}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-1">
                      INSTALLMENT AMOUNT
                    </div>
                    <div className="text-xl font-bold text-gray-900">
                      {formatCurrency(
                        calculateInstallmentAmount(
                          wallet.installmentPlan.totalAmount,
                          wallet.installmentPlan.downPaymentPercentage,
                          wallet.installmentPlan.installmentCount,
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Score Distribution */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Trust Score Distribution
                </h2>

                {analyticsLoading ? (
                  <div className="text-center py-8">
                    <FaSpinner className="animate-spin text-2xl text-blue-600 mx-auto" />
                  </div>
                ) : analytics ? (
                  <div className="space-y-3">
                    {Object.entries(analytics.trustScores?.distribution).map(
                      ([range, count]) => (
                        <div key={range}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              {range === "0-20"
                                ? "Bronze (< 50)"
                                : range === "21-40"
                                  ? "Bronze (< 50)"
                                  : range === "41-60"
                                    ? "Silver (50-74)"
                                    : range === "61-80"
                                      ? "Gold (75-89)"
                                      : "Platinum (90-100)"}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              {count} applicants
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${range === "0-20" || range === "21-40" ? "bg-red-500" : range === "41-60" ? "bg-gray-400" : range === "61-80" ? "bg-yellow-500" : "bg-blue-500"}`}
                              style={{
                                width: `${analytics.applications.total > 0 ? (count / analytics.applications.total) * 100 : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No analytics data available
                  </p>
                )}
              </div>
            </div>

            {/* Collected Funds */}
            {analytics && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-8 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-green-700 mb-2">
                      Collected Funds
                    </div>
                    <div className="text-4xl font-bold text-green-900">
                      {formatCurrency(analytics.revenue.totalCollected)}
                    </div>
                    <div className="text-sm text-green-700 mt-2">
                      Total revenue generated from active plans
                    </div>
                  </div>
                  {analytics.payments.successRate > 0 && (
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-700">
                        +{analytics.payments.successRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-green-600">
                        Payment Success Rate
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* View All Applications Button */}
            <div className="text-center">
              <Link
                to={`/trustwallets/${id}/applications`}
                className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All Applications →
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export function TrustWalletDetailsScreen() {
  return (
    <AuthGuard>
      <TrustWalletDetailsContent />
    </AuthGuard>
  );
}
