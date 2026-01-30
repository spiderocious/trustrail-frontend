import { useState } from "react";
import { GuestGuard } from "../guards/guest-guard";
import { BusinessDetailsStep } from "./parts/business-details-step";
import { DocumentUploadStep } from "./parts/document-upload-step";

export interface BusinessDetailsFormData {
  businessName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  rcNumber: string;
  settlementBankCode: string;
  settlementAccountNumber: string;
  settlementAccountName: string;
}

export interface DocumentUploadFormData {
  cacCertificate: File | null;
  optionalDocuments: File[];
}

function RegisterScreenContent() {
  const [step, setStep] = useState<1 | 2>(1);
  const [businessDetails, setBusinessDetails] =
    useState<BusinessDetailsFormData>({
      businessName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "234",
      rcNumber: "",
      settlementBankCode: "",
      settlementAccountNumber: "",
      settlementAccountName: "",
    });
  const [documents, setDocuments] = useState<DocumentUploadFormData>({
    cacCertificate: null,
    optionalDocuments: [],
  });

  const handleBusinessDetailsSubmit = (data: BusinessDetailsFormData) => {
    setBusinessDetails(data);
    setStep(2);
  };

  const handleDocumentUploadBack = () => {
    setStep(1);
  };

  const handleDocumentUploadSubmit = (data: DocumentUploadFormData) => {
    setDocuments(data);
    // Will trigger actual registration API call
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {step === 1 && (
        <BusinessDetailsStep
          initialData={businessDetails}
          onSubmit={handleBusinessDetailsSubmit}
        />
      )}
      {step === 2 && (
        <DocumentUploadStep
          initialData={documents}
          onBack={handleDocumentUploadBack}
          onSubmit={handleDocumentUploadSubmit}
          businessDetails={businessDetails}
        />
      )}
    </div>
  );
}

export function RegisterScreen() {
  return (
    <GuestGuard>
      <RegisterScreenContent />
    </GuestGuard>
  );
}
