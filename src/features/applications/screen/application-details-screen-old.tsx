import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthGuard } from "@features/auth/guards/auth-guard";
import { DashboardSidebar } from "@features/dashboard/screen/parts/dashboard-sidebar";
import { DashboardHeader } from "@features/dashboard/screen/parts/dashboard-header";
import { useApplicationDetails } from "../api/use-application-details";
import { formatCurrency } from "@features/dashboard/helpers/format-currency";
import { formatDate } from "@features/dashboard/helpers/format-date";
import {
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaClock,
  FaEnvelope,
  FaDownload,
  FaEye,
  FaChartLine,
} from "react-icons/fa";

function ApplicationDetailsContent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useApplicationDetails(id);

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <DashboardSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading application details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="flex h-screen">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader />
          <div className="p-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <FaTimesCircle className="text-5xl text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Application Not Found
              </h3>
              <p className="text-gray-600 mb-4">
                The application you're looking for doesn't exist.
              </p>
              <button
                onClick={() => navigate("/applications")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Applications
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const application = data.data;
  const status = application.status;
  const trustScore = application.trustEngineOutput?.trustScore || 0;
  const decision = application.trustEngineOutput?.decision;
  const customerName = `${application.customerDetails.firstName} ${application.customerDetails.lastName}`;

  const getStatusBadge = () => {
    switch (status) {
      case "AUTO_APPROVED":
      case "APPROVED":
      case "MANDATE_ACTIVE":
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
            <FaCheckCircle /> APPROVED
          </span>
        );
      case "AUTO_DECLINED":
      case "DECLINED":
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-full font-semibold">
            <FaTimesCircle /> DECLINED
          </span>
        );
      case "FLAGGED_FOR_REVIEW":
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-semibold">
            <FaExclamationTriangle /> FLAGGED FOR REVIEW
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold">
            <FaCheckCircle /> COMPLETED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-full font-semibold">
            <FaClock /> {status}
          </span>
        );
    }
  };

  const getTrustScoreColor = () => {
    if (trustScore >= 80) return "text-green-600";
    if (trustScore >= 60) return "text-yellow-600";
    if (trustScore >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getTrustScoreBg = () => {
    if (trustScore >= 80) return "bg-green-100";
    if (trustScore >= 60) return "bg-yellow-100";
    if (trustScore >= 40) return "bg-orange-100";
    return "bg-red-100";
  };

  const getTrustScoreTier = () => {
    if (trustScore >= 80) return "PLATINUM TIER";
    if (trustScore >= 60) return "GOLD TIER";
    if (trustScore >= 40) return "SILVER TIER";
    return "FAILED TO MEET MINIMUM";
  };

  const isDeclined =
    status === "DECLINED" ||
    status === "AUTO_DECLINED" ||
    decision === "AUTO_DECLINED";
  const isApproved =
    status === "APPROVED" ||
    status === "AUTO_APPROVED" ||
    status === "MANDATE_ACTIVE" ||
    status === "ACTIVE" ||
    status === "COMPLETED";
  const isFlagged = status === "FLAGGED_FOR_REVIEW";

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 overflow-y-auto">
        <DashboardHeader />
        <div className="p-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              to="/applications"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Applications
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900">{application.applicationId}</span>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {customerName}
              </h1>
              <div className="mt-2">{getStatusBadge()}</div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <FaEnvelope />
              Contact Customer
            </button>
          </div>

          {/* Declined View */}
          {isDeclined && (
            <div className="space-y-6">
              {/* Critical Decision Factor */}
              <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-lg">
                <div className="flex items-start gap-3 mb-4">
                  <FaTimesCircle className="text-red-600 text-xl mt-1" />
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">
                      CRITICAL DECISION FACTOR
                    </h2>
                    <h3 className="text-base font-semibold text-gray-800 mb-2">
                      Reason for Decline
                    </h3>
                    <p className="text-gray-700">
                      {application.trustEngineOutput?.statementAnalysis
                        ?.affordabilityAssessment?.canAffordInstallment ===
                      false
                        ? `Insufficient disposable income - installment would use ${Math.abs(application.trustEngineOutput?.statementAnalysis?.affordabilityAssessment?.affordabilityRatio * 100).toFixed(0)}% of available funds.`
                        : "Application does not meet minimum requirements."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trust Score */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">
                    Trust Score
                  </h3>
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#ef4444"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${trustScore * 3.51} 351.68`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-bold text-red-600">
                          {trustScore}
                        </span>
                      </div>
                    </div>
                    <p className="mt-4 text-sm font-medium text-red-600">
                      {getTrustScoreTier()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Score recalculated{" "}
                      {application.analyzedAt
                        ? new Date(application.analyzedAt).toLocaleString()
                        : "recently"}
                    </p>
                  </div>
                </div>

                {/* Monthly Income */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-sm font-semibold text-gray-500 mb-2">
                    MONTHLY INCOME
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      application.trustEngineOutput?.statementAnalysis
                        ?.incomeAnalysis?.avgMonthlyIncome || 0,
                    )}
                  </div>
                </div>

                {/* Average Spending */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-sm font-semibold text-gray-500 mb-2">
                    AVG. SPENDING
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      application.trustEngineOutput?.statementAnalysis
                        ?.spendingAnalysis?.avgMonthlySpending || 0,
                    )}
                  </div>
                </div>

                {/* Current Debt */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-sm font-semibold text-gray-500 mb-2">
                    CURRENT DEBT
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      application.trustEngineOutput?.statementAnalysis
                        ?.debtProfile?.existingLoanRepayments || 0,
                    )}
                  </div>
                </div>

                {/* Savings */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-sm font-semibold text-gray-500 mb-2">
                    SAVINGS
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      application.trustEngineOutput?.statementAnalysis
                        ?.balanceAnalysis?.avgBalance || 0,
                    )}
                  </div>
                </div>
              </div>

              {/* Risk Assessment Flags */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Risk Assessment Flags
                </h3>
                <div className="space-y-3">
                  {application.trustEngineOutput?.statementAnalysis?.riskFlags?.map(
                    (flag, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-3 p-4 rounded-lg ${
                          flag.severity === "HIGH"
                            ? "bg-red-50 border border-red-200"
                            : flag.severity === "MEDIUM"
                              ? "bg-orange-50 border border-orange-200"
                              : "bg-yellow-50 border border-yellow-200"
                        }`}
                      >
                        <FaExclamationTriangle
                          className={`text-xl mt-0.5 ${
                            flag.severity === "HIGH"
                              ? "text-red-600"
                              : flag.severity === "MEDIUM"
                                ? "text-orange-600"
                                : "text-yellow-600"
                          }`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-gray-900">
                              {flag.flag}
                            </span>
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded ${
                                flag.severity === "HIGH"
                                  ? "bg-red-600 text-white"
                                  : flag.severity === "MEDIUM"
                                    ? "bg-orange-600 text-white"
                                    : "bg-yellow-600 text-white"
                              }`}
                            >
                              {flag.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {flag.description}
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-red-600 text-red-600 rounded-lg hover:bg-red-50">
                  <FaTimesCircle />
                  Delete Application
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  <FaEye />
                  View Logs
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  <FaEnvelope />
                  Contact Customer
                </button>
              </div>
            </div>
          )}

          {/* Approved/Active View */}
          {isApproved && (
            <div className="space-y-6">
              {/* Success Banner */}
              <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg">
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-600 text-xl mt-1" />
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">
                      Approval Success
                    </h2>
                    <p className="text-gray-700">
                      Auto-approved based on trust score of {trustScore}
                    </p>
                  </div>
                  <button className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    View Log
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trust Analytics */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase">
                    Trust Analytics
                  </h3>
                  <div className="flex flex-col items-center">
                    <div className="relative w-40 h-40">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="#e5e7eb"
                          strokeWidth="12"
                          fill="none"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="#22c55e"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${trustScore * 4.4} 440`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-bold text-gray-900">
                          {trustScore}
                        </span>
                        <span className="text-xs text-gray-500">Score</span>
                      </div>
                    </div>
                    <div className="mt-4 px-4 py-1 bg-gray-900 text-white text-xs font-bold rounded-full">
                      {getTrustScoreTier()}
                    </div>
                  </div>
                </div>

                {/* Application Status */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase">
                    Application Status
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <FaCheckCircle className="text-green-600 text-xl" />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          Mandate Activated
                        </div>
                        <div className="text-sm text-gray-500">
                          Completed on{" "}
                          {application.analyzedAt
                            ? formatDate(application.analyzedAt)
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaCheckCircle className="text-green-600 text-xl" />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          Down Payment Received
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.downPaymentReceived
                            ? formatDate(application.createdAt)
                            : "Pending"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaClock className="text-gray-400 text-xl" />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          Scheduled Installments
                        </div>
                        <div className="text-sm text-gray-500">
                          Next payment due{" "}
                          {application.nextPaymentDate
                            ? formatDate(application.nextPaymentDate)
                            : "Not scheduled"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Schedule */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Payment Schedule
                  </h3>
                  <span className="text-sm text-gray-500">
                    {application.installmentCount} Total Payments
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          DATE
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          DESCRIPTION
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          AMOUNT
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          STATUS
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {formatDate(application.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          Down Payment
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {formatCurrency(application.downPaymentRequired)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            PAID
                          </span>
                        </td>
                      </tr>
                      {Array.from({ length: application.installmentCount }).map(
                        (_, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-3 px-4 text-sm text-gray-900">
                              {/* Calculate installment date */}
                              {formatDate(
                                new Date(
                                  new Date(application.createdAt).setMonth(
                                    new Date(application.createdAt).getMonth() +
                                      (index + 1),
                                  ),
                                ).toISOString(),
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-900">
                              Installment #{index + 1}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-900">
                              {formatCurrency(application.installmentAmount)}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                                  index < application.paymentsCompleted
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {index < application.paymentsCompleted
                                  ? "PAID"
                                  : "SCHEDULED"}
                              </span>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  <FaDownload />
                  Download Receipt
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  <FaChartLine />
                  View Payments
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                  Update Details
                </button>
              </div>
            </div>
          )}

          {/* Flagged for Review View */}
          {isFlagged && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded-lg">
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="text-yellow-600 text-xl mt-1" />
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">
                      Manual Review Required
                    </h2>
                    <p className="text-gray-700">
                      This application requires manual review. Trust score:{" "}
                      {trustScore}
                    </p>
                  </div>
                </div>
              </div>

              {/* Similar layout to declined but with approve/decline actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">
                    Trust Score
                  </h3>
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#f59e0b"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${trustScore * 3.51} 351.68`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-bold text-yellow-600">
                          {trustScore}
                        </span>
                      </div>
                    </div>
                    <p className="mt-4 text-sm font-medium text-yellow-600">
                      REQUIRES REVIEW
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-sm font-semibold text-gray-500 mb-2">
                    MONTHLY INCOME
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      application.trustEngineOutput?.statementAnalysis
                        ?.incomeAnalysis?.avgMonthlyIncome || 0,
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="text-sm font-semibold text-gray-500 mb-2">
                    AVG. SPENDING
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      application.trustEngineOutput?.statementAnalysis
                        ?.spendingAnalysis?.avgMonthlySpending || 0,
                    )}
                  </div>
                </div>
              </div>

              {/* Risk Flags */}
              {application.trustEngineOutput?.statementAnalysis?.riskFlags && (
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Risk Assessment Flags
                  </h3>
                  <div className="space-y-3">
                    {application.trustEngineOutput.statementAnalysis.riskFlags.map(
                      (flag, index) => (
                        <div
                          key={index}
                          className={`flex items-start gap-3 p-4 rounded-lg ${
                            flag.severity === "HIGH"
                              ? "bg-red-50 border border-red-200"
                              : "bg-orange-50 border border-orange-200"
                          }`}
                        >
                          <FaExclamationTriangle
                            className={`text-xl mt-0.5 ${
                              flag.severity === "HIGH"
                                ? "text-red-600"
                                : "text-orange-600"
                            }`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-gray-900">
                                {flag.flag}
                              </span>
                              <span
                                className={`text-xs font-bold px-2 py-1 rounded ${
                                  flag.severity === "HIGH"
                                    ? "bg-red-600 text-white"
                                    : "bg-orange-600 text-white"
                                }`}
                              >
                                {flag.severity}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">
                              {flag.description}
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* Manual Review Actions */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Review Decision
                </h3>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
                    <FaCheckCircle />
                    Approve Application
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">
                    <FaTimesCircle />
                    Decline Application
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    <FaEye />
                    View Full Analysis
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ApplicationDetailsScreen() {
  return (
    <AuthGuard>
      <ApplicationDetailsContent />
    </AuthGuard>
  );
}
