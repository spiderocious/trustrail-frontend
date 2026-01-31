import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSpinner,
  FaCopy,
} from "react-icons/fa";
import { useApplicationStatus } from "../api/use-application-status";
import { getStatusMessage } from "../helpers/get-status-message";
import { formatCurrency } from "../../dashboard/helpers/format-currency";
import { formatDateTime } from "../../dashboard/helpers/format-date";
import { FaGem } from "react-icons/fa6";

export function ApplicationStatusScreen() {
  const { applicationId: paramApplicationId } = useParams<{
    applicationId?: string;
  }>();
  const navigate = useNavigate();

  const [applicationId, setApplicationId] = useState(paramApplicationId || "");
  const [searchId, setSearchId] = useState(paramApplicationId || "");

  const statusQuery = useApplicationStatus(searchId, searchId.length > 0);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (applicationId.trim()) {
      setSearchId(applicationId.trim());
      navigate(`/status/${applicationId.trim()}`);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  function getStatusIcon() {
    if (!statusQuery.data) return null;

    const status = statusQuery.data?.data?.status;
    if (
      status === "AUTO_APPROVED" ||
      status === "APPROVED" ||
      status === "MANDATE_ACTIVE" ||
      status === "ACTIVE" ||
      status === "COMPLETED"
    ) {
      return <FaCheckCircle className="text-4xl text-green-600" />;
    }

    if (status === "AUTO_DECLINED" || status === "DECLINED") {
      return <FaTimesCircle className="text-4xl text-red-600" />;
    }

    if (
      status === "PENDING" ||
      status === "PENDING_ANALYSIS" ||
      status === "ANALYZING"
    ) {
      return <FaSpinner className="text-4xl text-blue-600 animate-spin" />;
    }

    if (status === "FLAGGED_FOR_REVIEW") {
      return <FaClock className="text-4xl text-yellow-600" />;
    }

    return <FaClock className="text-4xl text-gray-600" />;
  }

  function getStatusColor() {
    if (!statusQuery.data) return "gray";

    const status = statusQuery.data?.data?.status;
    if (
      status === "AUTO_APPROVED" ||
      status === "APPROVED" ||
      status === "MANDATE_ACTIVE" ||
      status === "ACTIVE" ||
      status === "COMPLETED"
    ) {
      return "green";
    }

    if (status === "AUTO_DECLINED" || status === "DECLINED") {
      return "red";
    }

    if (status === "FLAGGED_FOR_REVIEW") {
      return "yellow";
    }

    return "blue";
  }

  function getStatusText() {
    if (!statusQuery.data) return "";

    const status = statusQuery.data?.data?.status;
    if (status === "AUTO_APPROVED" || status === "APPROVED") return "Approved";
    if (status === "AUTO_DECLINED" || status === "DECLINED") return "Declined";
    if (status === "FLAGGED_FOR_REVIEW") return "Under Review";
    if (status === "PENDING" || status === "PENDING_ANALYSIS") return "Pending";
    if (status === "ANALYZING") return "Analyzing";
    if (status === "MANDATE_CREATED") return "Awaiting Payment";
    if (status === "MANDATE_ACTIVE" || status === "ACTIVE") return "Active";
    if (status === "COMPLETED") return "Completed";
    return status;
  }

  const statusColor = getStatusColor();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center">
              <FaGem />
            </div>
            <span className="font-bold text-gray-900">TrustRail</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-8">
          Check Application Status
        </h1>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label
                htmlFor="applicationId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Application ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="applicationId"
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  placeholder="APP-58291034"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FaSearch />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Status Result */}
        {statusQuery.isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading status...</p>
          </div>
        )}

        {statusQuery.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">
              Application not found. Please check your Application ID.
            </p>
          </div>
        )}

        {statusQuery.data && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
            {/* Status */}
            <div className="text-center">
              <div className="flex justify-center mb-4">{getStatusIcon()}</div>
              <h2 className={`text-2xl font-bold mb-2 text-${statusColor}-600`}>
                {getStatusText()} ✓
              </h2>
              <p className="text-gray-600">
                {getStatusMessage(statusQuery.data?.data?.status)}
              </p>
            </div>

            {/* Trust Score */}
            {statusQuery.data?.data?.trustScore !== undefined && (
              <div className="flex justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-200"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="42"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-blue-600"
                      strokeWidth="8"
                      strokeDasharray={`${statusQuery.data?.data?.trustScore * 2.64} 264`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="42"
                      cx="50"
                      cy="50"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">
                      {statusQuery.data?.data?.trustScore}
                    </span>
                    <span className="text-xs text-gray-500 uppercase">
                      Trust Score
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Next Steps (for approved applications) */}
            {(statusQuery.data?.data?.status === "AUTO_APPROVED" ||
              statusQuery.data?.data?.status === "APPROVED" ||
              statusQuery.data?.data?.status === "MANDATE_CREATED") &&
              statusQuery.data?.data?.downPaymentAmount && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Next Steps
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Pay down payment</span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatCurrency(
                          statusQuery.data?.data?.downPaymentAmount,
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            {/* Virtual Account Details */}
            {statusQuery.data?.data?.virtualAccountNumber && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase text-gray-500">
                  Virtual Account Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Account Number</p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-gray-900">
                        {statusQuery.data?.data?.virtualAccountNumber}
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            statusQuery.data?.data?.virtualAccountNumber || "",
                          )
                        }
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <FaCopy />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Bank</p>
                    <span className="font-semibold text-gray-900">
                      {statusQuery.data?.data?.bankName ||
                        "TrustRail Bank (Providus)"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Application History */}
            {statusQuery.data?.data?.createdAt && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase text-gray-500">
                  Application History
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5"></div>
                    <div>
                      <p className="font-medium text-gray-900">Submitted</p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(statusQuery.data?.data?.createdAt)}
                      </p>
                    </div>
                  </div>

                  {statusQuery.data?.data?.analyzedAt && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5"></div>
                      <div>
                        <p className="font-medium text-gray-900">Analyzed</p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(statusQuery.data?.data?.analyzedAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {statusQuery.data?.data?.approvedAt && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5"></div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Decision Made
                        </p>
                        <p className="text-xs text-gray-500">Just now</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Complete Payment Button (for approved) */}
            {(statusQuery.data?.data?.status === "MANDATE_CREATED" ||
              statusQuery.data?.data?.status === "MANDATE_ACTIVE") && (
              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Complete Payment
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-8 hidden">
          © 2023 TrustRail Financial Services. Secure Portal. Need help?{" "}
          <button className="text-blue-600 hover:underline">
            Contact Support
          </button>
        </p>
      </div>
    </div>
  );
}
