import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaCheckDouble,
  FaFileAlt,
  FaFingerprint,
  FaGem,
} from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useApplicationStatus } from "../api/use-application-status";

export function ApplicationSubmittedScreen() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const [copied, setCopied] = useState(false);
  const [_, setLinkCopied] = useState(false);
  const [progress, setProgress] = useState(0);

  const statusQuery = useApplicationStatus(applicationId || "", true);

  // Animate progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 60) return prev;
        return prev + 1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  function copyToClipboard(text: string, type: "id" | "link") {
    navigator.clipboard.writeText(text);
    if (type === "id") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  }

  const status = statusQuery?.data?.data?.status;
  const isPending =
    status === "PENDING" ||
    status === "PENDING_ANALYSIS" ||
    status === "ANALYZING";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center">
              <FaGem />
            </div>
            <span className="font-bold text-gray-900">TrustRail</span>
          </div>
          <div className="w-10 h-10 bg-orange-200 rounded-full"></div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <FaCheckCircle className="text-3xl text-green-600" />
            </div>
          </div>
          {/* Title */}
          <h1 className="text-2xl font-bold text-center mb-6">
            Application Submitted! ✓
          </h1>
          {/* Application ID */}
          Application ID:
          <br />
          <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FaFingerprint className="text-gray-400 text-xl" />
              <span className="font-mono text-sm text-gray-700">
                {applicationId}
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(applicationId || "", "id")}
              className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          {isPending ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-blue-900">
                    Analysis in Progress
                  </h3>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  Estimated time:{" "}
                  {statusQuery.data?.data?.estimatedTime || "2-5 minutes"}
                </p>
                {/* Progress Bar */}
                <div className="w-full bg-blue-100 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 uppercase">
                  {statusQuery.data?.data?.message ||
                    "SCANNING DOCUMENT SECURITY..."}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  What's Next
                </h3>
                <div className="space-y-3">
                  {/* AI Risk Assessment */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaFingerprint className="text-sm" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        AI Risk Assessment
                      </p>
                      <p className="text-xs text-gray-600">
                        Automated verification of submission patterns and
                        credentials.
                      </p>
                    </div>
                  </div>

                  {/* Document Verification */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaFileAlt className="text-sm" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-500 text-sm">
                        Document Verification
                      </p>
                      <p className="text-xs text-gray-500">
                        Manual review of uploaded supporting documents if
                        required.
                      </p>
                    </div>
                  </div>

                  {/* Final Approval */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaCheckDouble className="text-sm" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-500 text-sm">
                        Final Approval
                      </p>
                      <p className="text-xs text-gray-500">
                        Confirmation of TrustRail certification sent to your
                        email.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaCheckCircle className="text-sm" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900">
                      Application Processed!
                    </h3>
                    <p className="text-sm text-green-700">
                      {statusQuery.data?.data?.message ||
                        "Your application has been successfully processed."}
                    </p>
                  </div>
                </div>
              </div>

              {/* you dont need to do ........ for the user */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  What do I need to do now?
                </h3>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    Check your email for further instructions to setup your
                    account and complete the setup process.
                  </p>
                </div>
              </div>
            </>
          )}
          {/* Unique Status Link */}
          {/* <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Unique Status Link
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={statusLink}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
              />
              <button
                onClick={() => copyToClipboard(statusLink, "link")}
                className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                <FaCopy className="text-blue-600" />
              </button>
            </div>
            {linkCopied && (
              <p className="text-xs text-green-600 mt-1">
                Link copied to clipboard!
              </p>
            )}
          </div> */}
          {/* Check Status Button */}
          {/* <button
            onClick={() => navigate(`/status/${applicationId}`)}
            className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Check Status Now
          </button>

          <p className="text-center text-xs text-gray-500 mt-4">
            You will receive an email notification once complete.
          </p> */}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-8">
          © 2026 TrustRail. All rights reserved.
        </p>
      </div>
    </div>
  );
}
