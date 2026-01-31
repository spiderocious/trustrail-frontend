import { useMutation } from "@tanstack/react-query";
import { API_CONFIG, API_ENDPOINTS } from "@/shared/constants/api";
import type {
  ApplicationSubmitResponse,
  CustomerApplicationData,
} from "../types";

export function useSubmitApplication() {
  return useMutation({
    mutationFn: async ({
      trustWalletId,
      data,
    }: {
      trustWalletId: string;
      data: CustomerApplicationData;
    }) => {
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("email", data.email);
      formData.append("phoneNumber", data.phoneNumber);
      formData.append("accountNumber", data.accountNumber);
      formData.append("bankCode", data.bankCode);
      formData.append("bvn", data.bvn);

      if (data.bankStatement) {
        formData.append("bankStatement", data.bankStatement);
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.PUBLIC.APPLY(trustWalletId)}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit application");
      }

      const result = await response.json();
      return result.data as ApplicationSubmitResponse;
    },
  });
}
