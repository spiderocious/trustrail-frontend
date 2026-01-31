import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthGuard } from "@features/auth/guards/auth-guard";
import { DashboardSidebar } from "@features/dashboard/screen/parts/dashboard-sidebar";
import { DashboardHeader } from "@features/dashboard/screen/parts/dashboard-header";
import {
  useCreateTrustWallet,
  type CreateTrustWalletPayload,
} from "../api/use-create-trust-wallet";
import { formatCurrency } from "@features/dashboard/helpers/format-currency";
import {
  calculateDownPaymentAmount,
  calculateInstallmentAmount,
} from "../helpers/calculations";
import {
  FaInfoCircle,
  FaCreditCard,
  FaShieldAlt,
  FaEye,
  FaSpinner,
} from "react-icons/fa";

function CreateTrustWalletContent() {
  const navigate = useNavigate();
  const createMutation = useCreateTrustWallet();

  const [formData, setFormData] = useState<CreateTrustWalletPayload>({
    name: "",
    description: "",
    installmentPlan: {
      totalAmount: 10000000, // 100,000 in kobo
      downPaymentPercentage: 20,
      installmentCount: 4,
      frequency: "monthly",
      interestRate: 0,
    },
    approvalWorkflow: {
      autoApproveThreshold: 70,
      autoDeclineThreshold: 20,
      minTrustScore: 50,
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const downPaymentAmount = calculateDownPaymentAmount(
    formData.installmentPlan.totalAmount,
    formData.installmentPlan.downPaymentPercentage,
  );

  const installmentAmount = calculateInstallmentAmount(
    formData.installmentPlan.totalAmount,
    formData.installmentPlan.downPaymentPercentage,
    formData.installmentPlan.installmentCount,
  );

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "TrustWallet name is required";
    }

    if (formData.installmentPlan.totalAmount < 100) {
      newErrors.totalAmount = "Amount must be at least ₦1.00";
    }

    if (
      formData.installmentPlan.downPaymentPercentage < 0 ||
      formData.installmentPlan.downPaymentPercentage > 100
    ) {
      newErrors.downPaymentPercentage = "Must be between 0 and 100";
    }

    if (formData.installmentPlan.installmentCount < 1) {
      newErrors.installmentCount = "Must be at least 1";
    }

    if (
      formData.approvalWorkflow.autoApproveThreshold <=
      formData.approvalWorkflow.autoDeclineThreshold
    ) {
      newErrors.autoApproveThreshold =
        "Auto-approve threshold must be greater than auto-decline threshold";
    }

    if (
      formData.approvalWorkflow.minTrustScore >
      formData.approvalWorkflow.autoApproveThreshold
    ) {
      newErrors.minTrustScore =
        "Min trust score must be <= auto-approve threshold";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    createMutation.mutate(formData, {
      onSuccess: (response) => {
        navigate(`/trustwallets/${response.data.trustWalletId}`);
      },
      onError: (error) => {
        setErrors({
          submit:
            error instanceof Error
              ? error.message
              : "Failed to create TrustWallet",
        });
      },
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Create New TrustWallet
              </h1>
              <p className="text-gray-600">
                Configure your business wallet and installment rules for
                automated financing.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info Section */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <FaInfoCircle className="text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Basic Info
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TrustWallet Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Q4 Tech Gadgets Installment Plan"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className={`w-full px-4 py-2 border ${errors.name ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.name && (
                      <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      placeholder="Describe the purpose of this wallet for your customers..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Installment Plan Section */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <FaCreditCard className="text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Payment Plan
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Amount (₦)
                    </label>
                    <input
                      type="number"
                      placeholder="100000"
                      value={formData.installmentPlan.totalAmount / 100}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          installmentPlan: {
                            ...formData.installmentPlan,
                            totalAmount: Number(e.target.value) * 100,
                          },
                        })
                      }
                      className={`w-full px-4 py-2 border ${errors.totalAmount ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.totalAmount && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.totalAmount}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Down Payment %
                    </label>
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={formData.installmentPlan.downPaymentPercentage}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            installmentPlan: {
                              ...formData.installmentPlan,
                              downPaymentPercentage: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full"
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-gray-600">0%</span>
                        <span className="text-sm font-semibold text-blue-600">
                          {formData.installmentPlan.downPaymentPercentage}%
                        </span>
                        <span className="text-sm text-gray-600">100%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Installments
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.installmentPlan.installmentCount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          installmentPlan: {
                            ...formData.installmentPlan,
                            installmentCount: Number(e.target.value),
                          },
                        })
                      }
                      className={`w-full px-4 py-2 border ${errors.installmentCount ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select
                      value={formData.installmentPlan.frequency}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          installmentPlan: {
                            ...formData.installmentPlan,
                            frequency: e.target.value as "weekly" | "monthly",
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>

                {/* Live Breakdown */}
                <div className="border-2 border-dashed border-blue-200 rounded-lg p-4 bg-blue-50">
                  <div className="text-sm font-semibold text-blue-900 mb-3">
                    LIVE BREAKDOWN
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-blue-700 mb-1">
                        Down Payment
                      </div>
                      <div className="text-2xl font-bold text-blue-900">
                        {formatCurrency(downPaymentAmount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-blue-700 mb-1">
                        Monthly Installments
                      </div>
                      <div className="text-2xl font-bold text-blue-900">
                        {formData.installmentPlan.installmentCount} payments of{" "}
                        {formatCurrency(installmentAmount)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Approval Rules Section */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <FaShieldAlt className="text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Approval Rules
                  </h2>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Set automated scoring thresholds for credit decisions.
                </p>

                <br />

                {/* Visual Threshold Bar */}
                <div className="relative h-8 bg-gradient-to-r from-red-500 via-yellow-500 via-blue-500 to-green-500 rounded-lg mb-6">
                  <div
                    className="absolute top-0 h-full w-1 bg-white"
                    style={{
                      left: `${formData.approvalWorkflow.autoDeclineThreshold}%`,
                    }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-semibold text-red-700 whitespace-nowrap">
                      AUTO-DECLINE
                    </div>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-900">
                      {formData.approvalWorkflow.autoDeclineThreshold}
                    </div>
                  </div>
                  <div
                    className="absolute top-0 h-full w-1 bg-white"
                    style={{
                      left: `${formData.approvalWorkflow.minTrustScore}%`,
                    }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-semibold text-yellow-700 whitespace-nowrap">
                      MIN REQUIRED
                    </div>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-900">
                      {formData.approvalWorkflow.minTrustScore}
                    </div>
                  </div>
                  <div
                    className="absolute top-0 h-full w-1 bg-white"
                    style={{
                      left: `${formData.approvalWorkflow.autoApproveThreshold}%`,
                    }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-semibold text-green-700 whitespace-nowrap">
                      AUTO-APPROVE
                    </div>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-900">
                      {formData.approvalWorkflow.autoApproveThreshold}
                    </div>
                  </div>
                  <div className="absolute -left-2 top-0 h-full flex items-center text-xs font-semibold text-gray-700">
                    0
                  </div>
                  <div className="absolute -right-2 top-0 h-full flex items-center text-xs font-semibold text-gray-700">
                    100
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auto-Decline (Score ≤)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.approvalWorkflow.autoDeclineThreshold}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          approvalWorkflow: {
                            ...formData.approvalWorkflow,
                            autoDeclineThreshold: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Score ≤ {formData.approvalWorkflow.autoDeclineThreshold}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Manual Review
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.approvalWorkflow.minTrustScore}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          approvalWorkflow: {
                            ...formData.approvalWorkflow,
                            minTrustScore: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Manual Review</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auto-Approve (Score ≥)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.approvalWorkflow.autoApproveThreshold}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          approvalWorkflow: {
                            ...formData.approvalWorkflow,
                            autoApproveThreshold: Number(e.target.value),
                          },
                        })
                      }
                      className={`w-full px-4 py-2 border ${errors.autoApproveThreshold ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Score ≥ {formData.approvalWorkflow.autoApproveThreshold}
                    </p>
                    {errors.autoApproveThreshold && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors.autoApproveThreshold}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              <div className="bg-white rounded-lg p-6 shadow-sm hidden">
                <div className="flex items-center gap-2 mb-6">
                  <FaEye className="text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Preview
                  </h2>
                </div>

                <div className="max-w-md mx-auto bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg p-8 text-center">
                  <div className="text-2xl font-bold mb-2">
                    {formData.name || "Gadgets Pro Plan"}
                  </div>
                  <div className="text-sm mb-6 opacity-90">Price</div>
                  <div className="text-4xl font-bold mb-6">
                    {formatCurrency(formData.installmentPlan.totalAmount)}
                  </div>
                  <div className="text-sm mb-2 opacity-90">Starting at</div>
                  <div className="text-2xl font-bold mb-6">
                    {formatCurrency(downPaymentAmount)}/mo
                  </div>
                  <button
                    type="button"
                    className="w-full bg-white text-blue-600 font-semibold py-3 rounded-lg"
                  >
                    Select This Plan
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {errors.submit}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/trustwallets")}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>Create TrustWallet</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export function CreateTrustWalletScreen() {
  return (
    <AuthGuard>
      <CreateTrustWalletContent />
    </AuthGuard>
  );
}
