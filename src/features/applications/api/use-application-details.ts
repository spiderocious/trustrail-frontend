import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@shared/helpers/api-client";
import { API_ENDPOINTS } from "@shared/constants/api";

export interface ApplicationDetails {
  applicationId: string;
  trustWalletId: string;
  businessId: string;
  status: string;
  customerDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    accountNumber: string;
    bankCode: string;
    bvn: string;
  };
  openai: {
    fileId: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
    analysisCompletedAt: string;
  };
  trustEngineOutput: {
    outputId: string;
    decision: string;
    trustScore: number;
    statementAnalysis: {
      periodCovered: {
        startDate: string;
        endDate: string;
        monthsAnalyzed: number;
      };
      incomeAnalysis: {
        totalIncome: number;
        avgMonthlyIncome: number;
        incomeConsistency: number;
        incomeSources: Array<{
          description: string;
          frequency: string;
          avgAmount: number;
        }>;
      };
      spendingAnalysis: {
        totalSpending: number;
        avgMonthlySpending: number;
        spendingCategories: {
          bills: number;
          loans: number;
          gambling: number;
          transfers: number;
          other: number;
        };
      };
      balanceAnalysis: {
        avgBalance: number;
        minBalance: number;
        maxBalance: number;
        closingBalance: number;
      };
      behaviorAnalysis: {
        transactionCount: number;
        avgDailyTransactions: number;
        bounceCount: number;
        overdraftUsage: boolean;
      };
      debtProfile: {
        existingLoanRepayments: number;
        debtToIncomeRatio: number;
      };
      affordabilityAssessment: {
        canAffordInstallment: boolean;
        monthlyInstallmentAmount: number;
        disposableIncome: number;
        affordabilityRatio: number;
        cushion: number;
      };
      riskFlags: Array<{
        flag: string;
        severity: string;
        description: string;
      }>;
      ruleCompliance: {
        passedMinTrustScore: boolean;
        overallPass: boolean;
      };
    };
    analyzedAt: string;
  };
  downPaymentReceived: boolean;
  totalAmount: number;
  downPaymentRequired: number;
  installmentAmount: number;
  installmentCount: number;
  frequency: string;
  paymentsCompleted: number;
  totalPaid: number;
  outstandingBalance: number;
  submittedAt: string;
  analyzedAt?: string;
  pwaMandateRef?: string;
  virtualAccountNumber?: string;
  nextPaymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApplicationDetailsResponse {
  success: boolean;
  data: ApplicationDetails;
}

export function useApplicationDetails(applicationId: string | undefined) {
  return useQuery({
    queryKey: ["application-details", applicationId],
    queryFn: () =>
      apiClient.get<ApplicationDetailsResponse>(
        API_ENDPOINTS.APPLICATIONS.GET(applicationId!),
        true,
      ),
    enabled: !!applicationId,
  });
}
