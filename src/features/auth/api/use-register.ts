import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@shared/helpers/api-client";
import { API_ENDPOINTS } from "@shared/constants/api";
import { RegisterResponse } from "@shared/types";

export interface RegisterPayload {
  businessName: string;
  email: string;
  password: string;
  phoneNumber: string;
  rcNumber: string;
  settlementAccountNumber: string;
  settlementBankCode: string;
  settlementAccountName: string;
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) =>
      apiClient.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, payload),
  });
}
