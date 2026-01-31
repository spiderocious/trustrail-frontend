import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaGem } from "react-icons/fa";
import { usePublicTrustWallet } from "../api/use-public-trustwallet";
import { useSubmitApplication } from "../api/use-submit-application";
import type { CustomerApplicationData } from "../types";
import { Step1PersonalInformation } from "./parts/step1-personal-information";
import { Step2BankAccountDetails } from "./parts/step2-bank-account-details";
import { Step3BankStatementUpload } from "./parts/step3-bank-statement-upload";
import { Step4ReviewSubmit } from "./parts/step4-review-submit";

export function ApplicationFormScreen() {
  const { trustWalletId } = useParams<{ trustWalletId: string }>();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CustomerApplicationData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "234",
    accountNumber: "",
    bankCode: "",
    bvn: "",
    bankStatement: null,
  });

  const trustWalletQuery = usePublicTrustWallet(trustWalletId || "");
  const submitMutation = useSubmitApplication();

  function updateFormData(data: Partial<CustomerApplicationData>) {
    setFormData((prev) => ({ ...prev, ...data }));
  }

  function handleNext() {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  function handleEdit(step: number) {
    setCurrentStep(step);
  }

  async function handleSubmit() {
    if (!trustWalletId) return;

    try {
      const result = await submitMutation.mutateAsync({
        trustWalletId,
        data: formData,
      });

      // Navigate to confirmation screen with application ID
      navigate(`/application/${result.applicationId}/submitted`);
    } catch (error) {
      console.error("Failed to submit application:", error);
      // Error handling can be improved
      alert(
        error instanceof Error
          ? error.message
          : "Failed to submit application. Please try again.",
      );
    }
  }

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
            Failed to load application. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const trustWallet = trustWalletQuery?.data.data;
  const progress = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-lg mb-4">
            <FaGem className="text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {trustWallet.businessName}
          </h1>
          <p className="text-gray-600 mt-1">{trustWallet.name}</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of 4
              </span>
              <span className="text-sm text-gray-600">
                {progress}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            {/* Step Dots */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    step <= currentStep ? "bg-blue-600" : "bg-gray-300"
                  }`}
                ></div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          {currentStep === 1 && (
            <Step1PersonalInformation
              data={formData}
              onUpdate={updateFormData}
              onNext={handleNext}
            />
          )}

          {currentStep === 2 && (
            <Step2BankAccountDetails
              data={formData}
              onUpdate={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 3 && (
            <Step3BankStatementUpload
              data={formData}
              onUpdate={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 4 && (
            <Step4ReviewSubmit
              data={formData}
              trustWallet={trustWallet}
              onEdit={handleEdit}
              onSubmit={handleSubmit}
              isSubmitting={submitMutation.isPending}
            />
          )}

          {/* Pagination for Step 4 */}
          {currentStep === 4 && (
            <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t">
              <button
                onClick={() => setCurrentStep(1)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600"
              >
                ‹
              </button>
              {[1, 2, 3, 4].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentStep(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                    page === currentStep
                      ? "bg-blue-600 text-white font-semibold"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentStep(4)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600"
              >
                ›
              </button>
            </div>
          )}
        </div>

        {/* Back to TrustWallet Link */}
        <div className="text-center mt-6">
          <Link
            to={`/apply/${trustWalletId}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
          >
            <FaArrowLeft /> Back to TrustWallet
          </Link>
        </div>

        {/* Footer for Step 2 */}
        {currentStep === 2 && (
          <div className="text-center mt-6 space-y-2">
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Your data is encrypted and secure</span>
            </div>
            <p className="text-xs text-gray-500">
              © 2024 Customer Portal. All rights reserved.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
