import { useState, ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash, FaDiamond } from "react-icons/fa6";
import { ROUTES } from "@shared/constants/routes/routes";
import { GuestGuard } from "../guards/guest-guard";
import { useLogin } from "../api/use-login";
import { useAuth } from "../providers/auth-provider";
import { validateEmail, validatePassword } from "../helpers/validation";
import { ApiClientError } from "@shared/helpers/api-client";

function LoginScreenContent() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    keepSignedIn: false,
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const loginMutation = useLogin();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear errors for this field
    setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    // Validate email
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    // Validate password
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Make API call
    loginMutation.mutate(
      {
        email: formData.email,
        password: formData.password,
      },
      {
        onSuccess: (response) => {
          // Auto-login and redirect to dashboard
          login(response.data.token, response.data);
        },
        onError: (err: unknown) => {
          if (err instanceof ApiClientError) {
            if (err.details && err.details.length > 0) {
              // Map API validation errors to form fields
              err.details.forEach((detail) => {
                if (detail.field === "email") {
                  newErrors.email = detail.message;
                } else if (detail.field === "password") {
                  newErrors.password = detail.message;
                } else {
                  newErrors.general = detail.message;
                }
              });
              setErrors(newErrors);
            } else {
              // General error (invalid credentials, etc.)
              setErrors({ general: err.message });
            }
          } else {
            setErrors({ general: "Login failed. Please try again." });
          }
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaDiamond className="text-blue-600 text-2xl" />
          <span className="text-xl font-bold text-gray-900">TrustRail</span>
        </div>
        <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm">👤</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-lg shadow-md p-5 sm:p-8">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                <FaDiamond className="text-blue-600 text-2xl" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Welcome back
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Sign in to your TrustRail account
            </p>

            {/* General Error */}
            {errors.general && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="e.g. name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Keep me signed in & Forgot password */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="keepSignedIn"
                    checked={formData.keepSignedIn}
                    onChange={handleChange}
                    className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Keep me signed in
                  </span>
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign in Button */}
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginMutation.isPending ? "Signing in..." : "Sign in"}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">OR</span>
                </div>
              </div>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    to={ROUTES.AUTH.REGISTER}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Register your business
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 sm:p-6 text-center">
        <p className="text-xs text-gray-500">
          © 2024 TrustRail Inc. All rights reserved. Professional installment
          payments for Nigeria.
        </p>
      </footer>
    </div>
  );
}

export function LoginScreen() {
  return (
    <GuestGuard>
      <LoginScreenContent />
    </GuestGuard>
  );
}
