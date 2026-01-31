import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@shared/helpers/api-client";
import { API_ENDPOINTS } from "@shared/constants/api";

export interface TrustWalletInstallmentPlan {
  totalAmount: number;
  downPaymentPercentage: number;
  installmentCount: number;
  frequency: "weekly" | "monthly";
  interestRate: number;
}

export interface ApprovalWorkflow {
  autoApproveThreshold: number;
  autoDeclineThreshold: number;
  minTrustScore: number;
}

export interface TrustWallet {
  _id: string;
  trustWalletId: string;
  businessId: string;
  name: string;
  description: string;
  isActive: boolean;
  installmentPlan: TrustWalletInstallmentPlan;
  approvalWorkflow: ApprovalWorkflow;
  publicUrl: string;
  createdAt: string;
  updatedAt: string;
  applicationCount: number;
  __v: number;
}

interface PaginationData {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

interface TrustWalletsResponse {
  success: boolean;
  data: TrustWallet[];
  pagination: PaginationData;
}

interface UseTrustWalletsParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
}

export function useTrustWallets(params: UseTrustWalletsParams = {}) {
  const { page = 1, limit = 20, isActive } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (isActive !== undefined) {
    queryParams.append("isActive", isActive.toString());
  }

  return useQuery({
    queryKey: ["trust-wallets", page, limit, isActive],
    queryFn: () =>
      apiClient.get<TrustWalletsResponse>(
        `${API_ENDPOINTS.TRUSTWALLETS.LIST}?${queryParams.toString()}`,
        true,
      ),
  });
}
