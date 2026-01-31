export interface PublicTrustWallet {
  trustWalletId: string;
  businessName: string;
  name: string;
  description: string;
  installmentPlan: {
    totalAmount: number;
    downPaymentPercentage: number;
    installmentCount: number;
    frequency: 'weekly' | 'monthly';
    interestRate: number;
  };
  requirements: string[];
}

export interface CustomerApplicationData {
  // Step 1: Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;

  // Step 2: Bank Account Details
  accountNumber: string;
  bankCode: string;
  bvn: string;

  // Step 3: Bank Statement
  bankStatement: File | null;
}

export interface ApplicationSubmitResponse {
  applicationId: string;
  status: string;
  message: string;
  estimatedTime?: string;
}

export interface ApplicationStatus {
  applicationId: string;
  status: ApplicationStatusType;
  message: string;
  trustWalletName?: string;
  businessName?: string;
  customerName?: string;
  totalAmount?: number;
  downPaymentAmount?: number;
  installmentAmount?: number;
  installmentCount?: number;
  frequency?: string;
  trustScore?: number;
  decision?: string;
  virtualAccountNumber?: string;
  bankName?: string;
  paymentProgress?: {
    paymentsCompleted: number;
    totalPayments: number;
    totalPaid: number;
    outstandingBalance: number;
    nextPaymentDate?: string;
  };
  createdAt?: string;
  analyzedAt?: string;
  approvedAt?: string;
}

export type ApplicationStatusType =
  | 'PENDING'
  | 'PENDING_ANALYSIS'
  | 'ANALYZING'
  | 'AUTO_APPROVED'
  | 'FLAGGED_FOR_REVIEW'
  | 'AUTO_DECLINED'
  | 'APPROVED'
  | 'DECLINED'
  | 'MANDATE_CREATED'
  | 'MANDATE_ACTIVE'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'DEFAULTED';
