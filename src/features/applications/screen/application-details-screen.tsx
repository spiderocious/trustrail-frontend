import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthGuard } from "@features/auth/guards/auth-guard";
import { DashboardSidebar } from "@features/dashboard/screen/parts/dashboard-sidebar";
import { DashboardHeader } from "@features/dashboard/screen/parts/dashboard-header";
import { useApplicationDetails } from "../api/use-application-details";
import { formatCurrency } from "@features/dashboard/helpers/format-currency";
import {
  formatDate,
  formatDateTime,
} from "@features/dashboard/helpers/format-date";
import {
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaClock,
  FaEnvelope,
  FaDownload,
  FaCalendar,
  FaWallet,
  FaChartLine,
  FaExchangeAlt,
  FaMoneyBill,
  FaCreditCard,
  FaPhone,
  FaFileAlt,
  FaShieldAlt,
} from "react-icons/fa";
import { useState } from "react";
import { Anything } from "../../../shared/types";
import { useApproveApplication } from "../api/use-approve-application";
import { useDeclineApplication } from "../api/use-decline-application";
import { ActionModal } from "./parts/action-modal";
import { downloadApplicationReport } from "../helpers/download-report";
import { contactCustomer } from "../helpers/contact-customer";

function ApplicationDetailsContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useApplicationDetails(id);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const approveApplication = useApproveApplication();
  const declineApplication = useDeclineApplication();

  const handleApprove = async (reason: string) => {
    if (!id) return;
    try {
      await approveApplication.mutateAsync({
        applicationId: id,
        reason,
      });
      setShowApproveModal(false);
      setNotification({
        type: "success",
        message: "Application approved successfully!",
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (error: unknown) {
      setNotification({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to approve application",
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleDecline = async (reason: string) => {
    if (!id) return;
    try {
      await declineApplication.mutateAsync({
        applicationId: id,
        reason,
      });
      setShowDeclineModal(false);
      setNotification({
        type: "success",
        message: "Application declined successfully!",
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (error: unknown) {
      setNotification({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to decline application",
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
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
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1">
          <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
          <div className="p-4 sm:p-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 sm:p-8 text-center max-w-md mx-auto">
              <FaTimesCircle className="text-4xl sm:text-5xl text-red-600 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Application Not Found
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                The application you're looking for doesn't exist or you don't
                have access to it.
              </p>
              <button
                onClick={() => navigate("/applications")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
              >
                Back to Applications
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const app = data.data;
  const analysis = app.trustEngineOutput?.statementAnalysis;
  const trustScore = app.trustEngineOutput?.trustScore || 0;
  const decision = app.trustEngineOutput?.decision;
  const customerName = `${app.customerDetails.firstName} ${app.customerDetails.lastName}`;

  const getStatusConfig = () => {
    const status = app.status;
    const configs: Record<
      string,
      { color: string; bg: string; icon: Anything; label: string }
    > = {
      PENDING: {
        color: "text-gray-700",
        bg: "bg-gray-100",
        icon: FaClock,
        label: "Pending Analysis",
      },
      ANALYZING: {
        color: "text-blue-700",
        bg: "bg-blue-100",
        icon: FaSpinner,
        label: "Analyzing...",
      },
      FLAGGED_FOR_REVIEW: {
        color: "text-yellow-700",
        bg: "bg-yellow-100",
        icon: FaExclamationTriangle,
        label: "Flagged for Review",
      },
      AUTO_APPROVED: {
        color: "text-green-700",
        bg: "bg-green-100",
        icon: FaCheckCircle,
        label: "Auto-Approved",
      },
      APPROVED: {
        color: "text-green-700",
        bg: "bg-green-100",
        icon: FaCheckCircle,
        label: "Approved",
      },
      MANDATE_CREATED: {
        color: "text-emerald-700",
        bg: "bg-emerald-100",
        icon: FaShieldAlt,
        label: "Mandate Created",
      },
      AUTO_DECLINED: {
        color: "text-red-700",
        bg: "bg-red-100",
        icon: FaTimesCircle,
        label: "Auto-Declined",
      },
      DECLINED: {
        color: "text-red-700",
        bg: "bg-red-100",
        icon: FaTimesCircle,
        label: "Declined",
      },
      ACTIVE: {
        color: "text-blue-700",
        bg: "bg-blue-100",
        icon: FaChartLine,
        label: "Active",
      },
      COMPLETED: {
        color: "text-green-700",
        bg: "bg-green-100",
        icon: FaCheckCircle,
        label: "Completed",
      },
    };
    return (
      configs[status] || {
        color: "text-gray-700",
        bg: "bg-gray-100",
        icon: FaClock,
        label: status,
      }
    );
  };

  const statusConfig = getStatusConfig();

  const getTrustScoreGrade = () => {
    if (trustScore >= 80)
      return {
        label: "Excellent",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
      };
    if (trustScore >= 60)
      return { label: "Good", color: "text-blue-600", bg: "bg-blue-50" };
    if (trustScore >= 40)
      return { label: "Fair", color: "text-yellow-600", bg: "bg-yellow-50" };
    if (trustScore >= 20)
      return { label: "Poor", color: "text-orange-600", bg: "bg-orange-50" };
    return { label: "Critical", color: "text-red-600", bg: "bg-red-50" };
  };

  const gradeConfig = getTrustScoreGrade();

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 overflow-y-auto">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Hero Section */}
        <div className="bg-gradient-to-r bg-blue-600 text-white p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-xs sm:text-sm mb-3 sm:mb-4 opacity-90">
              <Link to="/applications" className="hover:underline">
                Applications
              </Link>
              <span>/</span>
              <span className="truncate max-w-[120px] sm:max-w-none">{app.applicationId}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-3xl font-bold mb-2">{customerName}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm opacity-90">
                  <span className="flex items-center gap-1.5">
                    <FaEnvelope className="text-xs" />
                    <span className="truncate">{app.customerDetails.email}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FaPhone className="text-xs" />
                    {app.customerDetails.phoneNumber}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FaCalendar className="text-xs" />
                    Applied {formatDate(app.submittedAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full ${statusConfig.bg} flex items-center gap-1.5 sm:gap-2`}
                >
                  <statusConfig.icon
                    className={`text-sm sm:text-lg ${statusConfig.color}`}
                  />
                  <span className={`font-semibold text-xs sm:text-base ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>
                <button
                  onClick={() => contactCustomer(app)}
                  className="hidden sm:flex px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors"
                >
                  <FaEnvelope className="inline mr-2" />
                  Contact
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-4 sm:space-y-6">
          {/* Trust Score Card */}
          <div
            className={`rounded-xl p-4 sm:p-8 ${gradeConfig.bg} border-l-4 ${gradeConfig.color.replace("text-", "border-")}`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-8">
                <div className="relative flex-shrink-0">
                  <svg className="w-24 h-24 sm:w-32 sm:h-32 transform -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="40%"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="40%"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className={gradeConfig.color}
                      strokeDasharray={`${trustScore * 2.51} 251.68`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div
                        className={`text-2xl sm:text-4xl font-bold ${gradeConfig.color}`}
                      >
                        {trustScore}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-500">Score</div>
                    </div>
                  </div>
                </div>

                <div className="text-center sm:text-left">
                  <div
                    className={`text-lg sm:text-2xl font-bold ${gradeConfig.color} mb-1`}
                  >
                    {gradeConfig.label} Credit Profile
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                    Based on {analysis?.periodCovered?.monthsAnalyzed || 1}{" "}
                    month(s) of bank statement analysis
                  </div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span
                      className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${statusConfig.bg} ${statusConfig.color}`}
                    >
                      {decision || app.status}
                    </span>
                    {analysis?.affordabilityAssessment?.canAffordInstallment !==
                      undefined && (
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
                          analysis.affordabilityAssessment.canAffordInstallment
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {analysis.affordabilityAssessment.canAffordInstallment
                          ? "Can Afford"
                          : "Cannot Afford"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-center lg:text-right">
                <div className="text-xs sm:text-sm text-gray-500 mb-1">
                  Total Amount Requested
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {formatCurrency(app.totalAmount)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
                  {app.installmentCount} ×{" "}
                  {formatCurrency(app.installmentAmount)} {app.frequency}
                </div>
              </div>
            </div>
          </div>

          {/* Financial Overview Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <FaMoneyBill className="text-green-600 text-sm sm:text-base" />
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">
                  Monthly Income
                </div>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-gray-900">
                {formatCurrency(
                  analysis?.incomeAnalysis?.avgMonthlyIncome || 0,
                )}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                Consistency:{" "}
                {(
                  (analysis?.incomeAnalysis?.incomeConsistency || 0) * 100
                ).toFixed(0)}
                %
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <FaExchangeAlt className="text-orange-600 text-sm sm:text-base" />
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">
                  Monthly Spending
                </div>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-gray-900">
                {formatCurrency(
                  analysis?.spendingAnalysis?.avgMonthlySpending || 0,
                )}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                {analysis?.spendingAnalysis?.totalSpending ||
                0 > (analysis?.incomeAnalysis?.totalIncome || 0)
                  ? "Exceeds income"
                  : "Within income"}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaWallet className="text-blue-600 text-sm sm:text-base" />
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">
                  Avg Balance
                </div>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-gray-900">
                {formatCurrency(analysis?.balanceAnalysis?.avgBalance || 0)}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 mt-1 hidden sm:block">
                Range:{" "}
                {formatCurrency(analysis?.balanceAnalysis?.minBalance || 0)} -{" "}
                {formatCurrency(analysis?.balanceAnalysis?.maxBalance || 0)}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <FaCreditCard className="text-purple-600 text-sm sm:text-base" />
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">
                  Disposable Income
                </div>
              </div>
              <div
                className={`text-lg sm:text-2xl font-bold ${
                  (analysis?.affordabilityAssessment?.disposableIncome || 0) >=
                  0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatCurrency(
                  analysis?.affordabilityAssessment?.disposableIncome || 0,
                )}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 mt-1">After expenses</div>
            </div>
          </div>

          {/* Risk Flags */}
          {analysis?.riskFlags && analysis.riskFlags.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaShieldAlt className="text-gray-400" />
                Risk Assessment Flags ({analysis.riskFlags.length})
              </h3>
              <div className="space-y-3">
                {analysis.riskFlags.map((flag, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      flag.severity === "HIGH"
                        ? "bg-red-50 border-red-500"
                        : flag.severity === "MEDIUM"
                          ? "bg-orange-50 border-orange-500"
                          : "bg-yellow-50 border-yellow-500"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <FaExclamationTriangle
                            className={
                              flag.severity === "HIGH"
                                ? "text-red-600"
                                : flag.severity === "MEDIUM"
                                  ? "text-orange-600"
                                  : "text-yellow-600"
                            }
                          />
                          <span className="font-semibold text-gray-900">
                            {flag.flag}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {flag.description}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Financial Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Income Sources */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Income Sources
              </h3>
              <div className="space-y-4">
                {analysis?.incomeAnalysis?.incomeSources?.map(
                  (source, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-green-500 pl-4"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          Source #{index + 1}
                        </span>
                        <span className="text-sm font-semibold text-green-600">
                          ~{formatCurrency(source.avgAmount)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        {source.description}
                      </p>
                      <span className="inline-block px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded">
                        {source.frequency}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Spending Breakdown */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Spending Categories
              </h3>
              <div className="space-y-3">
                {analysis?.spendingAnalysis?.spendingCategories &&
                  Object.entries(
                    analysis.spendingAnalysis.spendingCategories,
                  ).map(([category, amount]) => {
                    const total = analysis.spendingAnalysis.totalSpending;
                    const percentage = ((amount / total) * 100).toFixed(1);
                    return (
                      <div key={category}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700 capitalize">
                            {category}
                          </span>
                          <span className="text-gray-900 font-semibold">
                            {formatCurrency(amount)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {percentage}% of total
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Behavior Metrics */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Transaction Behavior
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">
                  Total Transactions
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {analysis?.behaviorAnalysis?.transactionCount || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  ~
                  {(
                    analysis?.behaviorAnalysis?.avgDailyTransactions || 0
                  ).toFixed(1)}
                  /day
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Bounce Count</div>
                <div
                  className={`text-3xl font-bold ${
                    (analysis?.behaviorAnalysis?.bounceCount || 0) > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {analysis?.behaviorAnalysis?.bounceCount || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Failed transactions
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">
                  Overdraft Usage
                </div>
                <div
                  className={`text-3xl font-bold ${
                    analysis?.behaviorAnalysis?.overdraftUsage
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                >
                  {analysis?.behaviorAnalysis?.overdraftUsage ? "Yes" : "No"}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Facility status
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Debt-to-Income</div>
                <div className="text-3xl font-bold text-gray-900">
                  {(
                    (analysis?.debtProfile?.debtToIncomeRatio || 0) * 100
                  ).toFixed(1)}
                  %
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Existing obligations
                </div>
              </div>
            </div>
          </div>

          {/* Application Timeline */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Application Timeline
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaFileAlt className="text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    Application Submitted
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDateTime(app.submittedAt)}
                  </div>
                </div>
              </div>
              {app.analyzedAt && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <FaChartLine className="text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Analysis Completed
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDateTime(app.analyzedAt)}
                    </div>
                  </div>
                </div>
              )}
              {app.updatedAt && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <FaCheckCircle className="text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Application Approved
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDateTime(app.updatedAt)}
                    </div>
                  </div>
                </div>
              )}
              {app.pwaMandateRef && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <FaShieldAlt className="text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Mandate Created
                    </div>
                    <div className="text-sm text-gray-500 font-mono">
                      {app.pwaMandateRef}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {app.status === "FLAGGED_FOR_REVIEW" && (
              <>
                <button
                  onClick={() => setShowApproveModal(true)}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <FaCheckCircle />
                  <span className="hidden sm:inline">Approve Application</span>
                  <span className="sm:hidden">Approve</span>
                </button>
                <button
                  onClick={() => setShowDeclineModal(true)}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <FaTimesCircle />
                  <span className="hidden sm:inline">Decline Application</span>
                  <span className="sm:hidden">Decline</span>
                </button>
              </>
            )}
            <button
              onClick={() => downloadApplicationReport(app)}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <FaDownload />
              <span className="hidden sm:inline">Download Report</span>
              <span className="sm:hidden">Report</span>
            </button>
            <button
              onClick={() => contactCustomer(app)}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <FaEnvelope />
              <span className="hidden sm:inline">Contact Customer</span>
              <span className="sm:hidden">Contact</span>
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-4 right-4 z-50 transition-all duration-300 ease-in-out">
            <div
              className={`px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
                notification.type === "success"
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {notification.type === "success" ? (
                <FaCheckCircle className="text-xl" />
              ) : (
                <FaTimesCircle className="text-xl" />
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        )}

        {/* Approve Modal */}
        <ActionModal
          isOpen={showApproveModal}
          onClose={() => setShowApproveModal(false)}
          onConfirm={handleApprove}
          title="Approve Application"
          description={`Are you sure you want to approve ${customerName}'s application?`}
          confirmLabel="Approve"
          confirmButtonClass="bg-green-600 hover:bg-green-700"
          isLoading={approveApplication.isPending}
          requireReason={false}
        />

        {/* Decline Modal */}
        <ActionModal
          isOpen={showDeclineModal}
          onClose={() => setShowDeclineModal(false)}
          onConfirm={handleDecline}
          title="Decline Application"
          description={`Please provide a reason for declining ${customerName}'s application.`}
          confirmLabel="Decline"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
          isLoading={declineApplication.isPending}
          requireReason={true}
        />
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
