import { useState, ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaInfoCircle,
  FaEnvelope,
  FaSpinner,
} from "react-icons/fa";
import { ROUTES } from "@shared/constants/routes/routes";
import { BusinessDetailsFormData } from "../register-screen";
import { NIGERIAN_BANKS } from "../../helpers/nigerian-banks";
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validatePhoneNumber,
  validateAccountNumber,
  validateBankCode,
  validateBusinessName,
  validateRcNumber,
  getPasswordStrength,
} from "../../helpers/validation";

interface BusinessDetailsStepProps {
  initialData: BusinessDetailsFormData;
  onSubmit: (data: BusinessDetailsFormData) => void;
}

export function BusinessDetailsStep({
  initialData,
  onSubmit,
}: BusinessDetailsStepProps) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<
    Partial<Record<keyof BusinessDetailsFormData, string>>
  >({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove non-digits
    const cleaned = value.replace(/\D/g, "");
    // Ensure it starts with 234
    if (cleaned.startsWith("234")) {
      setFormData((prev) => ({ ...prev, phoneNumber: cleaned }));
    } else {
      setFormData((prev) => ({ ...prev, phoneNumber: "234" + cleaned }));
    }
    setErrors((prev) => ({ ...prev, phoneNumber: undefined }));
  };

  const handleAccountNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, settlementAccountNumber: value }));
    setErrors((prev) => ({ ...prev, settlementAccountNumber: undefined }));

    // Simulate account verification
    if (value.length === 10 && formData.settlementBankCode) {
      setIsVerifyingAccount(true);
      setTimeout(() => {
        setFormData((prev) => ({
          ...prev,
          settlementAccountName: "TECHNOVA SOLUTIONS LTD",
        }));
        setIsVerifyingAccount(false);
      }, 1500);
    } else {
      setFormData((prev) => ({ ...prev, settlementAccountName: "" }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const newErrors: Partial<Record<keyof BusinessDetailsFormData, string>> =
      {};

    // Validate all fields
    const businessNameError = validateBusinessName(formData.businessName);
    if (businessNameError) newErrors.businessName = businessNameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    const confirmPasswordError = validatePasswordConfirm(
      formData.password,
      formData.confirmPassword,
    );
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    const phoneError = validatePhoneNumber(formData.phoneNumber);
    if (phoneError) newErrors.phoneNumber = phoneError;

    const rcNumberError = validateRcNumber(formData.rcNumber);
    if (rcNumberError) newErrors.rcNumber = rcNumberError;

    const bankCodeError = validateBankCode(formData.settlementBankCode);
    if (bankCodeError) newErrors.settlementBankCode = bankCodeError;

    const accountNumberError = validateAccountNumber(
      formData.settlementAccountNumber,
    );
    if (accountNumberError)
      newErrors.settlementAccountNumber = accountNumberError;

    if (!formData.settlementAccountName) {
      newErrors.settlementAccountName = "Account verification required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.strength === "weak") return "bg-red-500";
    if (passwordStrength.strength === "medium") return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            TR
          </div>
          <span className="text-xl font-bold text-gray-900">TrustRail</span>
        </div>
        <div className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to={ROUTES.AUTH.LOGIN}
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="text-xs font-semibold text-blue-600 mb-2">
          STEP 1: BUSINESS DETAILS
        </div>
        <div className="flex gap-2">
          <div className="h-1 flex-1 bg-blue-600 rounded" />
          <div className="h-1 flex-1 bg-gray-200 rounded" />
          <div className="h-1 flex-1 bg-gray-200 rounded" />
        </div>
        <div className="text-xs text-gray-500 mt-1">1 of 3</div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Create your TrustRail account
        </h1>
        <p className="text-gray-600 mb-8">
          Enter your business details to get started with Nigeria's best payment
          platform.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="businessName"
              placeholder="Registered business name"
              value={formData.businessName}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.businessName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.businessName && (
              <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
            )}
          </div>

          {/* Business Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="email@company.com"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-11 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Password Strength */}
          {formData.password && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600 font-medium">
                  PASSWORD STRENGTH
                </span>
                <span className="text-gray-900 font-semibold uppercase">
                  {passwordStrength.strength}
                </span>
              </div>
              <div className="w-full h-1 bg-gray-200 rounded">
                <div
                  className={`h-full rounded transition-all ${getPasswordStrengthColor()}`}
                  style={{ width: `${passwordStrength.percentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value="+234"
                disabled
                className="w-20 px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
              <input
                type="tel"
                placeholder="812 345 6789"
                value={formData.phoneNumber.slice(3)}
                onChange={handlePhoneChange}
                className={`flex-1 px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phoneNumber ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
            )}
          </div>

          {/* RC Number / CAC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              RC Number / CAC <span className="text-red-500">*</span>
              <FaInfoCircle className="text-gray-400 text-xs" />
            </label>
            <input
              type="text"
              name="rcNumber"
              placeholder="RC-1234567"
              value={formData.rcNumber}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.rcNumber ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.rcNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.rcNumber}</p>
            )}
          </div>

          {/* Settlement Bank */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Settlement Bank <span className="text-red-500">*</span>
            </label>
            <select
              name="settlementBankCode"
              value={formData.settlementBankCode}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.settlementBankCode ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select your bank</option>
              {NIGERIAN_BANKS.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
            {errors.settlementBankCode && (
              <p className="mt-1 text-sm text-red-600">
                {errors.settlementBankCode}
              </p>
            )}
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="0123456789"
                value={formData.settlementAccountNumber}
                onChange={handleAccountNumberChange}
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.settlementAccountNumber
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {isVerifyingAccount && (
                <FaSpinner className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 animate-spin" />
              )}
            </div>
            {errors.settlementAccountNumber && (
              <p className="mt-1 text-sm text-red-600">
                {errors.settlementAccountNumber}
              </p>
            )}
          </div>

          {/* Verified Account Name */}
          {formData.settlementAccountName && (
            <div className="bg-gray-50 px-4 py-3 rounded-md hidden">
              <div className="text-xs text-gray-600 font-medium mb-1">
                VERIFIED ACCOUNT NAME
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {formData.settlementAccountName}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            Continue to Document Upload
            <span className="text-lg">→</span>
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <div className="flex justify-center gap-6 text-sm text-gray-600">
          <button className="hover:text-gray-900">Terms of Service</button>
          <button className="hover:text-gray-900">Privacy Policy</button>
          <button className="hover:text-gray-900">Contact Support</button>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          © 2024 TrustRail Technologies. Registered in Nigeria.
        </p>
      </div>
    </div>
  );
}
