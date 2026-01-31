import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/helpers/api-client";
import { API_ENDPOINTS } from "@/shared/constants/api";
import type { PublicTrustWallet } from "../types";

export function usePublicTrustWallet(trustWalletId: string) {
  return useQuery({
    queryKey: ["public-trustwallet", trustWalletId],
    queryFn: async () => {
      const response = await apiClient.get<PublicTrustWallet>(
        API_ENDPOINTS.PUBLIC.TRUSTWALLET(trustWalletId),
        { requiresAuth: false }
      );
      return response;
    },
    enabled: !!trustWalletId,
  });
}
