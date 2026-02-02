import { AuthGuard } from "@features/auth/guards/auth-guard";
import { formatCurrency } from "@features/dashboard/helpers/format-currency";
import { formatDate } from "@features/dashboard/helpers/format-date";
import { DashboardHeader } from "@features/dashboard/screen/parts/dashboard-header";
import { DashboardSidebar } from "@features/dashboard/screen/parts/dashboard-sidebar";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { FaEye, FaFileExport, FaSearch, FaSpinner } from "react-icons/fa";
import { Link } from "react-router-dom";
import {
  ApplicationListItem,
  useApplicationsList,
} from "../api/use-applications-list";
import { exportApplicationsToCSV } from "../helpers/export-applications-csv";

const columnHelper = createColumnHelper<ApplicationListItem>();

function ApplicationsListContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [walletFilter, _] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useApplicationsList({
    page,
    limit,
    status: statusFilter,
    trustWalletId: walletFilter,
    search: searchQuery,
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { bg: string; text: string; label: string }
    > = {
      PENDING: { bg: "bg-gray-100", text: "text-gray-800", label: "Pending" },
      ANALYZING: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Analyzing",
      },
      AUTO_APPROVED: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Approved",
      },
      APPROVED: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Approved",
      },
      AUTO_DECLINED: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Declined",
      },
      DECLINED: { bg: "bg-red-100", text: "text-red-800", label: "Declined" },
      FLAGGED_FOR_REVIEW: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Pending",
      },
      MANDATE_ACTIVE: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Approved",
      },
      ACTIVE: { bg: "bg-green-100", text: "text-green-800", label: "Approved" },
      COMPLETED: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Completed",
      },
    };

    const config = statusMap[status] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      label: status,
    };
    return (
      <span
        className={`inline-block px-3 py-1 ${config.bg} ${config.text} text-xs font-semibold rounded-full`}
      >
        {config.label}
      </span>
    );
  };

  const getTrustScoreDisplay = (score: number | undefined) => {
    if (!score) return null;

    let colorClass = "text-gray-600 bg-gray-100";
    let label = "Low Trust";

    if (score >= 80) {
      colorClass = "text-green-600 bg-green-100";
      label = "High Trust";
    } else if (score >= 60) {
      colorClass = "text-blue-600 bg-blue-100";
      label = "Good";
    } else if (score >= 40) {
      colorClass = "text-orange-600 bg-orange-100";
      label = "Medium";
    } else {
      colorClass = "text-red-600 bg-red-100";
      label = "Critical";
    }

    return (
      <div className="flex items-center gap-2">
        <div
          className={`w-12 h-12 rounded-full ${colorClass.replace("text-", "bg-").replace("bg-bg-", "bg-")} flex items-center justify-center border-2 ${colorClass.replace("bg-", "border-")}`}
        >
          <span className={`text-sm font-bold ${colorClass.split(" ")[0]}`}>
            {score}
          </span>
        </div>
        <span className="text-xs text-gray-600">{label}</span>
      </div>
    );
  };

  const columns = [
    columnHelper.accessor(
      (row) =>
        `${row.customerDetails.firstName} ${row.customerDetails.lastName}`,
      {
        id: "customer",
        header: () => (
          <span className="text-sm font-semibold text-gray-700 uppercase">
            Customer
          </span>
        ),
        cell: (info) => {
          const row = info.row.original;
          return (
            <div>
              <div className="font-medium text-gray-900">{info.getValue()}</div>
              <div className="text-sm text-gray-500">
                {row.customerDetails.email}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                ID: {row.applicationId.slice(0, 16)}...
              </div>
            </div>
          );
        },
      },
    ),
    columnHelper.accessor("trustWalletName", {
      header: () => (
        <span className="text-sm font-semibold text-gray-700 uppercase">
          TrustWallet
        </span>
      ),
      cell: (info) => {
        const value = info.getValue();
        return (
          <div className="text-sm text-gray-900">{value || "Standard"}</div>
        );
      },
    }),
    columnHelper.accessor("submittedAt", {
      header: () => (
        <span className="text-sm font-semibold text-gray-700 uppercase">
          Date
        </span>
      ),
      cell: (info) => (
        <div className="text-sm text-gray-900">
          {formatDate(info.getValue())}
        </div>
      ),
    }),
    columnHelper.accessor("status", {
      header: () => (
        <span className="text-sm font-semibold text-gray-700 uppercase">
          Status
        </span>
      ),
      cell: (info) => getStatusBadge(info.getValue()),
    }),
    columnHelper.accessor((row) => row.trustEngineOutput?.trustScore, {
      id: "trustScore",
      header: () => (
        <span className="text-sm font-semibold text-gray-700 uppercase">
          Trust Score
        </span>
      ),
      cell: (info) => getTrustScoreDisplay(info.getValue()),
    }),
    columnHelper.accessor("totalAmount", {
      header: () => (
        <span className="text-sm font-semibold text-gray-700 uppercase">
          Amount
        </span>
      ),
      cell: (info) => (
        <div className="font-semibold text-gray-900">
          {formatCurrency(info.getValue())}
        </div>
      ),
    }),
    columnHelper.accessor("applicationId", {
      id: "action",
      header: () => (
        <span className="text-sm font-semibold text-gray-700 uppercase">
          Action
        </span>
      ),
      cell: (info) => (
        <Link
          to={`/applications/${info.getValue()}`}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          <FaEye />
          View
        </Link>
      ),
    }),
  ];

  const table = useReactTable({
    data: data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.pagination?.totalPages || 0,
  });

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

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 overflow-y-auto">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        <div className="p-4 sm:p-8">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              Applications
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage and review all incoming customer trust applications.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <div className="text-[10px] sm:text-sm font-semibold text-gray-500 mb-0.5 sm:mb-1">
                Total Applications
              </div>
              <div className="text-xl sm:text-3xl font-bold text-gray-900">
                {data?.pagination?.totalCount || 0}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <div className="text-[10px] sm:text-sm font-semibold text-gray-500 mb-0.5 sm:mb-1">
                Approved
              </div>
              <div className="text-xl sm:text-3xl font-bold text-green-600">
                {data?.data?.filter((app) =>
                  [
                    "APPROVED",
                    "AUTO_APPROVED",
                    "MANDATE_ACTIVE",
                    "ACTIVE",
                  ].includes(app.status),
                ).length || 0}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <div className="text-[10px] sm:text-sm font-semibold text-gray-500 mb-0.5 sm:mb-1">
                Declined
              </div>
              <div className="text-xl sm:text-3xl font-bold text-red-600">
                {data?.data?.filter((app) =>
                  ["DECLINED", "AUTO_DECLINED"].includes(app.status),
                ).length || 0}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <div className="text-[10px] sm:text-sm font-semibold text-gray-500 mb-0.5 sm:mb-1">
                Pending
              </div>
              <div className="text-xl sm:text-3xl font-bold text-yellow-600">
                {data?.data?.filter((app) =>
                  ["PENDING", "ANALYZING", "FLAGGED_FOR_REVIEW"].includes(
                    app.status,
                  ),
                ).length || 0}
              </div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="ANALYZING">Analyzing</option>
                  <option value="FLAGGED_FOR_REVIEW">Flagged</option>
                  <option value="APPROVED">Approved</option>
                  <option value="DECLINED">Declined</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                <button
                  onClick={() => exportApplicationsToCSV(data?.data || [])}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap"
                >
                  <FaFileExport />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table - Desktop */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 sm:px-6 py-3 text-left whitespace-nowrap"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No applications found
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-4 sm:px-6 py-4">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs sm:text-sm text-gray-600">
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, data.pagination.totalCount)} of{" "}
                  {data.pagination.totalCount}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Previous
                  </button>
                  <span className="px-2 py-1 text-sm text-gray-600">
                    {page} / {data.pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === data.pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {(data?.data || []).length === 0 ? (
              <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                <p className="text-gray-500 text-sm">No applications found</p>
              </div>
            ) : (
              (data?.data || []).map((app) => (
                <Link
                  key={app.applicationId}
                  to={`/applications/${app.applicationId}`}
                  className="block bg-white rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {app.customerDetails.firstName} {app.customerDetails.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {app.customerDetails.email}
                      </div>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {app.trustEngineOutput?.trustScore && (
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-xs ${
                              app.trustEngineOutput.trustScore >= 80
                                ? "border-green-600 text-green-600"
                                : app.trustEngineOutput.trustScore >= 60
                                  ? "border-blue-600 text-blue-600"
                                  : app.trustEngineOutput.trustScore >= 40
                                    ? "border-orange-600 text-orange-600"
                                    : "border-red-600 text-red-600"
                            }`}
                          >
                            {app.trustEngineOutput.trustScore}
                          </div>
                        </div>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatDate(app.submittedAt)}
                      </span>
                    </div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {formatCurrency(app.totalAmount)}
                    </div>
                  </div>
                </Link>
              ))
            )}

            {/* Mobile Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {data.pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === data.pagination.totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ApplicationsListScreen() {
  return (
    <AuthGuard>
      <ApplicationsListContent />
    </AuthGuard>
  );
}
