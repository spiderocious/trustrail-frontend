import { useState } from "react";
import { FaEdit, FaFileAlt, FaArrowRight } from "react-icons/fa";
import { NIGERIAN_BANKS } from "@features/auth/helpers/nigerian-banks";
import { formatCurrency } from "@features/dashboard/helpers/format-currency";
import type { CustomerApplicationData, PublicTrustWallet } from "../../types";

interface Step4ReviewSubmitProps {
  data: CustomerApplicationData;
  trustWallet: PublicTrustWallet;
  onEdit: (step: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function Step4ReviewSubmit({
  data,
  trustWallet,
  onEdit,
  onSubmit,
  isSubmitting,
}: Step4ReviewSubmitProps) {
  const [consents, setConsents] = useState({
    directDebit: false,
    terms: false,
    accuracy: false,
  });

  const bankName =
    NIGERIAN_BANKS.find((b) => b.code === data.bankCode)?.name || "Unknown";

  const allConsentsChecked =
    consents.directDebit && consents.terms && consents.accuracy;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (allConsentsChecked && !isSubmitting) {
      onSubmit();
    }
  }

  // Calculate down payment amount
  const downPaymentAmount =
    (trustWallet.installmentPlan.totalAmount *
      trustWallet.installmentPlan.downPaymentPercentage) /
    100;

  // Mask BVN (show only last 2 digits)
  const maskedBvn =
    data.bvn.length === 11 ? `${"*".repeat(9)}${data.bvn.slice(-2)}` : data.bvn;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Review & Submit</h2>
        <p className="mt-2 text-sm text-gray-600">
          Please confirm all details are correct before submitting your
          application.
        </p>
      </div>

      {/* Personal Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Personal Info</h3>
          <button
            type="button"
            onClick={() => onEdit(1)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            <FaEdit /> Edit
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500 text-xs uppercase mb-1">Full Name</p>
            <p className="text-gray-900 font-medium">
              {data.firstName} {data.lastName}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase mb-1">
              Email Address
            </p>
            <p className="text-gray-900 font-medium">{data.email}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase mb-1">Phone Number</p>
            <p className="text-gray-900 font-medium">
              +{data.phoneNumber.slice(0, 3)} {data.phoneNumber.slice(3, 6)}{" "}
              {data.phoneNumber.slice(6, 9)} {data.phoneNumber.slice(9)}
            </p>
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Bank Details</h3>
          <button
            type="button"
            onClick={() => onEdit(2)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            <FaEdit /> Edit
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500 text-xs uppercase mb-1">Bank Name</p>
            <p className="text-gray-900 font-medium">{bankName}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase mb-1">
              Account Number
            </p>
            <p className="text-gray-900 font-medium">{data.accountNumber}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase mb-1">BVN</p>
            <p className="text-gray-900 font-medium">{maskedBvn}</p>
          </div>
        </div>
      </div>

      {/* Bank Statement */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Bank Statement</h3>
          <button
            type="button"
            onClick={() => onEdit(3)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            <FaEdit /> Edit
          </button>
        </div>
        {data.bankStatement && (
          <div className="flex items-center gap-3 text-sm">
            <div className="bg-blue-100 text-blue-600 p-2 rounded">
              <FaFileAlt className="text-lg" />
            </div>
            <div>
              <p className="text-gray-900 font-medium">
                {data.bankStatement.name}
              </p>
              <p className="text-gray-500 text-xs">
                {(data.bankStatement.size / 1024).toFixed(0)} KB • Verified
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Payment Plan */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Payment Plan</h3>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-gray-500 text-xs uppercase mb-1">Total Amount</p>
            <p className="text-gray-900 font-bold text-2xl">
              {formatCurrency(trustWallet.installmentPlan.totalAmount)}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase mb-1">Downpayment</p>
            <p className="text-gray-900 font-bold text-2xl">
              {formatCurrency(downPaymentAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Consents */}
      <div className="space-y-3">
        <label className="flex gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consents.directDebit}
            onChange={(e) =>
              setConsents({ ...consents, directDebit: e.target.checked })
            }
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div>
            <p className="font-medium text-gray-900 text-sm">
              I authorize direct debit
            </p>
            <p className="text-xs text-gray-600">
              I hereby authorize the institution to deduct repayments directly
              from my linked bank account.
            </p>
          </div>
        </label>

        <label className="flex gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consents.terms}
            onChange={(e) =>
              setConsents({ ...consents, terms: e.target.checked })
            }
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div>
            <p className="font-medium text-gray-900 text-sm">
              I agree to Terms
            </p>
            <p className="text-xs text-gray-600">
              I have read and accepted the Terms and Conditions and Privacy
              Policy.
            </p>
          </div>
        </label>

        <label className="flex gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consents.accuracy}
            onChange={(e) =>
              setConsents({ ...consents, accuracy: e.target.checked })
            }
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div>
            <p className="font-medium text-gray-900 text-sm">
              I confirm accuracy
            </p>
            <p className="text-xs text-gray-600">
              I confirm that all information provided in this application is
              true and accurate to the best of my knowledge.
            </p>
          </div>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!allConsentsChecked || isSubmitting}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>Submitting Application...</>
        ) : (
          <>
            Submit Application <FaArrowRight />
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-500">
        By clicking submit, your application will be sent for immediate review.
        This action cannot be undone.
      </p>
    </form>
  );
}
