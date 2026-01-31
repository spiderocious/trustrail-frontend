import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@shared/helpers/api-client";
import { API_ENDPOINTS } from "@shared/constants/api";

export interface ApplicationCustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface TrustEngineOutput {
  _id: string;
  outputId: string;
  applicationId: string;
  trustWalletId: string;
  businessId: string;
  decision: "APPROVED" | "DECLINED" | "REVIEW";
  trustScore: number;
  statementAnalysis: StatementAnalysis;
  analyzedAt: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
}

interface StatementAnalysis {
  periodCovered: PeriodCovered;
  incomeAnalysis: IncomeAnalysis;
  spendingAnalysis: SpendingAnalysis;
  balanceAnalysis: BalanceAnalysis;
  behaviorAnalysis: BehaviorAnalysis;
  debtProfile: DebtProfile;
  affordabilityAssessment: AffordabilityAssessment;
  riskFlags: RiskFlag[];
  ruleCompliance: RuleCompliance;
}

interface PeriodCovered {
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  monthsAnalyzed: number;
}

interface IncomeAnalysis {
  totalIncome: number;
  avgMonthlyIncome: number;
  incomeConsistency: number;
  incomeSources: IncomeSource[];
}

interface IncomeSource {
  description: string;
  frequency: string;
  avgAmount: number;
}

interface SpendingAnalysis {
  totalSpending: number;
  avgMonthlySpending: number;
  spendingCategories: SpendingCategories;
}

interface SpendingCategories {
  bills: number;
  loans: number;
  gambling: number;
  transfers: number;
  other: number;
}

interface BalanceAnalysis {
  avgBalance: number;
  minBalance: number;
  maxBalance: number;
  closingBalance: number;
}

interface BehaviorAnalysis {
  transactionCount: number;
  avgDailyTransactions: number;
  bounceCount: number;
  overdraftUsage: boolean;
}

interface DebtProfile {
  existingLoanRepayments: number;
  debtToIncomeRatio: number;
}

interface AffordabilityAssessment {
  canAffordInstallment: boolean;
  monthlyInstallmentAmount: number;
  disposableIncome: number;
  affordabilityRatio: number;
  cushion: number;
}

interface RiskFlag {
  flag: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  description: string;
}

interface RuleCompliance {
  passedMinTrustScore: boolean;
  overallPass: boolean;
}

export interface Application {
  applicationId: string;
  trustWalletId: string;
  trustWalletName: string;
  status: string;
  customerDetails: ApplicationCustomerDetails;
  trustEngineOutput: TrustEngineOutput;
  totalAmount: number;
  downPaymentAmount: number;
  installmentAmount: number;
  installmentCount: number;
  createdAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

interface ApplicationsResponse {
  success: boolean;
  data: Application[];
  pagination: PaginationData;
  message: string;
}

interface UseApplicationsParams {
  trustWalletId?: string;
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export function useTrustWalletApplications(params: UseApplicationsParams = {}) {
  const { trustWalletId, page = 1, limit = 20, status, search } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (trustWalletId) queryParams.append("trustWalletId", trustWalletId);
  if (status) queryParams.append("status", status);
  if (search) queryParams.append("search", search);

  return useQuery({
    queryKey: ["applications", trustWalletId, page, limit, status, search],
    queryFn: () =>
      apiClient.get<ApplicationsResponse>(
        `${API_ENDPOINTS.APPLICATIONS.LIST}?${queryParams.toString()}`,
        true,
      ),
  });
}
