import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthGuard } from "@features/auth/guards/auth-guard";
import { DashboardSidebar } from "@features/dashboard/screen/parts/dashboard-sidebar";
import { DashboardHeader } from "@features/dashboard/screen/parts/dashboard-header";
import { useTrustWalletApplications } from "../api/use-trust-wallet-applications";
import { useTrustWalletDetails } from "../api/use-trust-wallet-details";
import { formatCurrency } from "@features/dashboard/helpers/format-currency";
import { formatTimeAgo } from "@features/dashboard/helpers/format-date";
import { FaSpinner, FaSearch, FaEye } from "react-icons/fa";

function TrustWalletApplicationsContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: walletData } = useTrustWalletDetails(id);
  const {
    data: applicationsData,
    isLoading,
    error,
  } = useTrustWalletApplications({
    trustWalletId: id,
    page,
    limit: 20,
    status: statusFilter || undefined,
    search: searchTerm || undefined,
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      PENDING: { bg: "bg-yellow-100", text: "text-yellow-700" },
      ANALYZING: { bg: "bg-purple-100", text: "text-purple-700" },
      AUTO_APPROVED: { bg: "bg-green-100", text: "text-green-700" },
      APPROVED: { bg: "bg-green-100", text: "text-green-700" },
      FLAGGED_FOR_REVIEW: { bg: "bg-orange-100", text: "text-orange-700" },
      AUTO_DECLINED: { bg: "bg-red-100", text: "text-red-700" },
      DECLINED: { bg: "bg-red-100", text: "text-red-700" },
      MANDATE_CREATED: { bg: "bg-blue-100", text: "text-blue-700" },
      MANDATE_ACTIVE: { bg: "bg-blue-100", text: "text-blue-700" },
      ACTIVE: { bg: "bg-blue-100", text: "text-blue-700" },
      COMPLETED: { bg: "bg-green-100", text: "text-green-700" },
      DEFAULTED: { bg: "bg-red-100", text: "text-red-700" },
    };
    return colors[status] || { bg: "bg-gray-100", text: "text-gray-700" };
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return "text-blue-600";
    if (score >= 75) return "text-yellow-600";
    if (score >= 50) return "text-gray-600";
    return "text-red-600";
  };

  const getTrustScoreBadge = (score: number) => {
    if (score >= 90) return "High Trust";
    if (score >= 75) return "Medium";
    if (score >= 50) return "Low Trust";
    return "Critical";
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading applications...</p>
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
            <p className="text-red-600 mb-4">Failed to load applications</p>
            <p className="text-gray-600 text-sm">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const applications = applicationsData?.data || [];
  const pagination = applicationsData?.pagination;
  console.log(applicationsData?.data);

  const totalApplications = pagination?.totalItems || 0;
  const approvedCount = applications.filter((app) =>
    ["APPROVED", "AUTO_APPROVED", "COMPLETED"].includes(app.status),
  ).length;
  const declinedCount = applications.filter((app) =>
    ["DECLINED", "AUTO_DECLINED"].includes(app.status),
  ).length;
  const pendingCount = applications.filter((app) =>
    ["PENDING", "FLAGGED_FOR_REVIEW", "ANALYZING"].includes(app.status),
  ).length;

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-8">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2 text-xs sm:text-sm text-gray-600">
                <Link to="/trustwallets" className="hover:underline">
                  TrustWallets
                </Link>
                <span>/</span>
                <Link to={`/trustwallets/${id}`} className="hover:underline truncate max-w-[120px] sm:max-w-none">
                  {walletData?.data.name || id}
                </Link>
                <span>/</span>
                <span>Applications</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                Applications
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Manage and review all incoming customer trust applications.
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="text-[10px] sm:text-xs font-semibold text-gray-500 mb-1 sm:mb-2">
                  TOTAL APPLICATIONS
                </div>
                <div className="text-xl sm:text-3xl font-bold text-gray-900">
                  {totalApplications}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="text-[10px] sm:text-xs font-semibold text-gray-500 mb-1 sm:mb-2">
                  APPROVED
                </div>
                <div className="text-xl sm:text-3xl font-bold text-green-700">
                  {approvedCount}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="text-[10px] sm:text-xs font-semibold text-gray-500 mb-1 sm:mb-2">
                  DECLINED
                </div>
                <div className="text-xl sm:text-3xl font-bold text-red-700">
                  {declinedCount}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="text-[10px] sm:text-xs font-semibold text-gray-500 mb-1 sm:mb-2">
                  PENDING
                </div>
                <div className="text-xl sm:text-3xl font-bold text-orange-700">
                  {pendingCount}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm mb-4 sm:mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="hidden sm:block">
                  <label className="block text-xs font-semibold text-gray-500 mb-2">
                    TRUSTWALLET
                  </label>
                  <input
                    type="text"
                    value={walletData?.data.name || "All Wallets"}
                    readOnly
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">
                    STATUS
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="ANALYZING">Analyzing</option>
                    <option value="FLAGGED_FOR_REVIEW">
                      Flagged for Review
                    </option>
                    <option value="AUTO_APPROVED">Auto Approved</option>
                    <option value="APPROVED">Approved</option>
                    <option value="AUTO_DECLINED">Auto Declined</option>
                    <option value="DECLINED">Declined</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">
                    SEARCH
                  </label>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Applications Table - Desktop */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden hidden sm:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Customer
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Trust Score
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {applications.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <p className="text-gray-500">
                            No applications found for this TrustWallet.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      applications.map((app) => {
                        const statusColors = getStatusColor(app.status);
                        return (
                          <tr
                            key={app.applicationId}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 sm:px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                                  {app.customerDetails.firstName[0]}
                                  {app.customerDetails.lastName[0]}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {app.customerDetails.firstName}{" "}
                                    {app.customerDetails.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ID: {app.applicationId.split("-").pop()}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4 text-gray-600">
                              {formatTimeAgo(app.createdAt)}
                            </td>
                            <td className="px-4 sm:px-6 py-4">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}
                              >
                                {app.status === "FLAGGED_FOR_REVIEW"
                                  ? "Flagged"
                                  : app.status === "AUTO_APPROVED"
                                    ? "Approved"
                                    : app.status === "AUTO_DECLINED"
                                      ? "Declined"
                                      : app.status === "MANDATE_CREATED"
                                        ? "Pending"
                                        : app.status}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-10 h-10 rounded-full border-4 flex items-center justify-center font-bold text-sm ${getTrustScoreColor(app.trustEngineOutput?.trustScore)}`}
                                  style={{
                                    borderColor: "currentColor",
                                  }}
                                >
                                  {app.trustEngineOutput?.trustScore}
                                </div>
                                <span className="text-sm text-gray-600">
                                  {getTrustScoreBadge(
                                    app.trustEngineOutput?.trustScore,
                                  )}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4 font-semibold text-gray-900">
                              {formatCurrency(app.totalAmount)}
                            </td>
                            <td className="px-4 sm:px-6 py-4">
                              <Link
                                to={`/applications/${app.applicationId}`}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors inline-block"
                              >
                                <FaEye className="text-gray-600" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs sm:text-sm text-gray-600">
                    Showing {(page - 1) * (pagination.limit || 20) + 1} to{" "}
                    {Math.min(
                      page * (pagination.limit || 20),
                      pagination.totalItems,
                    )}{" "}
                    of {pagination.totalItems}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-2 py-2 text-sm font-medium text-gray-700">
                      {page} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setPage(Math.min(pagination.totalPages, page + 1))
                      }
                      disabled={page === pagination.totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Applications Cards - Mobile */}
            <div className="sm:hidden space-y-3">
              {applications.length === 0 ? (
                <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                  <p className="text-gray-500 text-sm">
                    No applications found for this TrustWallet.
                  </p>
                </div>
              ) : (
                applications.map((app) => {
                  const statusColors = getStatusColor(app.status);
                  return (
                    <Link
                      key={app.applicationId}
                      to={`/applications/${app.applicationId}`}
                      className="block bg-white rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                            {app.customerDetails.firstName[0]}
                            {app.customerDetails.lastName[0]}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {app.customerDetails.firstName}{" "}
                              {app.customerDetails.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatTimeAgo(app.createdAt)}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}
                        >
                          {app.status === "FLAGGED_FOR_REVIEW"
                            ? "Flagged"
                            : app.status === "AUTO_APPROVED"
                              ? "Approved"
                              : app.status === "AUTO_DECLINED"
                                ? "Declined"
                                : app.status === "MANDATE_CREATED"
                                  ? "Pending"
                                  : app.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-full border-[3px] flex items-center justify-center font-bold text-xs ${getTrustScoreColor(app.trustEngineOutput?.trustScore)}`}
                            style={{ borderColor: "currentColor" }}
                          >
                            {app.trustEngineOutput?.trustScore}
                          </div>
                          <span className="text-xs text-gray-600">
                            {getTrustScoreBadge(app.trustEngineOutput?.trustScore)}
                          </span>
                        </div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {formatCurrency(app.totalAmount)}
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}

              {/* Mobile Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setPage(Math.min(pagination.totalPages, page + 1))
                    }
                    disabled={page === pagination.totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export function TrustWalletApplicationsScreen() {
  return (
    <AuthGuard>
      <TrustWalletApplicationsContent />
    </AuthGuard>
  );
}
