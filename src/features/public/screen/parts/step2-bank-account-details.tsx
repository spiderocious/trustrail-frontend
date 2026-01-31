import { useState } from "react";
import { FaInfoCircle, FaLock, FaCheckCircle } from "react-icons/fa";
import { NIGERIAN_BANKS } from "@/features/auth/helpers/nigerian-banks";
import {
  validateAccountNumber,
  validateBankCode,
} from "@/features/auth/helpers/validation";
import type { CustomerApplicationData } from "../../types";

interface Step2BankAccountDetailsProps {
  data: CustomerApplicationData;
  onUpdate: (data: Partial<CustomerApplicationData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2BankAccountDetails({
  data,
  onUpdate,
  onNext,
  onBack,
}: Step2BankAccountDetailsProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showBvn, setShowBvn] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate bank code
    if (!data.bankCode) {
      newErrors.bankCode = "Please select a bank";
    }

    // Validate account number
    const accountError = validateAccountNumber(data.accountNumber);
    if (accountError) {
      newErrors.accountNumber = accountError;
    }

    // Validate BVN (11 digits)
    if (!data.bvn.trim()) {
      newErrors.bvn = "BVN is required";
    } else if (!/^\d{11}$/.test(data.bvn)) {
      newErrors.bvn = "BVN must be exactly 11 digits";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  }

  const accountNumberValid =
    data.accountNumber.length === 10 && !errors.accountNumber;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Bank Account Details
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Please provide your valid Nigerian bank details to continue.
        </p>
      </div>

      {/* Auto-debit Information Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <FaInfoCircle className="text-blue-600 text-lg flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 text-sm">
              Auto-debit Information
            </h3>
            <p className="text-sm text-blue-800 mt-1">
              Installments will auto-debit from this account on your payment
              dates.
            </p>
          </div>
        </div>
      </div>

      {/* Bank Name */}
      <div>
        <label
          htmlFor="bankCode"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Bank Name
        </label>
        <select
          id="bankCode"
          value={data.bankCode}
          onChange={(e) => onUpdate({ bankCode: e.target.value })}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white ${
            errors.bankCode ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select your bank</option>
          {NIGERIAN_BANKS.map((bank) => (
            <option key={bank.code} value={bank.code}>
              {bank.name}
            </option>
          ))}
        </select>
        {errors.bankCode && (
          <p className="mt-1 text-sm text-red-600">{errors.bankCode}</p>
        )}
      </div>

      {/* Account Number */}
      <div>
        <label
          htmlFor="accountNumber"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Account Number
        </label>
        <div className="relative">
          <input
            type="text"
            id="accountNumber"
            value={data.accountNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              onUpdate({ accountNumber: value });
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.accountNumber ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="0123456789"
            maxLength={10}
          />
          {accountNumberValid && (
            <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-xl" />
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500">Must be exactly 10 digits</p>
        {errors.accountNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>
        )}
      </div>

      {/* BVN */}
      <div>
        <label
          htmlFor="bvn"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          BVN (Bank Verification Number)
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <FaLock className="text-gray-400" />
          </div>
          <input
            type={showBvn ? "text" : "password"}
            id="bvn"
            value={data.bvn}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              onUpdate({ bvn: value });
            }}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.bvn ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="••••••••••"
            maxLength={11}
            onFocus={() => setShowBvn(true)}
            onBlur={() => setShowBvn(false)}
          />
        </div>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-xs text-blue-600">
            Dial <span className="font-semibold">*565*0#</span> to get your BVN
          </p>
          <p className="text-xs text-gray-500">11 digits</p>
        </div>
        {errors.bvn && (
          <p className="mt-1 text-sm text-red-600">{errors.bvn}</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-white text-gray-700 py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Next Step
        </button>
      </div>
    </form>
  );
}
