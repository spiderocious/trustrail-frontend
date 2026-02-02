import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthGuard } from "@features/auth/guards/auth-guard";
import { DashboardSidebar } from "@features/dashboard/screen/parts/dashboard-sidebar";
import { DashboardHeader } from "@features/dashboard/screen/parts/dashboard-header";
import { useTrustWallets } from "../api/use-trust-wallets";
import { formatCurrencyCompact } from "@features/dashboard/helpers/format-currency";
import { getStatusColor } from "../helpers/calculations";
import {
  FaPlus,
  FaSpinner,
  FaSearch,
  FaFilter,
  FaWallet,
} from "react-icons/fa";

function TrustWalletsListContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
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
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
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
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-8">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                    TrustWallets
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    Manage and monitor your digital escrow wallets.
                  </p>
                </div>
                <Link
                  to="/trustwallets/create"
                  className="self-start sm:self-auto flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  <FaPlus />
                  Create TrustWallet
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <FaWallet className="text-lg sm:text-2xl text-blue-600" />
                  <div className="text-[10px] sm:text-xs font-semibold text-gray-500">
                    TOTAL WALLETS
                  </div>
                </div>
                <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1">
                  {totalWallets}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  {activeWallets} active
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <FaWallet className="text-lg sm:text-2xl text-green-600" />
                  <div className="text-[10px] sm:text-xs font-semibold text-gray-500">
                    INACTIVE WALLETS
                  </div>
                </div>
                <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1">
                  {totalWallets - activeWallets}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">draft or paused</div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search TrustWallets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
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
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
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
            </div>

            {/* TrustWallets Table - Desktop */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden hidden sm:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Target Amount
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Applications
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredWallets.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
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
                            <td className="px-4 sm:px-6 py-4">
                              <div className="font-medium text-gray-900">
                                {wallet.name}
                              </div>
                              {wallet.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {wallet.description}
                                </div>
                              )}
                            </td>
                            <td className="px-4 sm:px-6 py-4 text-gray-900">
                              {formatCurrencyCompact(
                                wallet.installmentPlan.totalAmount,
                              )}
                            </td>

                            <td className="px-4 sm:px-6 py-4 text-gray-900">
                              {wallet.applicationCount}
                            </td>
                            <td className="px-4 sm:px-6 py-4">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}
                              >
                                {wallet.isActive ? "Active" : "Draft"}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-4">
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
              </div>

              {/* Pagination */}
              {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs sm:text-sm text-gray-600">
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
                      className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setPage(Math.min(data.pagination.totalPages, page + 1))
                      }
                      disabled={page === data.pagination.totalPages}
                      className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* TrustWallets Cards - Mobile */}
            <div className="sm:hidden space-y-3">
              {filteredWallets.length === 0 ? (
                <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                  <p className="text-gray-500 text-sm">
                    No TrustWallets found. Create your first one to get started.
                  </p>
                </div>
              ) : (
                filteredWallets.map((wallet) => {
                  const statusColors = getStatusColor(wallet.isActive);
                  return (
                    <Link
                      key={wallet.trustWalletId}
                      to={`/trustwallets/${wallet.trustWalletId}`}
                      className="block bg-white rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-gray-900">
                          {wallet.name}
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}
                        >
                          {wallet.isActive ? "Active" : "Draft"}
                        </span>
                      </div>
                      {wallet.description && (
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                          {wallet.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-600">
                          <span className="font-medium text-gray-900">
                            {formatCurrencyCompact(wallet.installmentPlan.totalAmount)}
                          </span>
                        </div>
                        <div className="text-gray-500">
                          {wallet.applicationCount} applications
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}

              {/* Mobile Pagination */}
              {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {data.pagination.totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setPage(Math.min(data.pagination.totalPages, page + 1))
                    }
                    disabled={page === data.pagination.totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
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
