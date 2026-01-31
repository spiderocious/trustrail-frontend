import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthGuard } from "@features/auth/guards/auth-guard";
import { DashboardSidebar } from "@features/dashboard/screen/parts/dashboard-sidebar";
import { DashboardHeader } from "@features/dashboard/screen/parts/dashboard-header";
import { useTrustWallets } from "../api/use-trust-wallets";
import { formatCurrencyCompact } from "@features/dashboard/helpers/format-currency";
import {
  getFrequencyLabel,
  getStatusColor,
  calculateInstallmentAmount,
} from "../helpers/calculations";
import {
  FaPlus,
  FaSpinner,
  FaSearch,
  FaFilter,
  FaWallet,
} from "react-icons/fa";

function TrustWalletsListContent() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | undefined>(
    undefined,
  );

  const { data, isLoading, error } = useTrustWallets({
    page,
    limit: 20,
    isActive: filterActive,
  });

  // Filter by search term client-side for now
  const filteredWallets =
    data?.data.filter((wallet) =>
      wallet.name.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <DashboardSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading TrustWallets...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen">
        <DashboardSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load TrustWallets</p>
            <p className="text-gray-600 text-sm">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const trustWallets = data?.data || [];
  const totalWallets = trustWallets.length;
  const activeWallets = trustWallets.filter((w) => w.isActive).length;

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    TrustWallets
                  </h1>
                  <p className="text-gray-600">
                    Manage and monitor your digital escrow wallets.
                  </p>
                </div>
                <Link
                  to="/trustwallets/create"
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaPlus />
                  Create TrustWallet
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <FaWallet className="text-2xl text-blue-600" />
                  <div className="text-xs font-semibold text-gray-500">
                    TOTAL WALLETS
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {totalWallets}
                </div>
                <div className="text-sm text-gray-600">
                  {activeWallets} active
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <FaWallet className="text-2xl text-green-600" />
                  <div className="text-xs font-semibold text-gray-500">
                    INACTIVE WALLETS
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {totalWallets - activeWallets}
                </div>
                <div className="text-sm text-gray-600">draft or paused</div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search TrustWallets by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={
                    filterActive === undefined ? "all" : filterActive.toString()
                  }
                  onChange={(e) =>
                    setFilterActive(
                      e.target.value === "all"
                        ? undefined
                        : e.target.value === "true",
                    )
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>

                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <FaFilter className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* TrustWallets Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Target Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Installments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Frequency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Applications
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredWallets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <p className="text-gray-500">
                          No TrustWallets found. Create your first one to get
                          started.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredWallets.map((wallet) => {
                      const statusColors = getStatusColor(wallet.isActive);
                      return (
                        <tr
                          key={wallet.trustWalletId}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {wallet.name}
                            </div>
                            {wallet.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {wallet.description}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-900">
                            {formatCurrencyCompact(
                              wallet.installmentPlan.totalAmount,
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-900">
                            {wallet.installmentPlan.installmentCount} ×{" "}
                            {formatCurrencyCompact(
                              calculateInstallmentAmount(
                                wallet.installmentPlan.totalAmount,
                                wallet.installmentPlan.downPaymentPercentage,
                                wallet.installmentPlan.installmentCount,
                              ),
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                              {getFrequencyLabel(
                                wallet.installmentPlan.frequency,
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-900">-</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}
                            >
                              {wallet.isActive ? "Active" : "Draft"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Link
                              to={`/trustwallets/${wallet.trustWalletId}`}
                              className="text-blue-600 hover:underline text-sm font-medium"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {(page - 1) * data.pagination.limit + 1} to{" "}
                    {Math.min(
                      page * data.pagination.limit,
                      data.pagination.totalCount,
                    )}{" "}
                    of {data.pagination.totalCount} results
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setPage(Math.min(data.pagination.totalPages, page + 1))
                      }
                      disabled={page === data.pagination.totalPages}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Help Text */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                Need help with TrustWallets?{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Visit Support Center
                </a>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export function TrustWalletsListScreen() {
  return (
    <AuthGuard>
      <TrustWalletsListContent />
    </AuthGuard>
  );
}
