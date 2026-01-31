import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@shared/helpers/api-client";
import { API_ENDPOINTS } from "@shared/constants/api";
import type {
  TrustWalletInstallmentPlan,
  ApprovalWorkflow,
} from "./use-trust-wallets";

export interface TrustWalletDetails {
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
  __v: number;
}

interface TrustWalletDetailsResponse {
  success: boolean;
  data: TrustWalletDetails;
  message: string;
}

export function useTrustWalletDetails(trustWalletId: string | undefined) {
  return useQuery({
    queryKey: ["trust-wallet", trustWalletId],
    queryFn: () =>
      apiClient.get<TrustWalletDetailsResponse>(
        API_ENDPOINTS.TRUSTWALLETS.GET(trustWalletId!),
        true,
      ),
    enabled: !!trustWalletId,
  });
}
