import { useParams, useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaCalendarAlt,
  FaPercentage,
  FaGem,
} from "react-icons/fa";
import { usePublicTrustWallet } from "../api/use-public-trustwallet";
import { formatCurrency } from "@features/dashboard/helpers/format-currency";

export function PublicTrustWalletScreen() {
  const { trustWalletId } = useParams<{ trustWalletId: string }>();
  const navigate = useNavigate();

  const trustWalletQuery = usePublicTrustWallet(trustWalletId || "");

  if (trustWalletQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (trustWalletQuery.error || !trustWalletQuery.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">
            This installment plan is not available. Please contact the business.
          </p>
        </div>
      </div>
    );
  }

  const trustWallet = trustWalletQuery.data.data;
  const plan = trustWallet.installmentPlan;
  console.log(trustWalletQuery.data, trustWallet, plan);
  // Calculate amounts
  const downPaymentAmount =
    (plan.totalAmount * plan.downPaymentPercentage) / 100;
  const amountToFinance = plan.totalAmount - downPaymentAmount;
  const installmentAmount = Math.round(amountToFinance / plan.installmentCount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-lg mb-4">
            <FaGem className="text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {trustWallet.businessName}
          </h1>
          <p className="text-xl text-gray-600">{trustWallet.name}</p>
          {trustWallet.description && (
            <p className="text-gray-500 mt-2">{trustWallet.description}</p>
          )}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
            <h2 className="text-2xl font-bold mb-2">Payment Plan</h2>
            <p className="text-blue-100">
              Flexible payment options tailored for you
            </p>
          </div>

          {/* Plan Details */}
          <div className="p-8">
            {/* Total Amount */}
            <div className="mb-8">
              <p className="text-sm text-gray-500 uppercase mb-2">
                Total Amount
              </p>
              <p className="text-4xl font-bold text-gray-900">
                {formatCurrency(plan.totalAmount)}
              </p>
            </div>

            {/* Payment Breakdown Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Down Payment */}
              {/* <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <FaCheckCircle />
                  <span className="text-sm font-medium uppercase">
                    Down Payment
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(downPaymentAmount)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {plan.downPaymentPercentage}% upfront
                </p>
              </div> */}

              {/* Installments */}
              <div className="bg-green-50 rounded-lg p-6 border border-green-100">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <FaCalendarAlt />
                  <span className="text-sm font-medium uppercase">
                    Per Payment
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(installmentAmount)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {plan.installmentCount} {plan.frequency} payments
                </p>
              </div>

              {/* Interest */}
              <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
                <div className="flex items-center gap-2 text-purple-600 mb-2">
                  <FaPercentage />
                  <span className="text-sm font-medium uppercase">
                    Interest Rate
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {plan.interestRate}%
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {plan.interestRate === 0 ? "Interest-free!" : "Per annum"}
                </p>
              </div>
            </div>

            {/* Payment Schedule */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">
                Payment Schedule
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Today</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(downPaymentAmount)} (Down Payment)
                  </span>
                </div>
                {Array.from({ length: plan.installmentCount }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-gray-600">
                      Month {i + 1} ({plan.frequency})
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(installmentAmount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            {trustWallet.requirements &&
              trustWallet.requirements.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Requirements
                  </h3>
                  <ul className="space-y-2">
                    {trustWallet.requirements.map((req, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-gray-700"
                      >
                        <FaCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Apply Button */}
            <button
              onClick={() => navigate(`/apply/${trustWalletId}/form`)}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg shadow-lg hover:shadow-xl"
            >
              Apply Now
            </button>

            <p className="text-center text-xs text-gray-500 mt-4">
              Approval typically takes 2-5 minutes
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-8 mt-8 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-green-600" />
            <span>Secure Processing</span>
          </div>
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-green-600" />
            <span>Instant Approval</span>
          </div>
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-green-600" />
            <span>No Hidden Fees</span>
          </div>
        </div>
      </div>
    </div>
  );
}
