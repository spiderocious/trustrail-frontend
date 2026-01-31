import { useState } from "react";
import { FaUpload, FaFileAlt, FaTimes, FaCheckCircle } from "react-icons/fa";
import type { CustomerApplicationData } from "../../types";

interface Step3BankStatementUploadProps {
  data: CustomerApplicationData;
  onUpdate: (data: Partial<CustomerApplicationData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step3BankStatementUpload({
  data,
  onUpdate,
  onNext,
  onBack,
}: Step3BankStatementUploadProps) {
  const [error, setError] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);

  function handleFileChange(file: File | null) {
    if (!file) {
      setError("");
      onUpdate({ bankStatement: null });
      return;
    }

    // Validate file type
    const allowedTypes = ["application/pdf", "text/csv"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF and CSV files are allowed");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setError("File size must not exceed 5MB");
      return;
    }

    setError("");
    onUpdate({ bankStatement: file });
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!data.bankStatement) {
      setError("Please upload your bank statement");
      return;
    }

    onNext();
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Upload Bank Statement
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Please upload your bank statement for the last 3 months (PDF or CSV
          format).
        </p>
      </div>

      {/* File Upload Area */}
      <div>
        {!data.bankStatement ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : error
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 bg-gray-50"
            }`}
          >
            <FaUpload
              className={`mx-auto text-4xl mb-4 ${
                dragActive ? "text-blue-600" : "text-gray-400"
              }`}
            />
            <p className="text-gray-700 font-medium mb-2">
              Drag and drop your bank statement here
            </p>
            <p className="text-sm text-gray-500 mb-4">or</p>
            <label className="inline-block bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              Browse Files
              <input
                type="file"
                className="hidden"
                accept=".pdf,.csv"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
            </label>
            <p className="text-xs text-gray-500 mt-4">
              Supported formats: PDF, CSV (Max 5MB)
            </p>
          </div>
        ) : (
          <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FaCheckCircle className="text-green-600 text-xl flex-shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {data.bankStatement.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatFileSize(data.bankStatement.size)} •{" "}
                      {data.bankStatement.type.includes("pdf") ? "PDF" : "CSV"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFileChange(null)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {/* Requirements Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-2">
          Statement Requirements
        </h3>
        <ul className="space-y-1 text-sm text-gray-600">
          <li className="flex gap-2">
            <span className="text-gray-400">•</span>
            <span>Must cover the last 3 months of transactions</span>
          </li>
          <li className="flex gap-2">
            <span className="text-gray-400">•</span>
            <span>Should include account number and bank name</span>
          </li>
          <li className="flex gap-2">
            <span className="text-gray-400">•</span>
            <span>PDF or CSV format only</span>
          </li>
          <li className="flex gap-2">
            <span className="text-gray-400">•</span>
            <span>Maximum file size: 5MB</span>
          </li>
        </ul>
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
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={!data.bankStatement}
        >
          Next Step
        </button>
      </div>
    </form>
  );
}
