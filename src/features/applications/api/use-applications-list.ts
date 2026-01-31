import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@shared/helpers/api-client";
import { API_ENDPOINTS } from "@shared/constants/api";

export interface ApplicationListItem {
  applicationId: string;
  trustWalletId: string;
  trustWalletName?: string;
  businessId: string;
  status: string;
  customerDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  trustEngineOutput?: {
    trustScore: number;
    decision: string;
  };
  totalAmount: number;
  downPaymentRequired: number;
  installmentAmount: number;
  installmentCount: number;
  frequency: string;
  submittedAt: string;
  createdAt: string;
}

interface ApplicationsListResponse {
  success: boolean;
  data: ApplicationListItem[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

interface UseApplicationsListParams {
  page?: number;
  limit?: number;
  trustWalletId?: string;
  status?: string;
  search?: string;
}

export function useApplicationsList(params: UseApplicationsListParams = {}) {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.trustWalletId)
    queryParams.append("trustWalletId", params.trustWalletId);
  if (params.status) queryParams.append("status", params.status);
  if (params.search) queryParams.append("search", params.search);

  const queryString = queryParams.toString();

  return useQuery({
    queryKey: [
      "applications-list",
      params.page,
      params.limit,
      params.trustWalletId,
      params.status,
      params.search,
    ],
    queryFn: () =>
      apiClient.get<ApplicationsListResponse>(
        `${API_ENDPOINTS.APPLICATIONS.LIST}${queryString ? `?${queryString}` : ""}`,
        true,
      ),
  });
}
