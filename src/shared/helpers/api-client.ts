// API client helper for making HTTP requests

import { API_CONFIG } from "../constants/api";
import { getToken, clearAuth } from "@features/auth/helpers/token-storage";

interface RequestConfig extends RequestInit {
  requiresAuth?: boolean;
}

interface ApiError {
  success: false;
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: ApiError["details"],
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function request<T>(
  endpoint: string,
  config: RequestConfig = {},
): Promise<T> {
  const { requiresAuth = false, headers = {}, ...restConfig } = config;

  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  if (requiresAuth) {
    const token = getToken();
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...restConfig,
      headers: requestHeaders,
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle 401 Unauthorized
      if (response.status === 401) {
        clearAuth();
        window.location.href = "/login";
      }

      throw new ApiClientError(
        data.error || "Request failed",
        response.status,
        data.details,
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    // Network or other errors
    throw new ApiClientError("Network error. Please check your connection.", 0);
  }
}

export const apiClient = {
  get<T>(endpoint: string, requiresAuth = false): Promise<T> {
    return request<T>(endpoint, { method: "GET", requiresAuth });
  },

  post<T>(endpoint: string, body: unknown, requiresAuth = false): Promise<T> {
    return request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      requiresAuth,
    });
  },

  put<T>(endpoint: string, body: unknown, requiresAuth = false): Promise<T> {
    return request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      requiresAuth,
    });
  },

  delete<T>(endpoint: string, requiresAuth = false): Promise<T> {
    return request<T>(endpoint, { method: "DELETE", requiresAuth });
  },
};
