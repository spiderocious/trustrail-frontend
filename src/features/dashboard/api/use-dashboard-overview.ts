import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@shared/helpers/api-client";
import { API_ENDPOINTS } from "@shared/constants/api";

interface RecentActivity {
  _id: string;
  logId: string;
  action: string;
  actor: {
    type: string;
    id: string;
    email: string;
  };
  resourceType: string;
  resourceId: string;
  timestamp: string;
  __v: number;
}

interface DashboardOverviewResponse {
  success: boolean;
  data: {
    trustWallets: {
      total: number;
      active: number;
    };
    applications: {
      total: number;
      approved: number;
      declined: number;
      pending: number;
      active: number;
      completed: number;
      flaggedForReview: number;
    };
    revenue: {
      totalCollected: number;
      outstandingBalance: number;
      availableForWithdrawal: number;
    };
    payments: {
      successfulCount: number;
      failedCount: number;
      successRate: number;
    };
    recentActivity: RecentActivity[];
  };
  message?: string;
}

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: () =>
      apiClient.get<DashboardOverviewResponse>(
        API_ENDPOINTS.DASHBOARD.OVERVIEW,
        true,
      ),
  });
}
