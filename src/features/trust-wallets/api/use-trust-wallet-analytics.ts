import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@shared/helpers/api-client";
import { API_ENDPOINTS } from "@shared/constants/api";

export interface TrustWalletAnalytics {
  trustWallet: {
    trustWalletId: string;
    name: string;
    isActive: boolean;
  };
  applications: {
    total: number;
    approved: number;
    declined: number;
    flagged: number;
    pending: number;
    active: number;
    completed: number;
    approvalRate: number;
  };
  trustScores: {
    average: number;
    min: number;
    max: number;
    distribution: {
      excellent: number;
      good: number;
      fair: number;
      poor: number;
    };
  };
  revenue: {
    totalCollected: number;
    outstandingBalance: number;
    totalExpected: number;
  };
  payments: {
    successfulCount: number;
    failedCount: number;
    successRate: number;
  };
}

interface TrustWalletAnalyticsResponse {
  success: boolean;
  data: TrustWalletAnalytics;
}

interface UseTrustWalletAnalyticsParams {
  trustWalletId: string | undefined;
  startDate?: string;
  endDate?: string;
}

export function useTrustWalletAnalytics({
  trustWalletId,
  startDate,
  endDate,
}: UseTrustWalletAnalyticsParams) {
  const queryParams = new URLSearchParams();

  if (startDate) queryParams.append("startDate", startDate);
  if (endDate) queryParams.append("endDate", endDate);

  const queryString = queryParams.toString();

  return useQuery({
    queryKey: ["trust-wallet-analytics", trustWalletId, startDate, endDate],
    queryFn: () =>
      apiClient.get<TrustWalletAnalyticsResponse>(
        `${API_ENDPOINTS.DASHBOARD.TRUSTWALLET_ANALYTICS(trustWalletId!)}${queryString ? `?${queryString}` : ""}`,
        true,
      ),
    enabled: !!trustWalletId,
  });
}
