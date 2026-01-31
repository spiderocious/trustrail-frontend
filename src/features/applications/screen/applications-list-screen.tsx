import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { AuthGuard } from "@features/auth/guards/auth-guard";
import { DashboardSidebar } from "@features/dashboard/screen/parts/dashboard-sidebar";
import { DashboardHeader } from "@features/dashboard/screen/parts/dashboard-header";
import {
  useApplicationsList,
  ApplicationListItem,
} from "../api/use-applications-list";
import { formatCurrency } from "@features/dashboard/helpers/format-currency";
import { formatDate } from "@features/dashboard/helpers/format-date";
import {
  FaSpinner,
  FaEye,
  FaFileExport,
  FaFilter,
  FaSearch,
} from "react-icons/fa";

const columnHelper = createColumnHelper<ApplicationListItem>();

function ApplicationsListContent() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [walletFilter, setWalletFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, error } = useApplicationsList({
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
        <DashboardSidebar />
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
      <DashboardSidebar />
      <div className="flex-1 overflow-y-auto">
        <DashboardHeader businessName="feranmi"/>
        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Applications
            </h1>
            <p className="text-gray-600">
              Manage and review all incoming customer trust applications.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-sm font-semibold text-gray-500 mb-1">
                Total Applications
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {data?.pagination?.totalCount || 0}
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-sm font-semibold text-gray-500 mb-1">
                Approved
              </div>
              <div className="text-3xl font-bold text-green-600">
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
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-sm font-semibold text-gray-500 mb-1">
                Declined
              </div>
              <div className="text-3xl font-bold text-red-600">
                {data?.data?.filter((app) =>
                  ["DECLINED", "AUTO_DECLINED"].includes(app.status),
                ).length || 0}
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-sm font-semibold text-gray-500 mb-1">
                Pending
              </div>
              <div className="text-3xl font-bold text-yellow-600">
                {data?.data?.filter((app) =>
                  ["PENDING", "ANALYZING", "FLAGGED_FOR_REVIEW"].includes(
                    app.status,
                  ),
                ).length || 0}
              </div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by customer name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <FaFileExport />
                Export CSV
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-3 text-left whitespace-nowrap"
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
                          <td key={cell.id} className="px-6 py-4">
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
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, data.pagination.totalCount)} of{" "}
                  {data.pagination.totalCount} applications
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({
                    length: Math.min(5, data.pagination.totalPages),
                  }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-1 rounded-lg ${
                          page === pageNum
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {data.pagination.totalPages > 5 && <span>...</span>}
                  {data.pagination.totalPages > 5 && (
                    <button
                      onClick={() => setPage(data.pagination.totalPages)}
                      className={`px-3 py-1 rounded-lg ${
                        page === data.pagination.totalPages
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {data.pagination.totalPages}
                    </button>
                  )}
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === data.pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
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
