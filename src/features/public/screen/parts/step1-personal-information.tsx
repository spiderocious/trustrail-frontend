import { useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import {
  validateEmail,
  validatePhoneNumber,
} from "@features/auth/helpers/validation";
import type { CustomerApplicationData } from "../../types";

interface Step1PersonalInformationProps {
  data: CustomerApplicationData;
  onUpdate: (data: Partial<CustomerApplicationData>) => void;
  onNext: () => void;
}

export function Step1PersonalInformation({
  data,
  onUpdate,
  onNext,
}: Step1PersonalInformationProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate first name
    if (!data.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    // Validate last name
    if (!data.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    // Validate email
    const emailError = validateEmail(data.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    // Validate phone number
    const phoneError = validatePhoneNumber(data.phoneNumber);
    if (phoneError) {
      newErrors.phoneNumber = phoneError;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-900">
        Personal Information
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            value={data.firstName}
            onChange={(e) => onUpdate({ firstName: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.firstName ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Chidinma"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            value={data.lastName}
            onChange={(e) => onUpdate({ lastName: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.lastName ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Nwosu"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Email Address */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={data.email}
          onChange={(e) => onUpdate({ email: e.target.value })}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.email ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="chidinma@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label
          htmlFor="phoneNumber"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Phone Number
        </label>
        <div className="flex gap-2">
          <div className="flex items-center px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
            +234
          </div>
          <input
            type="tel"
            id="phoneNumber"
            value={data.phoneNumber.replace(/^234/, "")}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              onUpdate({ phoneNumber: `234${value}` });
            }}
            className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.phoneNumber ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="801 234 5678"
            maxLength={10}
          />
        </div>
        {errors.phoneNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
        )}
      </div>

      {/* Continue Button */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
      >
        Continue <FaArrowRight />
      </button>
    </form>
  );
}
