import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@shared/helpers/api-client";
import { API_ENDPOINTS } from "@shared/constants/api";
import type { TrustWalletDetails } from "./use-trust-wallet-details";

export interface CreateTrustWalletPayload {
  name: string;
  description: string;
  installmentPlan: {
    totalAmount: number;
    downPaymentPercentage: number;
    installmentCount: number;
    frequency: "weekly" | "monthly";
    interestRate: number;
  };
  approvalWorkflow: {
    autoApproveThreshold: number;
    autoDeclineThreshold: number;
    minTrustScore: number;
  };
}

interface CreateTrustWalletResponse {
  success: boolean;
  data: TrustWalletDetails;
  message: string;
}

export function useCreateTrustWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTrustWalletPayload) =>
      apiClient.post<CreateTrustWalletResponse>(
        API_ENDPOINTS.TRUSTWALLETS.CREATE,
        payload,
        true,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trust-wallets"] });
    },
  });
}
