import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@shared/helpers/api-client";
import { API_ENDPOINTS } from "@shared/constants/api";
import { LoginResponse } from "@shared/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, payload),
  });
}
