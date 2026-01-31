import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL, ENDPOINTS } from "@shared/constants/api";

interface ApproveApplicationRequest {
  applicationId: string;
  reason?: string;
}

interface ApproveApplicationResponse {
  success: boolean;
  data: {
    applicationId: string;
    status: string;
    updatedAt: string;
  };
}

async function approveApplication(
  request: ApproveApplicationRequest,
): Promise<ApproveApplicationResponse> {
  const token = localStorage.getItem("authToken");

  const response = await fetch(
    `${API_BASE_URL}/api/applications/${request.applicationId}/approve`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        reason: request.reason,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to approve application");
  }

  return response.json();
}

export function useApproveApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveApplication,
    onSuccess: (data, variables) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({
        queryKey: ["application", variables.applicationId],
      });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["trustWalletAnalytics"] });
    },
  });
}
