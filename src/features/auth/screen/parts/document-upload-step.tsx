import { useState, useRef, DragEvent, ChangeEvent, FormEvent } from "react";
import { FaFileUpload, FaFilePdf, FaCheckCircle, FaPlus } from "react-icons/fa";
import {
  DocumentUploadFormData,
  BusinessDetailsFormData,
} from "../register-screen";
import { useRegister } from "../../api/use-register";
import { useAuth } from "../../providers/auth-provider";
import { ApiClientError } from "@shared/helpers/api-client";

interface DocumentUploadStepProps {
  initialData: DocumentUploadFormData;
  businessDetails: BusinessDetailsFormData;
  onBack: () => void;
  onSubmit: (data: DocumentUploadFormData) => void;
}

export function DocumentUploadStep({
  initialData,
  businessDetails,
  onBack,
  onSubmit,
}: DocumentUploadStepProps) {
  const [formData, setFormData] = useState(initialData);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacFileInputRef = useRef<HTMLInputElement>(null);
  const optionalFilesInputRef = useRef<HTMLInputElement>(null);

  const { login } = useAuth();
  const registerMutation = useRegister();

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find((file) =>
      ["application/pdf", "image/png", "image/jpeg"].includes(file.type),
    );

    if (pdfFile) {
      setFormData((prev) => ({ ...prev, cacCertificate: pdfFile }));
      setError(null);
    }
  };

  const handleCacFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!["application/pdf", "image/png", "image/jpeg"].includes(file.type)) {
        setError("Only PDF, PNG, and JPG files are allowed");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must not exceed 5MB");
        return;
      }

      setFormData((prev) => ({ ...prev, cacCertificate: file }));
      setError(null);
    }
  };

  const handleOptionalFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({
      ...prev,
      optionalDocuments: [...prev.optionalDocuments, ...files],
    }));
  };

  const removeOptionalFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      optionalDocuments: prev.optionalDocuments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!formData.cacCertificate) {
      setError("CAC Certificate is required");
      return;
    }

    // Call the parent's onSubmit to store documents in state
    onSubmit(formData);

    // Now make the API call (without documents for now)
    const registerPayload = {
      businessName: businessDetails.businessName,
      email: businessDetails.email,
      password: businessDetails.password,
      phoneNumber: businessDetails.phoneNumber,
      rcNumber: businessDetails.rcNumber,
      settlementAccountNumber: businessDetails.settlementAccountNumber,
      settlementBankCode: businessDetails.settlementBankCode,
      settlementAccountName: businessDetails.settlementAccountName,
    };

    registerMutation.mutate(registerPayload, {
      onSuccess: (response) => {
        // Login the user automatically
        login(response.data.token, response.data);
      },
      onError: (err: unknown) => {
        if (err instanceof ApiClientError) {
          if (err.details && err.details.length > 0) {
            // Show first validation error
            setError(err.details[0].message);
          } else {
            setError(err.message);
          }
        } else {
          setError("Registration failed. Please try again.");
        }
      },
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            TR
          </div>
          <span className="text-xl font-bold text-gray-900">TrustRail</span>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex justify-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-gray-300" />
          <div className="w-3 h-3 rounded-full bg-blue-600" />
          <div className="w-3 h-3 rounded-full bg-gray-300" />
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Upload Verification Documents
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          Please provide the necessary business documentation to proceed.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* CAC Certificate Upload */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              CAC Certificate (Required)
            </h3>

            {!formData.cacCertificate ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => cacFileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-400"
                }`}
              >
                <FaFileUpload className="mx-auto text-5xl text-blue-600 mb-4" />
                <p className="text-gray-900 font-medium mb-1">
                  Drag and drop your CAC Certificate
                </p>
                <p className="text-sm text-gray-500">
                  or click to browse (PDF, PNG, JPG)
                </p>
                <input
                  ref={cacFileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleCacFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div>
                <div className="text-xs font-semibold text-blue-600 mb-2">
                  RECENTLY UPLOADED
                </div>
                <div className="border border-gray-200 rounded-lg p-4 flex items-center gap-4">
                  <FaFilePdf className="text-red-500 text-3xl" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {formData.cacCertificate.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(formData.cacCertificate.size)} • 100%
                      complete
                    </p>
                    <div className="w-full h-1 bg-green-500 rounded mt-2" />
                  </div>
                  <FaCheckCircle className="text-green-500 text-xl" />
                </div>
              </div>
            )}

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          {/* Optional Documents */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              Optional Documents
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Utility bills, proof of address, or other supporting files.
            </p>

            {formData.optionalDocuments.length > 0 && (
              <div className="space-y-2 mb-4">
                {formData.optionalDocuments.map((file, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-3 flex items-center gap-3"
                  >
                    <FaFilePdf className="text-gray-400 text-2xl" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeOptionalFile(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => optionalFilesInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors flex flex-col items-center gap-2"
            >
              <FaPlus className="text-blue-600 text-2xl" />
              <span className="text-sm text-blue-600 font-medium">
                Add more files
              </span>
              <input
                ref={optionalFilesInputRef}
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleOptionalFilesChange}
                className="hidden"
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onBack}
              disabled={registerMutation.isPending}
              className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={registerMutation.isPending || !formData.cacCertificate}
              className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {registerMutation.isPending ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Documents
                  <span className="text-lg">→</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xs">🔒</span>
          </div>
          <span>TrustRail Business Portal</span>
        </div>
      </div>
    </div>
  );
}
