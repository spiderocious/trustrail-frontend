import { API_ENDPOINTS } from "@shared/constants/api";
import { apiClient } from "@shared/helpers/api-client";
import { useQuery } from "@tanstack/react-query";
import type { PublicTrustWalletResponse } from "../types";

export function usePublicTrustWallet(trustWalletId: string) {
  return useQuery({
    queryKey: ["public-trustwallet", trustWalletId],
    queryFn: async () => {
      const response = await apiClient.get<PublicTrustWalletResponse>(
        API_ENDPOINTS.PUBLIC.TRUSTWALLET(trustWalletId),
        false,
      );
      return response;
    },
    enabled: !!trustWalletId,
  });
}
